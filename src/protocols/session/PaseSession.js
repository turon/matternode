/**
 * Copyright 2022 Project CHIP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *  https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const spake2js = require('spake2')
const crypto = require('crypto')
const EC = require('elliptic').ec
const p256 = new EC('p256')
const ec = p256.curve

const SRC = '../../'
const logger = require(SRC+'util/Logger')
const tracer = require(SRC+'util/Tracer')

const Crypto = require('../../crypto/Crypto')
const SessionProtocolConst = require("./SessionProtocolConst")
const StatusReport = require("./StatusReport")
const { TlvReader } = require(SRC+'tlv/TlvReader')
const { TlvWriter } = require(SRC+'tlv/TlvWriter')
const { TlvParser } = require(SRC+'tlv/TlvParser')
const Message = require(SRC+"message/Message")

/**
 * PaseSession handles the PAKE protocol to establish a secure session based
 * on a shared passcode.
 * 
 * TODO:
 * - [ ] Add timeout for state machine
 * - [ ] Fix state machine to be tolerant to filures
 * - [ ] Properly activate negotiated key for subsequnet session
 */
class PaseSession {
    #secret

    static RESPONSE_TIMEOUT     = 10000
    static PBKDF_ITERATIONS_MIN = 1000
    static PBKDF_ITERATIONS_MAX = 100000
    static DEFAULT_PINCODE      = 20202021

    /// 3.10.3. Computation of transcript TT has:
    /// "Matter PAKE V1 Commissioning"
    static PASE_CONTEXT_SALT = "CHIP PAKE V1 Commissioning" 

    static State = {
        IDLE: 0,
        AWAIT_PBKDF_PARAM_RSP: 1,
        AWAIT_PAKE1: 2,
        AWAIT_PAKE2: 3,
        AWAIT_PAKE3: 4,
    }

    static Role = {
        INITIATOR: 0,
        RESPONDER: 1,
    }

    constructor(sessionMgr)
    {
        this._establishmentExchange = undefined
        this._state = PaseSession.State.IDLE
        this._stateTimeout = undefined
        this._sessionManager = sessionMgr

        // PBKDF parameters -- typically set by Joiner init.
        this._paramPaircode = PaseSession.DEFAULT_PINCODE
        this._paramIterations = PaseSession.PBKDF_ITERATIONS_MIN
        this._paramSalt = "SPAKE2P Key Salt"
        this._paramSaltHex = Buffer.from(this._paramSalt, "utf8").toString("hex")

        this._localRole = PaseSession.Role.INITIATOR
        this._initiatorRandom = undefined
        this._initiatorSessionId = undefined
        this._passcodeId = undefined
        this._responderRandom = undefined
        this._responderSessionId = undefined

        this._pA = undefined
        this._pB = undefined
        this._cA = undefined
        this._cB = undefined

        this._pbkdfRequest = undefined
        this._pbkdfResponse = undefined

        // SPAKE2+ crypto context
        this._spake2 = undefined
        this._spakeContext = undefined
        this._spakeVerifier = undefined
        this._spakeServer = undefined
        this._spakeClient = undefined

        this.#secret = undefined
        this.#secret = undefined
    }

    get Exchange() { return this._establishmentExchange }
    set Exchange(v) { this._establishmentExchange = v }

    setTimeout(interval) {
        var self = this
        this.clearTimeout()
        this._stateTimeout = setTimeout(() => {
            logger.error("PASE: ERROR - Session Establishment Timeout state = "+self._state)
            self.setState(PaseSession.State.IDLE)
        }, interval)
    }

    clearTimeout() {
        if (this._stateTimeout) {
            clearTimeout(this._stateTimeout)
        }
    }

    setState(state) {
        this._state = state
        if (state != PaseSession.State.IDLE) {
            this.setTimeout(PaseSession.RESPONSE_TIMEOUT)
        } else {
            this.clearTimeout()
        }
    }

    static create(exchange, sessionMgr)
    {
        var pase = new PaseSession(sessionMgr)
        pase.Exchange = exchange
        pase.Exchange.isReliable = true
        // Subscribe to responses
        pase.Exchange.on("message", (msg, exchange) => { pase.onExchangeMessage(msg, exchange) })

        return pase
    }

    destroy()
    {
        this.Exchange.removeListener("message", this)
    }

    /**
     * Calculate the PAKEPasscodeVerifier stored on device as defined in 11.19.8.1
     * per Crypto_PAKEValues_Responder procedure defined in 3.10.
     */
    async generateVerifier(iterations = undefined, salt = undefined) {
        if (iterations != undefined) this._paramIterations = iterations
        if (salt != undefined) this._paramSalt = salt

        // ===== SPAKE2 PASSCODE HASH: w0s, w1s =====
        var passcode = Buffer.alloc(4)
        passcode.writeUInt32LE(this._paramPaircode, 0)

        /*** Calc hash manually */
        const keyLen = 80

        var w0sw1s = crypto.pbkdf2Sync(passcode, this._paramSalt, this._paramIterations, keyLen, 'sha256');
        var w0s = w0sw1s.subarray(0, keyLen/2)
        var w1s = w0sw1s.subarray(keyLen/2, keyLen)

        const verifier = await this._spake2.computeVerifierFromSecret(w0s, w1s)
        this._spakeVerifier = verifier

        logger.trace("w0s = "+verifier.w0s.toString("hex"))
        logger.trace("w1s = "+verifier.w1s.toString("hex"))
        logger.trace("w0 = "+verifier.w0.toString("hex"))
        logger.trace("w1 = "+verifier.w1.toString("hex"))
        logger.trace("L = "+verifier.L.toString("hex"))

        return verifier
    }

    /**
     * PASE PBKDF Request message.
     * 
     * pbkdfparamreq-struct => STRUCTURE [ tag-order ]
     * {
     *    initiatorRandom    [1] : OCTET STRING [ length 32 ],
     *    initiatorSessionId [2] : UNSIGNED INTEGER [ range 16-bits ],
     *    passcodeId         [3] : UNSIGNED INTEGER [ length 16-bits ],
     *    hasPBKDFParameters [4] : BOOLEAN,
     *    initiatorMRPParams [5, optional] : mrp-parameter-struct
     * }
     *
     *  mrp-parameter-struct => STRUCTURE [ tag-order ]
     * {
     *    MRP_RETRY_INTERVAL_IDLE    [1, optional] : UNSIGNED INTEGER [ range 16-bits ],
     *    MRP_RETRY_INTERVAL_ACTIVE  [2, optional] : UNSIGNED INTEGER [ range 16-bits ]
     * }
     */
    static TemplateMsgPasePbkdfParamRequest = function(params) {
        return { "type": "struct", "value": [
            { "tag": 1, "type": "Buffer", "value": params.initiatorRandom },
            { "tag": 2, "type": "uint16", "value": params.initiatorSessionId },
            { "tag": 3, "type": "uint16", "value": params.passcodeId },
            { "tag": 4, "type": "boolean", "value": params.hasPbkdfParameters },
            { "tag": 5, "type": "struct", "value": [
                { "tag": 1, "type": "uint32", "value": params.sleepyIdleInterval },
                { "tag": 2, "type": "uint32", "value": params.sleepyActiveInterval },
            ] },

        ]}
    }

    static MapMsgPasePbkdfParamRequest = new Map([
        [1, 'initiatorRandom'],
        [2, 'initiatorSessionId'],
        [3, 'passcodeId'],
        [4, 'hasPbkdfParameters'],
        [5, 'initiatorSedParameters'],
    ])

    /**
     * PASE PBKDF Parameter Response message.
     * 
     * pbkdfparamresp-struct => STRUCTURE [ tag-order ]
     * {
     *   initiatorRandom    [1] : OCTET STRING [ length 32 ],
     *   responderRandom    [2] : OCTET STRING [ length 32 ],
     *   responderSessionId [3] : UNSIGNED INTEGER [ range 16-bits ],
     *   pbkdf_parameters   [4] : Crypto_PBKDFParameterSet,
     *   responderMRPParams [5, optional] : mrp-parameter-struct
     * }
     * 
     * Crypto_PBKDFParameterSet => STRUCTURE [ tag-order ]
     * {
     *   iterations [1] : UNSIGNED INTEGER [ range 32-bits ],
     *   salt [2] : OCTET STRING [ length 16..32 ],
     * }
     * 
     * mrp-parameter-struct => STRUCTURE [ tag-order ]
     * {
     *   MRP_RETRY_INTERVAL_IDLE    [1, optional] : UNSIGNED INTEGER [ range 16-bits ],
     *   MRP_RETRY_INTERVAL_ACTIVE  [2, optional] : UNSIGNED INTEGER [ range 16-bits ]
     * }
     */
    static TemplateMsgPasePbkdfParamResponse = function(params) {
        return { "type": "struct", "value": [
            { "tag": 1, "type": "Buffer", "value": params.initiatorRandom },
            { "tag": 2, "type": "Buffer", "value": params.responderRandom },
            { "tag": 3, "type": "uint16", "value": params.responderSessionId },
            { "tag": 4, "type": "struct", "value": [
                { "tag": 1, "type": "uint16", "value": params.iterations },
                { "tag": 2, "type": "Buffer", "value": params.salt },
            ]},
        ]}
    }

    static MapMsgPasePbkdfParamResponse = new Map([
        [1, 'initiatorRandom'],
        [2, 'responderRandom'],
        [3, 'responderSessionId'],
        [4, 'pbkdfParameters'],
    ])

    /**
     * PASE Pake1 Message.
     * 
     * pakeDissect-1-struct => STRUCTURE [ tag-order ]
     * {
     *   pA [1] : OCTET STRING [ length CRYPTO_PUBLIC_KEY_SIZE_BYTES ],
     * }
     */
    static TemplateMsgPasePake1 = function(params) {
        return { "type": "struct", "value": [
            { "tag": 1, "type": "Buffer", "value": params.pA },
        ]}
    }


    /**
     * Dissect PASE Pake2 message.
     * 
     * pake-2-struct => STRUCTURE [ tag-order ]
     * {
     *   pB [1] : OCTET STRING [ length CRYPTO_PUBLIC_KEY_SIZE_BYTES ],
     *   cB [2] : OCTET STRING [ length CRYPTO_HASH_LEN_BYTES],
     * }
     */
    static TemplateMsgPasePake2 = function(params) {
        return { "type": "struct", "value": [
            { "tag": 1, "type": "Buffer", "value": params.pB },
            { "tag": 2, "type": "Buffer", "value": params.cB },
        ]}
    }


    /**
     * Dissect PASE Pake3 message.
     * 
     * pake-3-struct => STRUCTURE [ tag-order ]
     * {
     *   cA [1] : OCTET STRING [length CRYPTO_HASH_LEN_BYTES],
     * }
     * 
     * sigma-error-enum => UNSIGNED INTEGER [ range 8bits ] {
     *   NoSharedTrustRoots = 0x01,
     *   InvalidParameter = 0x02,
     * }
     */
    static TemplateMsgPasePake3 = function(params) {
        return { "type": "struct", "value": [
            { "tag": 1, "type": "Buffer", "value": params.cA },
        ]}
    }


    /**
     * Compute spake2+ context per spec 3.10.3:
     *
     *   Context := Crypto_Hash("Matter PAKE V1 Commissioning" || PBKDFParamRequest || PBKDFParamResponse)
     */
    computeContext()
    {
        const spakeContextIn = Buffer.concat([
            Buffer.from(PaseSession.PASE_CONTEXT_SALT),
            this._pbkdfRequest,
            this._pbkdfResponse
        ])

        this._spakeContext = crypto.createHash('sha256').update(spakeContextIn).digest()

        return this._spakeContext
    }

    /**
     * Initiate a PASE session as a client to the given host and port.
     * Assumes PaseSession has been initialized with a valid unsecured session and exchange:
     *  
     *    var exchange = theNode.ExchangeManager.newExchange()
     *    var pase = theNode.SessionProtocol.newPase(exchange)
     *    pase.startPase()
     * 
     * @param {*} host 
     * @param {*} port 
     * @param {*} passcode 
     * @returns 
     */
    startPase(host, port, passcode)
    {
        logger.debug("PASE: start handshake")
        if (this._state != PaseSession.State.IDLE) {
            logger.error("PASE: ERROR - invalid state = "+this._state)
            return
        }

        return this.sendPbkdfParamRequest()
    }

    /**
     * Send first message of PASE as client.  Assumes PaseSession has been initialized
     * with a valid unsecured session and exchange:
     *
     *    var exchange = theNode.ExchangeManager.newExchange()
     *    var pase = theNode.SessionProtocol.newPase(exchange)
     *    pase.startPase()
     */
    sendPbkdfParamRequest()
    {
        tracer.begin('PASE client: tx PbkdfParamRequest')

        //this._pbkdfLocalRandomData = Crypto.RandomGetBytes()
        //var pbkdfLocalRandomData = Buffer(0)
        var havePbkdfParameters = false
        var writer = new TlvWriter()

        this._localRole = PaseSession.Role.INITIATOR
        this._initiatorSessionId = Crypto.RandomU16()
        this._initiatorRandom = Crypto.Random(32)
        this._passcodeId = 0

        var params = {
            initiatorRandom: this._initiatorRandom,
            initiatorSessionId: this._initiatorSessionId,
            passcodeId: this._passcodeId,
            havePbkdfParameters: havePbkdfParameters,
            sleepyIdleInterval: 4000,
            sleepyActiveInterval: 300,
        }

        var writer = new TlvWriter()
        var json = PaseSession.TemplateMsgPasePbkdfParamRequest(params)
        var payload = writer.encode(json).Buffer

        this._pbkdfRequest = payload    // Store to generate SPAKE2 context hash

        var msg = new Message()
        msg.ProtocolId = SessionProtocolConst.PROTOCOL_ID
        msg.ProtocolOpcode = SessionProtocolConst.PaseCommand.ParamRequest
        msg.AppPayload = payload

        this.setState(PaseSession.State.AWAIT_PBKDF_PARAM_RSP)
        this.Exchange.sendMessage(msg)

        tracer.end('PASE tx PbkdfParamRequest')
        logger.debug("PASE: sent PBKDF param request")
    }

    onPbkdfParamRequest(msg)
    {
        logger.debug("PASE server: received Param.Req")
        if (this._state != PaseSession.State.IDLE) {
            logger.error("PASE: ERROR - invalid state = "+this._state)
            return
        }
        // TODO(#1): add timeout to return to IDLE state so error doesn't hang state machine forever. 
        // TODO(#2): extend to handle multiple PASE sessions in parallel.

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var tlvJson = reader.decode(tlv).Json
        tlvJson = tlvJson[0].value // Parse empty outer struct container
        TlvParser.mapFields(tlvJson, PaseSession.MapMsgPasePbkdfParamRequest)

        //logger.trace("App payload = "+tlv.toString("hex"))
        //logger.trace(JSON.stringify(tlvJson, null, 2))

        this._initiatorRandom = TlvParser.get(tlvJson, 'initiatorRandom')
        this._initiatorSessionId = TlvParser.get(tlvJson, 'initiatorSessionId')
        this._passcodeId = TlvParser.get(tlvJson, 'passcodeId')

        this._localRole = PaseSession.Role.RESPONDER
        this._pbkdfRequest = tlv    // Store to generate SPAKE2 context hash

        logger.debug("initiatorRandom = "+this._initiatorRandom.toString("hex"))
        logger.debug("sessionId = "+this._initiatorSessionId)
        logger.debug("passcodeId = "+this._passcodeId)

        this.sendPbkdfParamResponse()
    }

    sendPbkdfParamResponse()
    {
        tracer.begin('PASE server: tx PbkdfParamResponse')

        this._responderRandom = Crypto.Random(32)
        this._responderSessionId = Crypto.RandomU16()

        var params = {
            initiatorRandom: this._initiatorRandom.toString("hex"),
            responderRandom: this._responderRandom.toString("hex"),
            responderSessionId: this._responderSessionId,
            iterations: this._paramIterations,
            salt: this._paramSaltHex,
        }

        var writer = new TlvWriter()
        var json = PaseSession.TemplateMsgPasePbkdfParamResponse(params)
        var payload = writer.encode(json).Buffer

        //logger.trace("PASE: sendPbkdfParamResponse:")
        //logger.trace(JSON.stringify(json))
        //logger.trace(payload.length+": "+payload.toString("hex"))

        var msg = new Message()
        msg.ProtocolId = SessionProtocolConst.PROTOCOL_ID
        msg.ProtocolOpcode = SessionProtocolConst.PaseCommand.ParamResponse
        msg.AppPayload = payload

        this._pbkdfResponse = payload    // Store to generate SPAKE2 context hash

        this.setState(PaseSession.State.AWAIT_PAKE1)
        this.Exchange.sendMessage(msg)

        tracer.end('PASE server: tx PbkdfParamResponse')
        logger.debug("PASE server: sent PBKDF param response")
    }

    async onPbkdfParamResponse(msg)
    {
        logger.debug("PASE client: received Param.Rsp")

        var tlv = msg.AppPayload
        this._pbkdfResponse = tlv    // Store to generate SPAKE2 context hash

        var reader = new TlvReader()
        var tlvJson = reader.decode(tlv).Json
        tlvJson = tlvJson[0].value // Parse empty outer struct container
        TlvParser.mapFields(tlvJson, PaseSession.MapMsgPasePbkdfParamResponse)
        this._responderSessionId = TlvParser.get(tlvJson, 'responderSessionId')
        const pbkdfParameters = TlvParser.get(tlvJson, 'pbkdfParameters')
        const iterations = pbkdfParameters[0].value
        const salt = pbkdfParameters[1].value

        this._spake2 = spake2js.spake2Plus({
            suite: 'P256-SHA256-HKDF-HMAC',
            context: this.computeContext(),
        })

        const verifier = await this.generateVerifier(iterations, salt)
        var client = await this._spake2.startClient(verifier)
        this._spakeClient = client

        var pA = client.getMessage()
        this._pA = ec.decodePoint(pA, 'hex').encode('hex')

        logger.debug("PASE: received Param.Rsp")
        this.sendPake1()
    }

    sendPake1()
    {
        tracer.begin('PASE client: tx Pake1')
        
        var params = {
            pA: this._pA,
        }

        var writer = new TlvWriter()
        var json = PaseSession.TemplateMsgPasePake1(params)
        var payload = writer.encode(json).Buffer

        //this._pake1 = payload    // Store to generate SPAKE2 context hash

        var msg = new Message()
        msg.ProtocolId = SessionProtocolConst.PROTOCOL_ID
        msg.ProtocolOpcode = SessionProtocolConst.PaseCommand.Pake1
        msg.AppPayload = payload

        this.setState(PaseSession.State.AWAIT_PAKE2)
        this.Exchange.isAck = 1  // TODO: automate within Exchange
        this.Exchange.sendMessage(msg)

        tracer.end('PASE tx Pake1')
        logger.debug("PASE: sent Pake1")
    }

    async onPake1(msg)
    {
        logger.debug("PASE server: received PAKE1")
        if (this._state != PaseSession.State.AWAIT_PAKE1) {
            logger.error("PASE: ERROR - invalid state = "+this._state)
            return
        }

        // Validate Param Request message
        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        //logger.trace("App payload = "+tlv.toString("hex"))
        //logger.trace(JSON.stringify(result, null, 2))

        this._pA = result[0].value[0].value

        // ===== SPAKE2 INIT WITH CONTEXT HASH =====
        this._spake2 = spake2js.spake2Plus({
            suite: 'P256-SHA256-HKDF-HMAC',
            context: this.computeContext(),
        })

        logger.trace("pA = X = "+this._pA.toString("hex"))

        const verifier = await this.generateVerifier()
        var server = await this._spake2.startServer(verifier)
        this._spakeServer = server
        var pB = server.getMessage()

        this._pB = ec.decodePoint(pB, 'hex').encode('hex')
        this.#secret = server.finish(this._pA)

        // cB := CRYPTO_HMAC(KcB,pA)
        this._cB = server.cipherSuite.mac(this._pA, this.#secret.KcB).toString('hex')
        //this._cB = this.#secret.getConfirmation().toString('hex')     // library seeds mac with transcript TT

        logger.trace("pB = Y = "+this._pB)
        logger.trace("cB = "+this._cB)

        logger.trace("Y = "+server.S.encode('hex').toString('hex'))
        logger.trace("V = "+server.V.encode('hex').toString('hex'))
        logger.trace("Z = "+server.Z.encode('hex').toString('hex'))
        logger.trace("TT = "+server.TT.toString('hex'))

        logger.trace("Ka = "+this.#secret.Ka.toString('hex'))
        logger.trace("Ke = "+this.#secret.Ke.toString('hex'))
        logger.trace("KcA = "+this.#secret.KcA.toString('hex'))
        logger.trace("KcB = "+this.#secret.KcB.toString('hex'))

        this.sendPake2()
    }

    sendPake2()
    {
        tracer.begin('PASE server: tx Pake2')

        var params = {
            pB: this._pB,
            cB: this._cB,
        }

        var writer = new TlvWriter()
        var json = PaseSession.TemplateMsgPasePake2(params)
        var payload = writer.encode(json).Buffer

        logger.debug("PASE: sendPake2:")
        logger.trace(JSON.stringify(json))
        logger.debug(payload.length+": "+payload.toString("hex"))

        var msg = new Message()
        msg.ProtocolId = SessionProtocolConst.PROTOCOL_ID
        msg.ProtocolOpcode = SessionProtocolConst.PaseCommand.Pake2
        msg.AppPayload = payload

        this.setState(PaseSession.State.AWAIT_PAKE3)
        this.Exchange.sendMessage(msg)

        tracer.end('PASE tx Pake2')
        logger.debug("PASE: sent PAKE2")
    }

    async onPake2(msg)
    {
        logger.debug("PASE client: received PAKE2")

        if (this._state != PaseSession.State.AWAIT_PAKE2) {
            logger.error("PASE: ERROR - invalid state = "+this._state)
            return
        }

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        this._pB = result[0].value[0].value
        this._cB = result[0].value[1].value

        const client = this._spakeClient
        this.#secret = this._spakeClient.finish(this._pB)

        // cA := CRYPTO_HMAC(KcA,pB)
        this._cA = client.cipherSuite.mac(this._pB, this.#secret.KcA).toString('hex')

        logger.trace("Received from PASE server:")
        logger.trace("pB = Y = "+this._pB.toString("hex"))
        logger.trace("cB = "+this._cB.toString("hex"))

        logger.trace("PASE client calculated:")
        logger.trace("pA = X = "+this._pA.toString("hex"))
        logger.trace("cA = "+this._cA.toString("hex"))

        logger.trace("X = "+client.T.encode('hex').toString('hex'))
        logger.trace("V = "+client.V.encode('hex').toString('hex'))
        logger.trace("Z = "+client.Z.encode('hex').toString('hex'))
        logger.trace("TT = "+client.TT.toString('hex'))

        logger.trace("Ka = "+this.#secret.Ka.toString('hex'))
        logger.trace("Ke = "+this.#secret.Ke.toString('hex'))
        logger.trace("KcA = "+this.#secret.KcA.toString('hex'))
        logger.trace("KcB = "+this.#secret.KcB.toString('hex'))

        this.sendPake3()
    }

    sendPake3()
    {
        tracer.begin('PASE client: tx Pake3')

        var params = {
            cA: this._cA,
        }

        var writer = new TlvWriter()
        var json = PaseSession.TemplateMsgPasePake3(params)
        var payload = writer.encode(json).Buffer

        //this._pake1 = payload    // Store to generate SPAKE2 context hash

        var msg = new Message()
        msg.ProtocolId = SessionProtocolConst.PROTOCOL_ID
        msg.ProtocolOpcode = SessionProtocolConst.PaseCommand.Pake3
        msg.AppPayload = payload

        this.setState(PaseSession.State.IDLE)
        this.Exchange.sendMessage(msg)

        this.createSecureSession()

        tracer.end('PASE tx Pake3')
        logger.debug("PASE: sent Pake3")
    }

    onPake3(msg)
    {
        logger.debug("PASE server: received PAKE3")

        if (this._state != PaseSession.State.AWAIT_PAKE3) {
            logger.error("PASE: ERROR - invalid state = "+this._state)
            return
        }

        // Validate Param Request message
        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        //logger.trace("App payload = "+tlv.toString("hex"))
        //logger.trace(JSON.stringify(result, null, 2))

        this._cA = result[0].value[0].value

        logger.trace("cA = "+this._cA.toString("hex"))

        // TODO: try / catch
        this.#secret.verifyHash(this._cA)

        StatusReport.sendSuccess(this.Exchange,
            SessionProtocolConst.PROTOCOL_ID,
            SessionProtocolConst.ProtocolStatusReport.SESSION_ESTABLISHMENT_SUCCESS
        )

        this.createSecureSession()

        this.setState(PaseSession.State.IDLE)
    }


    /**
     * Boot-straps the PASE secure session with the derived secret.
     * 
     * PASE Session Key KDF
     * 
     * byte SEKeys_Info[] = "SessionKeys" =
     *      { 0x53, 0x65, 0x73, 0x73, 0x69, 0x6f, 0x6e, 0x4b, 0x65, 0x79, 0x73 }
     * 
     * I2RKey || R2IKey || AttestationChallenge = Crypto_KDF
     * (
     *      inputKey = Ke,
     *      salt = [],
     *      info = SEKeys_Info,
     *      len = 3 * CRYPTO_SYMMETRIC_KEY_LENGTH_BITS
     * )
     * 
     * @param {*} secret
     */
    initPaseSession(session)
    {
        // Generate PASE session key
        var secret = this.#secret.Ke
        var salt = Buffer.alloc(0)
        var info = Buffer.from("SessionKeys", "utf8")
        session.initFromSecret(secret, salt, info)
    }

    /**
     * Creates the new secure session after PASE key negotiation,
     * and injects the negotiated credentials.
     */
    createSecureSession()
    {
        // TODO: move to shell via delegate hook.
        console.log("PASE: Create Session with Secret!!!")

        var session
        if (this._localRole == PaseSession.Role.INITIATOR) {
            session = this._sessionManager.newSession(this._initiatorSessionId, this._responderSessionId)
        } else {
            session = this._sessionManager.newSession(this._responderSessionId, this._initiatorSessionId)
        }
        //session.PeerNodeId = msg.SourceNodeId

        this.initPaseSession(session)
    }

    sendPakeError()
    {
        tracer.begin('PASE tx PakeError')
        logger.debug("PASE: sent PAKE error")
        tracer.end('PASE tx PakeError')
    }

    onPakeError(msg)
    {
    }

    opcodeName(opcode) {
        switch (opcode)
        {
            case SessionProtocolConst.PaseCommand.ParamRequest: return 'PbkdfParamRequest'
            case SessionProtocolConst.PaseCommand.ParamResponse: return 'PbkdfParamResponse'
            case SessionProtocolConst.PaseCommand.Pake1: return  'Pake1'
            case SessionProtocolConst.PaseCommand.Pake2: return 'Pake2'
            case SessionProtocolConst.PaseCommand.Pake3: return 'Pake3'
            case SessionProtocolConst.PaseCommand.PakeError: return 'PakeError'
            case SessionProtocolConst.Command.MrpStandaloneAck: return 'MrpAcK'
            default: return 'Unknown '+opcode
        }
    }

    onExchangeMessage(msg, exchange)
    {
        var opcode = msg.ProtocolOpcode
        var opcodeName = this.opcodeName(opcode)
        logger.debug("PASE Session: on exchange message exchange = " + msg.ExchangeId + " opcode = "+opcode)

        // TODO: verify exchange match for all but 1st message?
        tracer.begin("PASE rx "+opcodeName)
        switch (opcode)
        {
            case SessionProtocolConst.PaseCommand.ParamRequest: this.onPbkdfParamRequest(msg); break;
            case SessionProtocolConst.PaseCommand.ParamResponse: this.onPbkdfParamResponse(msg); break;
            case SessionProtocolConst.PaseCommand.Pake1: this.onPake1(msg); break;
            case SessionProtocolConst.PaseCommand.Pake2: this.onPake2(msg); break;
            case SessionProtocolConst.PaseCommand.Pake3: this.onPake3(msg); break;
            case SessionProtocolConst.PaseCommand.PakeError: this.onPakeError(msg); break;
        }
        tracer.end("PASE rx "+opcodeName)
    }
}

module.exports = PaseSession
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

const MsgCodec = require('./MsgCodec')
const Message = require("./Message")
const SessionCryptoContext = require("./SessionCryptoContext")

const logger = require('../util/Logger')
const tracer = require('../util/Tracer')
const Crypto = require("../crypto/Crypto")

class Session {
    #cryptoContext

    static UNSECURED_SESSION_ID = 0

    constructor(localSessionId = undefined, peerSessionId = undefined, secure = false) 
    {
        this._localSessionId = localSessionId
        this._peerSessionId = peerSessionId
        this._peerNodeId = undefined
        this._peerInfo = undefined   ///< IP:port or BLE address
        this._peerMessageCounter = 0

        this._initiator = false      ///< Choose which key index to use for rx and tx.
        this._lastActivityTimeMs = 0

        this._secure = secure
        this._secureFabricId = undefined
        this._messageCounter = (Crypto.RandomU32() & 0x0FFFFFFF) + 1

        this._metricTxCount = 0
        this._metricRxCount = 0

        this._transport = theNode.Server

        // Private
        if (secure)
        {
            this.#cryptoContext = new SessionCryptoContext()
        }

        tracer.objNew('session obj',{id:localSessionId})
    }

    get PeerInfo() { return this._peerInfo }
    set PeerInfo(v) { this._peerInfo = v }

    get PeerNodeId() { return this._peerNodeId }
    set PeerNodeId(v) { this._peerNodeId = v }

    get PeerSessionId() { return this._peerSessionId }
    set PeerSessionId(v) { this._peerSessionId = v }

    get LocalSessionId() { return this._localSessionId }
    set LocalSessionId(v) { this._localSessionId = v }

    get Transport() { return this._transport }
    set Transport(v) { this._transport = v }

    get IsSecure() { return this._secure }

    get PeerMessageCounter() { return this._peerMessageCounter }
    set PeerMessageCounter(v) { this._peerMessageCounter = v }

    get AttestationChallenge() {
        return this.#cryptoContext.AttestationChallenge
    }

    initFromSecret(secret, salt, info)
    {
        this.#cryptoContext.initFromSecret(secret, salt, info)
    }

    updateActivity()
    {
        this._lastActivityTimeMs = Date.now()
        this._metricRxCount++
    }

    sendMessage(msg)
    {
        msg.MessageFlags = 0
        msg.SecurityFlags = 0
        msg.SessionId = this.PeerSessionId
        msg.MessageCounter = this._messageCounter++
        this._metricTxCount++

        var buf = msg.Decrypted
        logger.debug("Plain:  " + buf.toString('hex'))

        if (msg.isEncrypted()) {
            // Use appropriate session key based on Iflag: I2R or R2I
            var keyIndex = (msg.Iflag) ? 0 : 1 
            var key = this.#cryptoContext._keys[keyIndex]

            buf = MsgCodec.encrypt(msg.Decrypted, key)
            logger.debug("Secure: " + buf.toString('hex'))
            msg.Encrypted = buf
        } else {
            if (msg.Iflag) {
                if (!this.PeerNodeId) {
                    // Allocate a random Source Node ID for the unsecured session
                    // TODO: Confirm reserved ranges are masked out per 4.12.1.1
                    this.PeerNodeId = Crypto.RandomU64()
                }
                msg.Dsiz = Message.DestinationType.Omit
                msg.Sflag = Message.SourceType.NodeId
                msg.SourceNodeId = this.PeerNodeId
            } else if (this.PeerNodeId && !msg.Iflag) {
                // If tracking a peer, automatically set destination to that peer.

                msg.Sflag = Message.SourceType.Omit
                msg.Dsiz = Message.DestinationType.NodeId
                msg.DestinationNodeId = this.PeerNodeId
            }  else {
                log.error("Session: Cannot send unencrypted message without proper peer info")
            }
            buf = msg.Decrypted
        }

        var ipPort = this.PeerInfo.port
        var ipHost = this.PeerInfo.address

        this.Transport.send(buf, ipPort, ipHost)
    }

    decryptMessage(msg)
    {
        if (msg.isUnencrypted()) { return undefined }

        // Use appropriate session key based on Iflag: I2R or R2I
        var buf = msg.Encrypted
        var keyIndex = (this._initiator) ? 1 : 0    // TODO: use direction of session rx
        var key = this.#cryptoContext._keys[keyIndex]
        logger.trace("Using session key ["+keyIndex+"]: " + key.toString('hex'))
        var dmsg = MsgCodec.decrypt(buf, key)

        if (!dmsg) {
            logger.error("Error: message failed authentication")
            return undefined
        }
        msg.Decrypted = dmsg

        return dmsg
    }
}

module.exports = Session
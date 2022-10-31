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

const { assert } = require("elliptic/lib/elliptic/utils")

const SRC = '../../'

const Const = require(SRC+'Const')
const logger = require(SRC+'util/Logger')
const Random = require(SRC+'util/Random')
const Crypto = require(SRC+'crypto/Crypto')
const CertificateTlv = require(SRC+'crypto/CertificateTlv')
const ExampleCerts = require(SRC+'crypto/ExampleCerts')
const { TlvReader } = require(SRC+'tlv/TlvReader')
const { TlvWriter } = require(SRC+'tlv/TlvWriter')
//const CommandPath = require(SRC+"protocols/interaction_model/CommandPath")

/**
 * ClusterOperationalCredentialsServer
 */
class ClusterOperationalCredentialsServer {
    static CLUSTER_NAME = "OPERATIONAL_CREDENTIALS_CLUSTER"
    static CLUSTER_ID = Const.Clusters.OPERATIONAL_CREDENTIALS  // 0x003E

    static CertificateChainType = {
        DacCertificate:                 1,
        PaiCertificate:                 2,
    }

    static Command = {
        AttestationRequest: 0,
        AttestationResponse: 1,
        CertificateChainRequest: 2,
        CertificateChainResponse: 3,
        CsrRequest: 4,
        CsrResponse: 5,
        AddNoc: 6,
        UpdateNoc: 7,
        NocResponse: 8,
        UpdateFabricLabel: 9,
        RemoveFabric: 10,
        AddTrustedRootCertificate: 11,
        RemoveTrustedRootCertificate: 12,
    }

    static Attribute = {
        NOCs: 0,
        Fabrics: 1,
        SupportedFabrics: 2,
        CommissionedFabrics: 3,
        TrustedRootCertificates: 4,
        CurrentFabricIndex: 5,
        GeneratedCommandList: 65528,
        AcceptedCommandList: 65529,
        AttributeList: 65531,
        FeatureMap: 65532,
        ClusterRevision: 65533,
    }

    static CertificateChainType = {
        DacCertificate: 1,          ///< Device Attestation Certificate (DAC)
        PaiCertificate: 2,          ///< Product Attestation Intermediate (PAI) Certificate
    }

    // ============================================
    //              COMMAND TEMPLATES
    // ============================================
    static TemplateCommandAttestationRequest = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.attestationNonce },
        ]
    }
    static TemplateCommandAttestationResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.attestationElements },
          { 'tag': 1, 'type': 'Buffer', 'value': params.attestationSignature },
        ]
    }
    static TemplateCommandCertificateChainRequest = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8', 'value': params.certificateType },
        ]
    }
    static TemplateCommandCertificateChainResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.certificate },
        ]
    }
    static TemplateCommandCsrRequest = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.csrNonce },
        ]
    }
    static TemplateCommandCsrResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.nocsrElements },
          { 'tag': 1, 'type': 'Buffer', 'value': params.attestationSignature },
        ]
    }
    static TemplateCommandAddNOC = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.NOCValue },
          { 'tag': 1, 'type': 'Buffer', 'value': params.ICACValue },
          { 'tag': 2, 'type': 'Buffer', 'value': params.IPKValue },
          { 'tag': 3, 'type': 'chip::NodeId', 'value': params.CaseAdminNode },
          { 'tag': 4, 'type': 'chip::VendorId', 'value': params.AdminVendorId },
        ]
    }
    static TemplateCommandUpdateNOC = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.NOCValue },
          { 'tag': 1, 'type': 'Buffer', 'value': params.ICACValue },
        ]
    }
    static TemplateCommandNocResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8', 'value': params.statusCode },
          { 'tag': 1, 'type': 'uint8', 'value': params.fabricIndex },
          //{ 'tag': 2, 'type': 'chip::CharSpan', 'value': params.debugText },
        ]
    }
    static TemplateCommandUpdateFabricLabel = function(params) {
        return [
          { 'tag': 0, 'type': 'chip::CharSpan', 'value': params.Label },
        ]
    }
    static TemplateCommandRemoveFabric = function(params) {
        return [
          { 'tag': 0, 'type': 'chip::FabricIndex', 'value': params.FabricIndex },
        ]
    }
    static TemplateCommandAddTrustedRootCertificate = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.RootCertificate },
        ]
    }
    static TemplateCommandRemoveTrustedRootCertificate = function(params) {
        return [
          { 'tag': 0, 'type': 'Buffer', 'value': params.TrustedRootIdentifier },
        ]
    }


    // ============================================
    //             ATTRIBUTE TEMPLATES
    // ============================================

    constructor(imManager) {
        this._imManager = imManager
        this._dataVersion = Random.getRandomUint32()

        this._attributes = {
            0: { // ClusterOperationalCredentialsServer.Attribute.NOCs
                "name": "NOCs",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            1: { // ClusterOperationalCredentialsServer.Attribute.Fabrics
                "name": "Fabrics",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            2: { // ClusterOperationalCredentialsServer.Attribute.SupportedFabrics
                "name": "SupportedFabrics",
                "type": "int8u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            3: { // ClusterOperationalCredentialsServer.Attribute.CommissionedFabrics
                "name": "CommissionedFabrics",
                "type": "int8u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            4: { // ClusterOperationalCredentialsServer.Attribute.TrustedRootCertificates
                "name": "TrustedRootCertificates",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            5: { // ClusterOperationalCredentialsServer.Attribute.CurrentFabricIndex
                "name": "CurrentFabricIndex",
                "type": "fabric_idx",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65528: { // ClusterOperationalCredentialsServer.Attribute.GeneratedCommandList
                "name": "GeneratedCommandList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65529: { // ClusterOperationalCredentialsServer.Attribute.AcceptedCommandList
                "name": "AcceptedCommandList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65531: { // ClusterOperationalCredentialsServer.Attribute.AttributeList
                "name": "AttributeList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65532: { // ClusterOperationalCredentialsServer.Attribute.FeatureMap
                "name": "FeatureMap",
                "type": "bitmap32",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65533: { // ClusterOperationalCredentialsServer.Attribute.ClusterRevision
                "name": "ClusterRevision",
                "type": "int16u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
        }
    }


    onCommand(msg, path)
    {
        logger.debug(this.constructor.name+".onCommand "+path.CommandId)
        switch(path.CommandId)
        {
            case ClusterOperationalCredentialsServer.Command.AttestationRequest: this.onAttestationRequest(msg, path); break;
            case ClusterOperationalCredentialsServer.Command.CertificateChainRequest: this.onCertificateChainRequest(msg, path); break;
            case ClusterOperationalCredentialsServer.Command.CsrRequest: this.onCsrRequest(msg, path); break;
            case ClusterOperationalCredentialsServer.Command.AddTrustedRootCertificate: this.onAddTrustedRootCertificate(msg, path); break;
            case ClusterOperationalCredentialsServer.Command.AddNoc: this.onAddNoc(msg, path); break;
        }
    }

    onCertificateChainRequest(msg, commandPath)
    {
        logger.debug(this.constructor.name+".CertificateChainRequest")

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        logger.debug(JSON.stringify(result, null, 2))

        // TODO(#4): Update parsing mechanism
        var certificateType = result[0].value[2].value[0].value[1].value[0].value
        logger.debug("certificateType = "+certificateType)

        var certificate = (certificateType == ClusterOperationalCredentialsServer.CertificateChainType.PaiCertificate) ? 
            ExampleCerts.TEST_PAI_CERTIFICATE : 
            ExampleCerts.TEST_DAC_CERTIFICATE

        this.sendCertificateChainResponse(msg.Exchange, commandPath, certificate)
    }

    sendCertificateChainResponse(exchange, commandPath, certificate)
    {
        logger.debug(this.constructor.name+".sendCertificateChainResponse")

        var params = { certificate }

        var jsonObj = ClusterOperationalCredentialsServer.TemplateCommandCertificateChainResponse(params)
        var commandDataJson = JSON.stringify(jsonObj, null, 2)
        logger.trace(commandDataJson, null, 2)

        commandPath.CommandId = ClusterOperationalCredentialsServer.Command.CertificateChainResponse
        this._imManager.sendInvokeCommandResponseData(exchange, commandPath, jsonObj)
    }

    /**
     attestation-elements => STRUCTURE [ tag-order ]
     {
        certification_declaration[1]      : OCTET STRING,
        attestation_nonce[2]              : OCTET STRING [ length 32 ],
        timestamp[3]                      : UNSIGNED INTEGER [ range 32-bits ],
        firmware_information[4, optional] : OCTET STRING,
     }
     */
     static TemplateAttestationElements = function(params) {
        return { "type": "struct", "value": [
            { 'tag': 1, 'type': 'Buffer', 'value': params.certificationDecl },
            { 'tag': 2, 'type': 'Buffer', 'value': params.attestationNonce },
            { 'tag': 3, 'type': 'uint32', 'value': params.timestamp },
            //{ 'tag': 4, 'type': 'Buffer', 'value': params.firmwareInformation }, // optional
        ]}
    }
    
    onAttestationRequest(msg, commandPath)
    {
        logger.debug(this.constructor.name+".onAttestationRequest")
        var exchange = msg.Exchange

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        // TODO(#4): Update parsing mechanism
        var attestationNonce = result[0].value[2].value[0].value[1].value[0].value
        logger.debug("attestationNonce = "+attestationNonce.toString('hex'))

        commandPath.CommandId = ClusterOperationalCredentialsServer.Command.AttestationResponse
        this.sendAttestationResponse(exchange, commandPath, attestationNonce)
    }

    sendAttestationResponse(exchange, commandPath, attestationNonce) {
        var timestamp = 0
        var certificationDecl = ExampleCerts.TEST_CERTIFICATION_DECLARATION

        var params = { certificationDecl, attestationNonce, timestamp }
        var jsonObj =  ClusterOperationalCredentialsServer.TemplateAttestationElements(params)
        var writer = new TlvWriter()
        var attestationElements = writer.encode(jsonObj).Buffer
        if (attestationElements.length > 900) {
            logger.error('AttestationResponse: attestationElements exceeds size expection '+attestationElements.length+' > 900')
        }

        var daPrivateKey = ExampleCerts.TEST_DAC_PRIVKEY //theNode.Store.DaPrivateKey
        var attestationChallenge = exchange.Session.AttestationChallenge
        var attestationContract = Buffer.concat([attestationElements, attestationChallenge])
        var attestationSignature = Crypto.Sign(attestationContract, daPrivateKey)
        
        params = { attestationElements, attestationSignature }
        jsonObj =  ClusterOperationalCredentialsServer.TemplateCommandAttestationResponse(params)
        commandPath.CommandId = ClusterOperationalCredentialsServer.Command.AttestationResponse
        this._imManager.sendInvokeCommandResponseData(exchange, commandPath, jsonObj)
    }

    onCsrRequest(msg, commandPath)
    {
        logger.debug(this.constructor.name+".onCsrRequest")

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        // TODO(#4): Update parsing mechanism
        var csrNonce = result[0].value[2].value[0].value[1].value[0].value
        logger.debug("csrNonce = "+csrNonce)

        this.sendCsrResponse(msg.Exchange, commandPath, csrNonce)
    }

    /**
     nocsr-elements => STRUCTURE [ tag-order ]
     {
        csr[1]                        : OCTET STRING,
        CSRNonce[2]                   : OCTET STRING [ length 32 ],
        vendor_reserved1[3, optional] : OCTET STRING,
        vendor_reserved2[4, optional] : OCTET STRING,
        vendor_reserved3[5, optional] : OCTET STRING
     }
     */
     static TemplateNocsrElements = function(params) {
        return { 'type': 'struct', 'value': [
            { 'tag': 1, 'type': 'Buffer', 'value': params.csr },
            { 'tag': 2, 'type': 'Buffer', 'value': params.csrNonce },
        ]}
    }

    /**
     * 6.4.6.1. Node Operational Certificate Signing Request (NOCSR) Procedure
     * - Generate a Node Operational Key Pair using Crypto_GenerateKeyPair()
     * - Generate a Certificate Signing Request (CSR) per RFC2986 PKCS #10
     * 
     * 11.18.5.7. NOCSR Information
     * - nocsr_elements_message = nocsr-elements{ CSR: from above, CSRNonce: from CSRRequest }
     * - nocsr_tbs = nocsr_elements_message || attestation_challenge (from PASE/CASE session)
     * - attestation_signature = Crypto_Sign(message = nocsr_tbs, privateKey = Device Attestation Key)
     *
     * @see emberAfOperationalCredentialsClusterCSRRequestCallback
     */
    async sendCsrResponse(exchange, commandPath, csrNonce)
    {
        logger.debug(this.constructor.name+".sendCsrResponse")

        // 6.4.6.1. Step 2a: Generate Operational Key Pair
        const nocKeyPair = Crypto.GenerateKeyPair()

        // 6.4.6.1. Step 2d: Generate CSR
        const csr = await Crypto.GenerateCsr(nocKeyPair.privateKey)
        const csrBuffer = Buffer.from(csr.toString('hex'),'hex')

         // 11.18.5.7. Step 1: Encode nocsr_elements_message
        var params = { csr: csrBuffer, csrNonce }
        var jsonObj =  ClusterOperationalCredentialsServer.TemplateNocsrElements(params)
        var writer = new TlvWriter()
        var nocsrElements = writer.encode(jsonObj).Buffer

        // 11.18.5.7. Step 2: Get AttestationChallenge from session
        var attestationChallenge = exchange.Session.AttestationChallenge

        // 11.18.5.7. Step 3: Concatenate to generate nocsr_tbs
        var nocsrTbs = Buffer.concat([nocsrElements, attestationChallenge])

        // 11.18.5.7. Step 4: Compute attestation_signature
        var daPrivateKey = Buffer.from(theNode.Store.DaPrivateKey, 'hex')
        var attestationSignature = Crypto.Sign(nocsrTbs, daPrivateKey)

        // 11.18.7.6. form the CsrResponse Command
        params = { nocsrElements, attestationSignature }
        jsonObj =  ClusterOperationalCredentialsServer.TemplateCommandCsrResponse(params)
        commandPath.CommandId = ClusterOperationalCredentialsServer.Command.CsrResponse
        this._imManager.sendInvokeCommandResponseData(exchange, commandPath, jsonObj)
    }

    async processRootCa(rootCaTlv) {
        logger.debug("RootCa TLV = "+rootCaTlv.toString('hex'))
        const rootCertReader = new CertificateTlv(rootCaTlv)
        const rootCaCert = await rootCertReader.decode()
        const rootCaCertPem = rootCertReader.toPem(rootCaCert)
        logger.trace("RootCa JSON = "+JSON.stringify(rootCaCert,null,2))
        logger.trace("RootCa PEM = "+rootCaCertPem.toString('hex'))
    }

    onAddTrustedRootCertificate(msg, commandPath)
    {
        logger.debug(this.constructor.name+".onAddTrustedRootCertificate")

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        // TODO(#4): Update parsing mechanism
        var rootCaTlv = result[0].value[2].value[0].value[1].value[0].value
        //this.processRootCa(rootCaTlv).then(() => {
        //    logger.debug("proccessRootCa done")
        //})

        this._imManager.sendInvokeCommandResponseStatus(msg.Exchange, commandPath, 0)
    }

    async proccessNoc(nocTlv) {
        // TODO: Parse NOC for fabricId and nodeId

        const nocCertReader = new CertificateTlv(nocTlv)
        const noc = await nocCertReader.decode()
        logger.trace("NOC = "+JSON.stringify(noc,null,2))

        const fabricId = noc.subjectName.asn[0][0].value
        const nodeId = noc.subjectName.asn[1][0].value
        const rootPublicKey = noc.publicKey.rawData

        logger.trace("FabricId = "+fabricId)
        logger.trace("NodeId = "+nodeId)
        logger.trace("RootPublicKey = "+rootPublicKey.toString('hex'))


        // TODO: Activate Operational Discovery with new credentials
    }

    onAddNoc(msg, commandPath)
    {
        logger.debug(this.constructor.name+".onAddNoc")

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        // TODO(#4): Update parsing mechanism
        var addNocData = result[0].value[2].value[0].value[1].value
                                // ^^ Commands(2)[0].Data(1).

        // TODO: Insert into FabricTable
        const nocTlv = addNocData[0].value
        const icac = addNocData[1].value
        const ipk = addNocData[2].value
        const adminSubjectId = addNocData[3].value
        const adminVendorId = addNocData[3].value

        logger.trace("NOC: "+nocTlv.toString('hex'))

        commandPath.CommandId = ClusterOperationalCredentialsServer.Command.NocResponse
        var status = 0
        var fabricIndex = 1
        this.sendNocResponse(msg.Exchange, commandPath, status, fabricIndex)

        this.proccessNoc(nocTlv).then(() => {
            logger.debug("proccessNoc done")
        })
    }

    sendNocResponse(exchange, commandPath, statusCode, fabricIndex)
    {
        logger.debug(this.constructor.name+".sendNocResponse")

        var params = { statusCode, fabricIndex }

        var jsonObj = ClusterOperationalCredentialsServer.TemplateCommandNocResponse(params)
        var commandDataJson = JSON.stringify(jsonObj, null, 2)
        logger.trace(commandDataJson, null, 2)

        commandPath.CommandId = ClusterOperationalCredentialsServer.Command.NocResponse
        this._imManager.sendInvokeCommandResponseData(exchange, commandPath, jsonObj)
    }

} // class ClusterOperationalCredentialsServer

module.exports = ClusterOperationalCredentialsServer

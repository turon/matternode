/**
 * @license
 * Copyright (c) 2022 Project CHIP Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { ClientRequest } = require("http")

const SRC = "../"
const logger = require(SRC+"util/Logger")
const tracer = require(SRC+"util/Tracer")
const Crypto = require(SRC+"crypto/Crypto")
const { TlvReader } = require(SRC+'tlv/TlvReader')
//const { TlvWriter } = require(SRC+'tlv/TlvWriter')
const CommandPath = require(SRC+"protocols/interaction_model/CommandPath")
const ImConst = require(SRC+"protocols/interaction_model/ImConst")
//const ImCommandMixin  = require(SRC+"protocols/interaction_model/ImCommandMixin")

const ClusterGeneralCommissioning = require(SRC+"clusters/commissioning/ClusterGeneralCommissioning")
//const ClusterGeneralCommissioningServer = require(SRC+"clusters/commissioning/ClusterGeneralCommissioningServer")
const ClusterNetworkCommissioningServer = require(SRC+"clusters/commissioning/ClusterNetworkCommissioningServer")
const ClusterOperationalCredentialsServer = require(SRC+"clusters/operational_credentials/ClusterOperationalCredentialsServer")

class Commissioner {
    static /*enum*/ StageEnum = {
        kError : 0,
        kSecurePairing : 1,              ///< Establish a PASE session with the device.
        kReadCommissioningInfo: 2,       ///< Query General Commissioning Attributes and Network Features.
        kArmFailsafe : 3,                ///< Send ArmFailSafe (0x30:0) command to the device.
        kConfigRegulatory : 4,           ///< Send SetRegulatoryConfig (0x30:2) command to the device.
        kSendPaiCertificateRequest : 5,  ///< Send PAI CertificateChainRequest (0x3E:2) command to the device.
        kSendDacCertificateRequest : 6,  ///< Send DAC CertificateChainRequest (0x3E:2) command to the device.
        kSendAttestationRequest : 7,     ///< Send AttestationRequest (0x3E:0) command to the device.
        kAttestationVerification : 8,    ///< Verify AttestationResponse (0x3E:1) validity.
        kSendOpCertSigningRequest : 9,   ///< Send CSRRequest (0x3E:4) command to the device.
        kValidateCsr : 10,               ///< Verify CSRResponse (0x3E:5) validity.
        kGenerateNocChain : 11,          ///< TLV encode Node Operational Credentials (NOC) chain certs.
        kSendTrustedRootCert : 12,       ///< Send AddTrustedRootCertificate (0x    3E:11) command to the device.
        kSendNoc : 13,                   ///< Send AddNOC (0x3E:6) command to the device.
        kWiFiNetworkSetup : 14,          ///< Send AddOrUpdateWiFiNetwork (0x31:2) command to the device.
        kThreadNetworkSetup : 15,        ///< Send AddOrUpdateThreadNetwork (0x31:3) command to the device.
        kWiFiNetworkEnable : 16,         ///< Send ConnectNetwork (0x31:6) command to the device for the WiFi network.
        kThreadNetworkEnable : 17,       ///< Send ConnectNetwork (0x31:6) command to the device for the Thread network.
        kFindOperational : 18,           ///< Perform operational discovery and establish a CASE session with the device.
        kSendComplete : !9,              ///< Send CommissioningComplete (0x30:4) command to the device.
        kCleanup : 20,                   ///< Call delegates with status, free memory, clear timers and state.
            
        kScanNetworks : 21,              ///< Send ScanNetworks (0x31:0) command to the device.
        kNeedsNetworkCreds : 22,         ///< Setup appropriate network commissioning based on kReadCommissioningInfo response.
    }


    /**
     * Create a new commissioner instance.
     * 
     * @param {Node} node 
     */
    constructor(node, params) {
        this._imManager = node.InteractionModel
        this._node = node

        //this._deviceDelegate = params.deviceDelegate
        //this._pairingDelegate = params.pairingDelegate
        //this._pairingDelegate.on('pairingComplete', this._onPairingComplete)
    
        this._onPairingError = null;
        this._onOperationalCredentialsProvisioningError = null;
        this._onOperationalCredentialsProvisioningComplete = null;
    }

    /**
     * Returns next stage of the state machine give the current one.
     * @param {StageEnum} stage 
     * @returns  {StageEnum} nextStage
     */
    getNextStage(stage) {
        switch (stage) {

            // ================================
            //     CORE COMMISSIONING STAGES
            // ================================
            case Commissioner.StageEnum.kSecurePairing:
                return Commissioner.StageEnum.kReadCommissioningInfo

            case Commissioner.StageEnum.kReadCommissioningInfo: 
                if (this._commissioningInfo.breadcrumbs > 0) {
                    // If the breadcrumb is 0, the failsafe was disarmed.
                    // We failed on network setup or later, the node failsafe 
                    // has not been re-armed and the breadcrumb has not been reset.
                    // Per the spec, we restart from after adding the NOC.
                    return Commissioner.StageEnum.kNeedsNetworkCreds;
                } else {
                    return Commissioner.StageEnum.kArmFailsafe;
                }

            case Commissioner.StageEnum.kArmFailsafe:
                return Commissioner.StageEnum.kConfigRegulatory

            case Commissioner.StageEnum.kNeedsNetworkCreds:
                return Commissioner.StageEnum.kConfigRegulatory

            case Commissioner.StageEnum.kConfigRegulatory:
                return Commissioner.StageEnum.kSendPaiCertificateRequest

            case Commissioner.StageEnum.kSendPaiCertificateRequest:
                return Commissioner.StageEnum.kSendDacCertificateRequest

            case Commissioner.StageEnum.kSendDacCertificateRequest:
                return Commissioner.StageEnum.kSendAttestationRequest

            case Commissioner.StageEnum.kSendAttestationRequest:
                return Commissioner.StageEnum.kAttestationVerification

            case Commissioner.StageEnum.kAttestationVerification:
                return Commissioner.StageEnum.kSendOpCertSigningRequest

            case Commissioner.StageEnum.kSendOpCertSigningRequest:
                return Commissioner.StageEnum.kValidateCsr

            case Commissioner.StageEnum.kValidateCsr:
                return Commissioner.StageEnum.kGenerateNocChain

            case Commissioner.StageEnum.kGenerateNocChain:
                return Commissioner.StageEnum.kSendTrustedRootCert

            case Commissioner.StageEnum.kSendTrustedRootCert:
                return Commissioner.StageEnum.kSendNoc

            case Commissioner.StageEnum.kSendNoc:
                return Commissioner.StageEnum.kFindOperational

            case Commissioner.StageEnum.kFindOperational:
                return Commissioner.StageEnum.kSendComplete

            case Commissioner.StageEnum.kSendComplete:
                return Commissioner.StageEnum.kCleanup
    
            // ================================
            //   NETWORK COMMISSIONING STAGES
            // ================================
            case Commissioner.StageEnum.kNeedsNetworkCreds: break;

            case Commissioner.StageEnum.kScanNetworks:
                return Commissioner.StageEnum.kNeedsNetworkCreds
    
            case Commissioner.StageEnum.kWiFiNetworkSetup: 
                if (this._commissioningInfo.setupThread) {
                    return Commissioner.StageEnum.kThreadNetworkSetup
                }
                return Commissioner.StageEnum.kWiFiNetworkEnable

            case Commissioner.StageEnum.kThreadNetworkSetup:
                if (this._commissioningInfo.setupWifi) {
                    return Commissioner.StageEnum.kWifiNetworkSetup
                }
                return Commissioner.StageEnum.kThreadNetworkEnable

            case Commissioner.StageEnum.kWiFiNetworkEnable:
                if (this._commissioningInfo.setupThread) {
                    return Commissioner.StageEnum.kThreadNetworkEnable
                }
                return Commissioner.StageEnum.kFindOperational

            case Commissioner.StageEnum.kThreadNetworkEnable:
                if (this._commissioningInfo.setupWifi) {
                    return Commissioner.StageEnum.kWiFiNetworkEnable
                }
                return Commissioner.StageEnum.kFindOperational

            // None of these have actual stage, so return error.
            case Commissioner.StageEnum.kCleanup:
            case Commissioner.StageEnum.kError:
            default:
                return Commissioner.StageEnum.kError
        }
    }

    stageSecurePairing() {
        var self = this

        const ipHost = this._device.ipHost
        const ipPort = this._device.ipPort
        const pincode = this._pincode

        // TODO: Simplify initiating exchange on the unsecured client session.
        var exchange = this._node.ExchangeManager.newExchange()
        exchange.Session.Transport = this._node.Client
        exchange.Session.PeerInfo = {
            port: ipPort,
            address: ipHost,
        }
        var pase = this._node.SessionProtocol.newPase(exchange)
        pase.on('onPairingComplete', (session) => { self.onPairingComplete(session) })
        pase.on('onPairingError', () => { self.onPairingError() })
        pase.startPase(ipHost, ipPort, pincode)    
    }

    onPairingComplete(session) {
        // TODO: Send IM command via given secure session.
        logger.info("Commissioner: PASE done")
        const self = this

        this._session = session
        this._exchange = this._node.ExchangeManager.newExchange(session)
        this._exchange.IsReliable = true
        this._exchange.on("message", (msg, exchange) => { self.onExchangeMessage(msg, exchange) })
        this.stageArmFailSafe()

        //this._stage = this.getNextStage(this._stage)
        //this.performStage(this._stage)
    }

    onPairingError() {
        logger.error("Commissioner: PASE error")
    }

    stageReadCommissioningInfo() {

    }

    onCommissioningInfoReport() {
    }

    onExchangeMessage(msg, exchange)
    {
        logger.debug("Commissioner: on exchange message exchange = " + msg.ExchangeId)

        const opcode = msg.ProtocolOpcode
        tracer.begin("Commissioner rx op="+opcode)

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json
        var params = result[0].value
        var commandList = TlvReader.findTag(params, ImConst.InvokeResponseMessage.CommandResponses)

        if (commandList) for (const command of commandList) {
            var pathTlv = TlvReader.findTag(command.value[0].value, ImConst.CommandDataIB.Path)
            var path = new CommandPath(pathTlv)
            path.trace()

            switch (path.ClusterId) {
                case ClusterGeneralCommissioning.CLUSTER_ID:
                    switch (path.CommandId) {
                        case ClusterGeneralCommissioning.Command.ArmFailSafeResponse:
                            this.onArmFailSafeResponse()
                            break
                        case ClusterGeneralCommissioning.Command.SetRegulatoryConfigResponse:
                            this.onConfigRegulatory()
                            break
                        case ClusterGeneralCommissioning.Command.CommissioningCompleteResponse:
                            this.onCommissioningComplete()
                            break;
                    }
                    break;

                case ClusterNetworkCommissioningServer.CLUSTER_ID:
                    switch (path.CommandId) {
                        case ClusterNetworkCommissioningServer.Command.ScanNetworksResponse: break;
                        case ClusterNetworkCommissioningServer.Command.NetworkConfigResponse: break;
                        case ClusterNetworkCommissioningServer.Command.ConnectNetworkResponse: break;
                    }
                    break;

                case ClusterOperationalCredentialsServer.CLUSTER_ID:
                    switch (path.CommandId) {
                        case ClusterOperationalCredentialsServer.Command.AttestationResponse:
                            this.onAttestationResponse()
                            break
                        case ClusterOperationalCredentialsServer.Command.CertificateChainResponse:
                            this.onDacCertificateResponse()
                            break
                        case ClusterOperationalCredentialsServer.Command.CsrResponse:
                            this.onOpCertSigningResponse()
                            break
                        case ClusterOperationalCredentialsServer.Command.NocResponse:
                            //this.onNocResponse()
                            break
                    }
                    break;
            }
            /*
            // CommandPathIB = //0:endpoint/1:cluster/2:comma
            var commandData = TlvReader.findTag(command.value, CommandDataIB.Data)
            logger.trace(JSON.stringify(commandData, null, 2))

            // Dispatch command path w/ commandData
            var clusterClass = Endpoints[path.EndpointId][path.ClusterId]
            logger.debug("Cluster handler = "+clusterClass)

            var cluster = this.ClusterMap[clusterClass]
            if (cluster == undefined) {
                logger.error("ERROR: Cluster handler not found")
            } else {
                cluster.onCommand(msg, path)
            }
            */
        }

        tracer.end("Commissioner rx op="+opcode)
    }

    stageArmFailSafe() {
        logger.debug(this.constructor.name+".stageArmFailSafeRequest")

        /*
        if (this._state != Commissioner.StageEnum.kSecurePairing) {
            logger.error("Commissioner: Unexpected state")
            return
        }
        */
        this._state = Commissioner.StageEnum.kArmFailsafe

        var params = {
            Breadcrumb: Crypto.RandomU32(),
            ExpiryLengthSeconds: 10000,
        }
        var jsonObj = ClusterGeneralCommissioning.TemplateCommandArmFailSafe(params)
        var commandDataJson = JSON.stringify(jsonObj, null, 2)
        logger.trace(commandDataJson, null, 2)

        const command = ClusterGeneralCommissioning.CommandArmFailSafe
        var commandPath = new CommandPath()
        commandPath.EndpointId = 0
        commandPath.ClusterId = command.ClusterId
        commandPath.CommandId = command.CommandId
        this._imManager.sendInvokeCommandRequestData(this._exchange, commandPath, jsonObj)

    }

    onArmFailSafeResponse() {
        if (this._state != Commissioner.StageEnum.kArmFailsafe) {
            logger.error("Commissioner: Unexpected state")
            return
        }
    }

    stageConfigRegulatory() {

    }

    onConfigRegulatory() {
    }

    stageSendPaiCertificateRequest() {

    }

    onPaiCertificateResponse() {

    }

    stageSendDacCertificateRequest() {

    }

    onDacCertificateResponse() {
    }

    stageSendAttestationRequest() {

    }

    onAttestationResponse() {
    }

    stageAttestationVerification() {

    }

    stageSendOpCertSigningRequest() {

    }

    onOpCertSigningResponse() {
    }

    stageValidateCsr() {

    }

    stageGenerateNocChain() {

    }

    stageSendTrustedRootCert() {

    }

    stageSendNoc() {

    }

    stageFindOperational() {

    }

    stageSendComplete() {

    }

    onCommissioningComplete() {
    }

    /**
     * Dispatch work for the current stage of the state machine and await the 
     * transition event that will trigger the next stage.
     * 
     * @param {StageEnum} stage 
     */
    performStage(stage) {
        switch (stage) {

            // ================================
            //     CORE COMMISSIONING STAGES
            // ================================
            case Commissioner.StageEnum.kSecurePairing: return this.stageSecurePairing()
            case Commissioner.StageEnum.kReadCommissioningInfo: return this.stageReadCommissioningInfo()
            case Commissioner.StageEnum.kArmFailsafe: return this.stageArmFailSafe()
            case Commissioner.StageEnum.kNeedsNetworkCreds: return this.stageNeedsNetworkCreds()
            case Commissioner.StageEnum.kConfigRegulatory: return this.stageConfigRegulatory()
            case Commissioner.StageEnum.kSendPaiCertificateRequest: return this.stageSendPaiCertificateRequest()
            case Commissioner.StageEnum.kSendDacCertificateRequest: return this.stageSendDacCertificateRequest()
            case Commissioner.StageEnum.kSendAttestationRequest: return this.stageSendAttestationRequest()
            case Commissioner.StageEnum.kAttestationVerification: return this.stageAttestationVerification()
            case Commissioner.StageEnum.kSendOpCertSigningRequest: return this.stageSendOpCertSigningRequest()
            case Commissioner.StageEnum.kValidateCsr: return this.stageValidateCsr()
            case Commissioner.StageEnum.kGenerateNocChain: return this.stageGenerateNocChain()
            case Commissioner.StageEnum.kSendTrustedRootCert: return this.stageSendTrustedRootCert()
            case Commissioner.StageEnum.kSendNoc: return this.stageSendNoc()
            case Commissioner.StageEnum.kFindOperational: return this.stageFindOperational()
            case Commissioner.StageEnum.kSendComplete: return this.stageSendComplete()
    
            // ================================
            //   NETWORK COMMISSIONING STAGES
            // ================================
            case Commissioner.StageEnum.kNeedsNetworkCreds: return this.stageNeedsNetworkCreds()
            case Commissioner.StageEnum.kScanNetworks: return this.stageScanNetworks()    
            case Commissioner.StageEnum.kWiFiNetworkSetup: return this.stageWiFiNetworkSetup()
            case Commissioner.StageEnum.kThreadNetworkSetup: return this.stageThreadNetworkSetup()
            case Commissioner.StageEnum.kWiFiNetworkEnable: return this.stageWiFiNetworkEnable()
            case Commissioner.StageEnum.kThreadNetworkEnable: return this.stageThreadNetworkEnable()

            // None of these have actual stage, so return error.
            case Commissioner.StageEnum.kCleanup:
            case Commissioner.StageEnum.kError:    
            default:
                return
        }
    }

    /**
     * Commission the given device onto the given fabric.
     * //@param {*} device 
     * @param {*} fabric
     */
    pair(device, pincode, nodeid, fabric) {
        this._device = device
        this._pincode = pincode
        this._device._nodeid = nodeid
        this._device._fabric = fabric
        this._stage = Commissioner.StageEnum.kSecurePairing
        this.performStage(this._stage)
    }
}

module.exports = Commissioner;
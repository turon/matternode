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

const SRC = '../../'

const logger = require(SRC+'util/Logger')
const tracer = require(SRC+'util/Tracer')
const Mixin = require(SRC+'util/Mixin')

//const Message = require(SRC+'message/Message')
//const { TlvReader } = require(SRC+'tlv/TlvReader')
//const { TlvWriter } = require(SRC+'tlv/TlvWriter')

const ImConst = require('./ImConst')
const ImReadMixin = require('./ImReadMixin')
const ImWriteMixin = require('./ImWriteMixin')
const ImCommandMixin = require('./ImCommandMixin')
const ImSubscribeMixin = require('./ImSubscribeMixin')

const ClusterBasicServer = require(SRC+'clusters/basic/ClusterBasicServer')
const ClusterGeneralCommissioningServer = require(SRC+'clusters/commissioning/ClusterGeneralCommissioningServer')
const ClusterNetworkCommissioningServer = require(SRC+'clusters/commissioning/ClusterNetworkCommissioningServer')
const ClusterOperationalCredentialsServer = require(SRC+'clusters/operational_credentials/ClusterOperationalCredentialsServer')


/// ==============================================================================
///     Public InteractionModel protocol class
/// ==============================================================================

class InteractionModel {
    static PROTOCOL_ID = ImConst.PROTOCOL_ID // 0x0001

    /**
     * Constructor for new InteractionModel protocol object.
     * 
     * @param {*} exchangeMgr 
     */
    constructor(exchangeMgr) {
        var self = this

        this._exchangeMgr = exchangeMgr

        logger.debug("Subscribe to protocol id "+InteractionModel.PROTOCOL_ID)
        exchangeMgr.on(Number(InteractionModel.PROTOCOL_ID), (msg, exchange) => { self.onProtocolMessage(msg, exchange) })

        this._clusterMap = {
            "ClusterBasicServer": new ClusterBasicServer(this),
            "ClusterGeneralCommissioningServer": new ClusterGeneralCommissioningServer(this),
            "ClusterNetworkCommissioningServer": new ClusterNetworkCommissioningServer(this),
            "ClusterOperationalCredentialsServer": new ClusterOperationalCredentialsServer(this),
        }
    }

    get ClusterMap() { return this._clusterMap }
    
    opcodeName(opcode) {
        switch (opcode)
        {
            case ImConst.Command.StatusResponse: return 'StatusResponse'
            case ImConst.Command.ReadRequest: return 'ReadRequest'
            case ImConst.Command.SubscribeRequest: return 'SubscribeRequest'
            case ImConst.Command.SubscribeResponse: return 'SubscribeResponse'
            case ImConst.Command.ReportData: return 'ReportData'
            case ImConst.Command.WriteRequest: return 'WriteRequest'
            case ImConst.Command.WriteResponse: return 'WriteResponse'
            case ImConst.Command.CommandRequest: return 'InvokeCommandRequest'
            case ImConst.Command.CommandResponse: return 'InvokeCommandResponse'
            case ImConst.Command.TimedRequest: return 'TimedRequest'
            default: return 'Unknown'
        }
    }

    /**
     * Handles legal, unsolicited messages for this protocol to create the appropriate exchange handlers.
     * 
     * @param {*} msg incoming Message object
     * @param {*} exchange incoming Exchange object
     */
    onProtocolMessage(msg, exchange)
    {
        var opcode = msg.ProtocolOpcode
        var opcodeName = this.opcodeName(opcode)

        logger.debug("Secure Channel: on unsolicited message exchange = " + msg.ExchangeId + " opcode = "+opcode)
        tracer.begin("IM rx "+opcodeName)

        switch (opcode)
        {
            case ImConst.Command.StatusResponse: this.onStatusResponse(msg); break;
            case ImConst.Command.ReadRequest: this.onReadRequest(msg); break;
            case ImConst.Command.SubscribeRequest: this.onSubscribeRequest(msg); break;
            case ImConst.Command.SubscribeResponse: this.onSubscribeResponse(msg); break;
            case ImConst.Command.ReportData: this.onReportData(msg); break;
            case ImConst.Command.WriteRequest: this.onWriteRequest(msg); break;
            case ImConst.Command.WriteResponse: this.onWriteResponse(msg); break;
            case ImConst.Command.CommandRequest: this.onInvokeCommandRequest(msg); break;
            case ImConst.Command.CommandResponse: this.onInvokeCommandResponse(msg); break;
            case ImConst.Command.TimedRequest: this.onTimedRequest(msg); break;

            default:
                tracer.end("IM rx "+opcodeName)
                logger.debug("Error: Illegal IM opcode = "+opcode)
                return
        }

        tracer.end("IM rx "+opcodeName)
    }

    onStatusResponse(msg) {
        logger.debug('IM: onStatusResponse')
    }
}

Mixin.extend(InteractionModel, ImReadMixin)
Mixin.extend(InteractionModel, ImWriteMixin)
Mixin.extend(InteractionModel, ImCommandMixin)
Mixin.extend(InteractionModel, ImSubscribeMixin)

module.exports = InteractionModel

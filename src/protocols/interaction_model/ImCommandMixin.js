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

const Message = require(SRC+'message/Message')
const { TlvReader } = require(SRC+'tlv/TlvReader')
const { TlvWriter } = require(SRC+'tlv/TlvWriter')

const ImConst = require('./ImConst')
const CommandPath = require('./CommandPath')

const Endpoints = require('../../../zzz_generated/Endpoints.json')

/// ==============================================================================
///     Module scoped tag maps from specification
/// ==============================================================================


class ImCommandMixin
{
    // ================================================================================
    //                                  IM SERVER
    // ================================================================================

    onInvokeCommandRequest(msg) {
        logger.debug("IM: onInvokeCommandRequest")

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        logger.trace(JSON.stringify(result, null, 2))

        // Validate Command Request
        var params = result[0].value
        var suppressResponse = TlvReader.findTag(params, ImConst.InvokeRequestMessage.SuppressResponse)
        var timedRequest = TlvReader.findTag(params, ImConst.InvokeRequestMessage.TimedRequest)
        var commandList = TlvReader.findTag(params, ImConst.InvokeRequestMessage.CommandList)

        commandList.forEach(command => {
            // CommandPathIB = //0:endpoint/1:cluster/2:command
            var pathTlv = TlvReader.findTag(command.value, ImConst.CommandDataIB.Path)
            var path = new CommandPath(pathTlv)
            path.trace()

            var commandData = TlvReader.findTag(command.value, ImConst.CommandDataIB.Data)
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
        })
    }

    sendInvokeCommandResponseRaw(exchange, commandPayload) {
        logger.debug("IM: sendInvokeCommandResponse")
        tracer.begin('IM tx InvokeCommandResponse')

        var msg = new Message()
        msg.ProtocolId = ImConst.PROTOCOL_ID
        msg.ProtocolOpcode = ImConst.Command.CommandResponse
        msg.AppPayload = commandPayload

        exchange.sendMessage(msg)
        tracer.end('IM tx InvokeCommandResponse')
    }

    static TemplateMsgCommandResponseStatus = function(params) {
        var json = { "type": "struct", "value": [
            { "tag": ImConst.InvokeResponseMessage.SuppressResponse, "type": "boolean", "value": params.supressedResponse },
            { "tag": ImConst.InvokeResponseMessage.CommandResponses, "type": "array", "value": [ // InvokeResponseIBs []
                { "type": "struct", "value": [                                           // Anonymous array entry
                    { "tag": ImConst.InvokeResponseIB.Status, "type": "struct", "value": [       // CommandStatusIB
                        params.commandPath.template(ImConst.CommandStatusIB.Path),               // CommandPathIB
                        { "tag": ImConst.CommandStatusIB.Status, "type": "struct", "value": [    // StatusIB
                            { "tag": ImConst.StatusIB.Status, "value": params.commandStatus },
                        ]}
                    ]}
                ]}
            ]},
            { "tag": ImConst.CommonAction.ImRevision, "type": "uint8", "value": ImConst.IM_VERSION }, // Add IM version
        ]}
        return json
    }

    sendInvokeCommandResponseStatus(exchange, commandPath, statusCode) {
        logger.debug("IM: sendInvokeCommandResponseStatus")

        var params = {
            suppressResponse: false,
            commandPath: commandPath,
            commandStatus: statusCode
        }

        var writer = new TlvWriter()
        var json = ImCommandMixin.TemplateMsgCommandResponseStatus(params)
        var payload = writer.encode(json).Buffer

        logger.trace(JSON.stringify(json, null, 2))

        this.sendInvokeCommandResponseRaw(exchange, payload)
    }

    static TemplateMsgCommandResponseData = function(params) {
        var json = { "type": "struct", "value": [
            { "tag": InvokeResponseMessage.SuppressResponse, "type": "boolean", "value": params.suppressResponse },
            { "tag": InvokeResponseMessage.CommandResponses, "type": "array", "value": [ // InvokeResponseIBs []
                { "type": "struct", "value": [                                           // Anonymous array entry
                    { "tag": InvokeResponseIB.Data, "type": "struct", "value": [         // CommandDataIB
                        params.commandPath.template(CommandDataIB.Path),                 // CommandPathIB
                        { "tag": ImConst.CommandDataIB.Data, "type": "struct", "value": params.commandData },
                    ]}
                ]}
            ]},
            { "tag": ImConst.CommonAction.ImRevision, "type": "uint8", "value": ImConst.IM_VERSION }, // Add IM version
        ]}
        return json
    }

    sendInvokeCommandResponseData(exchange, commandPath, commandData) {
        logger.debug("IM: sendInvokeCommandResponseStatus")

        var params = {
            suppressResponse: false,
            commandPath: commandPath,
            commandData: commandData
        }

        var writer = new TlvWriter()
        var json = ImCommandMixin.TemplateMsgCommandResponseData(params)
        var payload = writer.encode(json).Buffer

        logger.trace(JSON.stringify(json, null, 2))

        this.sendInvokeCommandResponseRaw(exchange, payload)
    }

    onInvokeCommandResponse(msg) {
        logger.debug("IM: onInvokeCommandResponse")
    }

    // ================================================================================
    //                                  IM CLIENT
    // ================================================================================

    sendInvokeCommandRequestRaw(exchange, commandPayload) {
        logger.debug("IM: sendInvokeCommandRequest")
        tracer.begin('IM tx InvokeCommandRquest')

        var msg = new Message()
        msg.ProtocolId = ImConst.PROTOCOL_ID
        msg.ProtocolOpcode = ImConst.Command.CommandRequest
        msg.AppPayload = commandPayload

        exchange.sendMessage(msg)
        tracer.end('IM tx InvokeCommandRequest')
    }

    static TemplateMsgCommandRequestData = function(params) {
        var json = { "type": "struct", "value": [
            { "tag": ImConst.InvokeRequestMessage.SuppressResponse, "type": "boolean", "value": params.suppressResponse },
            { "tag": ImConst.InvokeRequestMessage.TimedRequest, "type": "boolean", "value": params.timedRequest },
            { "tag": ImConst.InvokeRequestMessage.CommandList, "type": "array", "value": [ // CommandDataIBs []
                { "type": "struct", "value": [                                           // Anonymous array entry
                    params.commandPath.template(ImConst.CommandDataIB.Path),                 // CommandPathIB
                    { "tag": ImConst.CommandDataIB.Data, "type": "struct", "value": params.commandData }, // CommandFields
                ]}
            ]},
            { "tag": ImConst.CommonAction.ImRevision, "type": "uint8", "value": ImConst.IM_VERSION }, // Add IM version
        ]}
        return json
    }

    sendInvokeCommandRequestData(exchange, commandPath, commandData) {
        logger.debug("IM: sendInvokeCommandResponseStatus")

        var params = {
            suppressResponse: false,
            timedRequest: false,
            commandPath: commandPath,
            commandData: commandData
        }

        var writer = new TlvWriter()
        var json = ImCommandMixin.TemplateMsgCommandRequestData(params)
        var payload = writer.encode(json).Buffer

        logger.trace(JSON.stringify(json, null, 2))

        this.sendInvokeCommandRequestRaw(exchange, payload)
    }

}

module.exports = ImCommandMixin
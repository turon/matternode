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

const StatusIB = {
    Status: 0,          ///< uint32
    ClusterStatus: 1,   ///< uint32
}

const CommandDataIB = {
    Path:  0,           ///< CommandPathIB
    Data:  1,           ///< variable
}

const CommandStatusIB = {
    Path:    0,         ///< CommandPathIB
    Status:  1,         ///< StatusIB
}

const InvokeResponseIB = {
    Data:    0,         ///< CommandDataIB
    Status:  1,         ///< CommandStatusIB
}

const InvokeRequestMessage = {
    SuppressResponse: 0,    ///< Boolean
    TimedRequest: 1,        ///< Boolean
    CommandList: 2,         ///< CommandDataIB[]
}

const InvokeResponseMessage = {
    SuppressResponse: 0,    ///< Boolean
    CommandResponses: 1,    ///< InvokeResponseIB[]
}

class ImCommandMixin
{
    onInvokeCommandRequest(msg) {
        logger.debug("IM: onInvokeCommandRequest")

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        logger.trace(JSON.stringify(result, null, 2))

        // Validate Command Request
        var params = result[0].value
        var suppressResponse = TlvReader.findTag(params, InvokeRequestMessage.SuppressResponse)
        var timedRequest = TlvReader.findTag(params, InvokeRequestMessage.TimedRequest)
        var commandList = TlvReader.findTag(params, InvokeRequestMessage.CommandList)

        commandList.forEach(command => {
            // CommandPathIB = //0:endpoint/1:cluster/2:command
            var pathTlv = TlvReader.findTag(command.value, CommandDataIB.Path)
            var path = new CommandPath(pathTlv)
            path.trace()

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
            { "tag": InvokeResponseMessage.SuppressResponse, "type": "boolean", "value": params.supressedResponse },
            { "tag": InvokeResponseMessage.CommandResponses, "type": "array", "value": [ // InvokeResponseIBs []
                { "type": "struct", "value": [                                           // Anonymous array entry
                    { "tag": InvokeResponseIB.Status, "type": "struct", "value": [       // CommandStatusIB
                        params.commandPath.template(CommandStatusIB.Path),               // CommandPathIB
                        { "tag": CommandStatusIB.Status, "type": "struct", "value": [    // StatusIB
                            { "tag": StatusIB.Status, "value": params.commandStatus },
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
                        { "tag": CommandDataIB.Data, "type": "struct", "value": params.commandData },
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
}

module.exports = ImCommandMixin
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
const Const = require(SRC+'Const')

class ImConst {
    static PROTOCOL_ID = Const.Protocols.INTERACTION_MODEL // 0x0001
    static IM_VERSION = 1

    static RESP_MAX = 900           ///< Maximum  size of an IM response payload [bytes]

    static Command = {
        StatusResponse:                 1,
        ReadRequest:                    2,
        SubscribeRequest:               3,
        SubscribeResponse:              4,
        ReportData:                     5,
        WriteRequest:                   6,
        WriteResponse:                  7,
        CommandRequest:                 8,
        CommandResponse:                9,
        TimedRequest:                  10,
    }

    /// Common Action Information tags
    static CommonAction = {
        ImRevision:                   0xFF,
    }

    static TemplateMsgStatusResponse = function(params) {
        return { "type": "struct", "value": [
            { "tag": 0, "type": "uint32", "value": param.status },
        ]}
    }

    static TemplateMsgReadRequest = function(params) {
        return { "type": "struct", "value": []}
    }

    static TemplateMsgReportData =  function(params) {
        return { "type": "struct", "value": []}
    }

    static TemplateMsgSubscribeRequest = function(params) {
        return { "type": "struct", "value": []}
    }

    static TemplateMsgSubscribeResponse = function(params) {
        return { "type": "struct", "value": [
            { "tag": 0, "type": "uint32", "value": params.subscriptionId },
            { "tag": 1, "type": "uint16", "value": params.minInterval },
            { "tag": 2, "type": "uint16", "value": params.maxInterval },
        ]}
    }

    static TemplateMsgWriteRequest = function(params) {
        return { "type": "struct", "value": [
            { "tag": 0, "type": "uint32", "value": params.status },
        ]}
    }

    static TemplateMsgWriteResponse = function(params) {
        return { "type": "struct", "value": [
        ]}
    }

    static TemplateMsgTimedRequest = function(params) {
        return{ "type": "struct", "value": [
            { "tag": 0, "type": "uint16", "value": params.contextTag },
        ]}
    }

    static CommandPathIB = function(params) {
        return { "tag": "{{tag}}", "type": "list", "value": [
            { "tag": 0, "type": "uint16", "value": params.endpointId },
            { "tag": 1, "type": "uint16", "value": params.clusterId },
            { "tag": 2, "type": "uint16", "value": params.commandId },
        ]}
    }

    static CommandDataIB = function(params) {
        return { "type": "struct", "value": [
            { "tag": 0, "type": "list", "value": [
                { "tag": 0, "type": "uint16", "value": params.endpointId },
                { "tag": 1, "type": "uint16", "value": params.clusterId },
                { "tag": 2, "type": "uint16", "value": params.commandId },
            ]},
            { "tag": 1, "type": "struct", "value": "{{commandData}}" },
        ]}
    }

    static CommandStatusIB = function(params) {
        return { "type": "struct", "value": [
            { "tag": 0, "type": "list", "value": [
                { "tag": 0, "type": "uint16", "value": params.endpointId },
                { "tag": 1, "type": "uint16", "value": params.clusterId },
                { "tag": 2, "type": "uint16", "value": params.commandId },
            ]},
            { "tag": 1, "type": "struct", "value": "{{commandData}}" },
        ]}
    }

}

module.exports = ImConst
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
const logger = require(SRC+'util/Logger')
const Random = require(SRC+'util/Random')
const { TlvReader } = require(SRC+'tlv/TlvReader')
const { TlvWriter } = require(SRC+'tlv/TlvWriter')
const CommandPath = require(SRC+"protocols/interaction_model/CommandPath")
const InteractionModel = require(SRC+"protocols/interaction_model/InteractionModel")

/**
 * ClusterNetworkCommissioningServer
 */
class ClusterNetworkCommissioningServer
{
    static CLUSTER_NAME = 'NETWORK_COMMISSIONING_CLUSTER'
    static CLUSTER_ID = 0x0031

    static Command = {
        ScanNetworks: 0,
        ScanNetworksResponse: 1,
        AddOrUpdateWiFiNetwork: 2,
        AddOrUpdateThreadNetwork: 3,
        RemoveNetwork: 4,
        NetworkConfigResponse: 5,
        ConnectNetwork: 6,
        ConnectNetworkResponse: 7,
        ReorderNetwork: 8,
    }

    static Attribute = {
        MaxNetworks: 0,
        Networks: 1,
        ScanMaxTimeSeconds: 2,
        ConnectMaxTimeSeconds: 3,
        InterfaceEnabled: 4,
        LastNetworkingStatus: 5,
        LastNetworkID: 6,
        LastConnectErrorValue: 7,
        GeneratedCommandList: 65528,
        AcceptedCommandList: 65529,
        AttributeList: 65531,
        FeatureMap: 65532,
        ClusterRevision: 65533,
    }


    // ============================================
    //              COMMAND TEMPLATES
    // ============================================
    static TemplateCommandScanNetworks = function(params) {
        return [
          { 'tag': 0, 'type': 'chip::ByteSpan', 'value': params.Ssid },
          { 'tag': 1, 'type': 'uint64_t', 'value': params.Breadcrumb },
        ]
    }
    static TemplateCommandScanNetworksResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8_t', 'value': params.NetworkingStatus },
          { 'tag': 1, 'type': 'chip::CharSpan', 'value': params.DebugText },
          { 'tag': 2, 'type': 'array', 'value': [] }, // params.WiFiScanResults
          { 'tag': 3, 'type': 'array', 'value': [] }, // params.ThreadScanResults
        ]
    }
    static TemplateCommandAddOrUpdateWiFiNetwork = function(params) {
        return [
          { 'tag': 0, 'type': 'chip::ByteSpan', 'value': params.Ssid },
          { 'tag': 1, 'type': 'chip::ByteSpan', 'value': params.Credentials },
          { 'tag': 2, 'type': 'uint64_t', 'value': params.Breadcrumb },
        ]
    }
    static TemplateCommandAddOrUpdateThreadNetwork = function(params) {
        return [
          { 'tag': 0, 'type': 'chip::ByteSpan', 'value': params.OperationalDataset },
          { 'tag': 1, 'type': 'uint64_t', 'value': params.Breadcrumb },
        ]
    }
    static TemplateCommandRemoveNetwork = function(params) {
        return [
          { 'tag': 0, 'type': 'chip::ByteSpan', 'value': params.NetworkID },
          { 'tag': 1, 'type': 'uint64_t', 'value': params.Breadcrumb },
        ]
    }
    static TemplateCommandNetworkConfigResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8_t', 'value': params.NetworkingStatus },
          { 'tag': 1, 'type': 'chip::CharSpan', 'value': params.DebugText },
          { 'tag': 2, 'type': 'uint8_t', 'value': params.NetworkIndex },
        ]
    }
    static TemplateCommandConnectNetwork = function(params) {
        return [
          { 'tag': 0, 'type': 'chip::ByteSpan', 'value': params.NetworkID },
          { 'tag': 1, 'type': 'uint64_t', 'value': params.Breadcrumb },
        ]
    }
    static TemplateCommandConnectNetworkResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8_t', 'value': params.NetworkingStatus },
          { 'tag': 1, 'type': 'chip::CharSpan', 'value': params.DebugText },
          { 'tag': 2, 'type': 'int32_t', 'value': params.ErrorValue },
        ]
    }
    static TemplateCommandReorderNetwork = function(params) {
        return [
          { 'tag': 0, 'type': 'chip::ByteSpan', 'value': params.NetworkID },
          { 'tag': 1, 'type': 'uint8_t', 'value': params.NetworkIndex },
          { 'tag': 2, 'type': 'uint64_t', 'value': params.Breadcrumb },
        ]
    }

    // ============================================
    //             ATTRIBUTE TEMPLATES
    // ============================================

    constructor(imManager) {
        this._imManager = imManager
        this._dataVersion = Random.getRandomUint32()

        this._attributes = {
            0: { // ClusterNetworkCommissioningServer.Attribute.MaxNetworks
                "name": "MaxNetworks",
                "type": "int8u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            1: { // ClusterNetworkCommissioningServer.Attribute.Networks
                "name": "Networks",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            2: { // ClusterNetworkCommissioningServer.Attribute.ScanMaxTimeSeconds
                "name": "ScanMaxTimeSeconds",
                "type": "int8u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            3: { // ClusterNetworkCommissioningServer.Attribute.ConnectMaxTimeSeconds
                "name": "ConnectMaxTimeSeconds",
                "type": "int8u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 0
            },
            4: { // ClusterNetworkCommissioningServer.Attribute.InterfaceEnabled
                "name": "InterfaceEnabled",
                "type": "boolean",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            5: { // ClusterNetworkCommissioningServer.Attribute.LastNetworkingStatus
                "name": "LastNetworkingStatus",
                "type": "NetworkCommissioningStatus",
                "nullable": true,
                "nosubscribe": true,
                "readonly": true,
            },
            6: { // ClusterNetworkCommissioningServer.Attribute.LastNetworkID
                "name": "LastNetworkID",
                "type": "octet_string",
                "nullable": true,
                "nosubscribe": true,
                "readonly": true,
            },
            7: { // ClusterNetworkCommissioningServer.Attribute.LastConnectErrorValue
                "name": "LastConnectErrorValue",
                "type": "int32s",
                "nullable": true,
                "nosubscribe": true,
                "readonly": true,
            },
            65528: { // ClusterNetworkCommissioningServer.Attribute.GeneratedCommandList
                "name": "GeneratedCommandList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65529: { // ClusterNetworkCommissioningServer.Attribute.AcceptedCommandList
                "name": "AcceptedCommandList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65531: { // ClusterNetworkCommissioningServer.Attribute.AttributeList
                "name": "AttributeList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65532: { // ClusterNetworkCommissioningServer.Attribute.FeatureMap
                "name": "FeatureMap",
                "type": "bitmap32",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 4,
            },
            65533: { // ClusterNetworkCommissioningServer.Attribute.ClusterRevision
                "name": "ClusterRevision",
                "type": "int16u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
        }
    }

    getAttribute(id)
    {
        return this._attributes[id]
    }

    onCommand(msg, path)
    {
        logger.debug(this.constructor.name+".onCommand "+path.CommandId)
        switch(path.CommandId)
        {
            case ClusterGeneralCommissioning.Command.ScanNetworks: this.onScanNetworks(msg, path); break;
            case ClusterGeneralCommissioning.Command.ScanNetworkResponse: this.onScanNetworkResponse(msg, path); break;
            case ClusterGeneralCommissioning.Command.AddOrUpdateWiFiNetwork: this.onAddOrUpdateWiFiNetwork(msg, path); break;
        }
    }

    onScanNetworks(msg, commandPath)
    {
        logger.debug(this.constructor.name+'.onScanNetworks')

        this._imManager.sendInvokeCommandResponseStatus(exchange, commandPath, 0)
    }

    onScanNetworkResponse(msg, commandPath)
    {
        logger.debug(this.constructor.name+'.onScanNetworkResponse')

        this._imManager.sendInvokeCommandResponseStatus(exchange, commandPath, 0)
    }

    onAddOrUpdateWiFiNetwork(msg, commandPath)
    {
        logger.debug(this.constructor.name+'.onAddOrUpdateWiFiNetwork')

        this._imManager.sendInvokeCommandResponseStatus(exchange, commandPath, 0)
    }
}


module.exports = ClusterNetworkCommissioningServer

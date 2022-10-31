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
 * ClusterGeneralCommissioningServer
 */
class ClusterGeneralCommissioningServer
{
    static CLUSTER_NAME = "GENERAL_COMMISSIONING_CLUSTER";
    static CLUSTER_ID = Const.Clusters.GENERAL_COMMISSIONING  // 0x0030

    // ========== Command Enums ==========

    static CommissioningError = {
        OK: 0,
        ValueOutsideRange: 1,
        InvalidAuthentication: 2,
        NoFailSafe: 3,
        BusyWithOtherAdmin: 4,
    }

    // ========== Command Tags ==========

    static ArmFailSafe = {
        ExpiryLengthSeconds: 0,     // uint16
        Breadcrumb : 1              // uint64
    }

    static ArmFailSafeResponse = {
        ErrorCode: 0,              // CommissioningError
        DebugText : 1              // string
    }


    static Command = {
        ArmFailSafe: 0,
        ArmFailSafeResponse: 1,
        SetRegulatoryConfig: 2,
        SetRegulatoryConfigResponse: 3,
        CommissioningComplete: 4,
        CommissioningCompleteResponse: 5,
    }

    static Attribute = {
        Breadcrumb: 0,
        BasicCommissioningInfo: 1,
        RegulatoryConfig: 2,
        LocationCapability: 3,
        SupportsConcurrentConnection: 4,
        GeneratedCommandList: 65528,
        AcceptedCommandList: 65529,
        AttributeList: 65531,
        FeatureMap: 65532,
        ClusterRevision: 65533,
    }

    static RegulatoryLocationType = {
        Indoor: 0,
        Outdoor: 1,
        IndoorOutdoor: 2,
    }

    // ============================================
    //              COMMAND TEMPLATES
    // ============================================
    static TemplateCommandArmFailSafe = function(params) {
        return [
          { 'tag': 0, 'type': 'uint16_t', 'value': params.ExpiryLengthSeconds },
          { 'tag': 1, 'type': 'uint64_t', 'value': params.Breadcrumb },
        ]
    }
    static TemplateCommandArmFailSafeResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8_t', 'value': params.ErrorCode },
          { 'tag': 1, 'type': 'string', 'value': params.DebugText },
        ]
    }
    static TemplateCommandSetRegulatoryConfig = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8_t', 'value': params.NewRegulatoryConfig },
          { 'tag': 1, 'type': 'string', 'value': params.CountryCode },
          { 'tag': 2, 'type': 'uint64_t', 'value': params.Breadcrumb },
        ]
    }
    static TemplateCommandSetRegulatoryConfigResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8_t', 'value': params.ErrorCode },
          { 'tag': 1, 'type': 'string', 'value': params.DebugText },
        ]
    }
    static TemplateCommandCommissioningComplete = function(params) {
        return []
    }
    static TemplateCommandCommissioningCompleteResponse = function(params) {
        return [
          { 'tag': 0, 'type': 'uint8_t', 'value': params.ErrorCode },
          { 'tag': 1, 'type': 'string', 'value': params.DebugText },
        ]
    }

    // ============================================
    //             ATTRIBUTE TEMPLATES
    // ============================================

    constructor(imManager) {
        this._imManager = imManager
        this._dataVersion = Random.getRandomUint32()

        this._attributes = {
            0: { // ClusterGeneralCommissioningServer.Attribute.Breadcrumb
                "name": "Breadcrumb",
                "type": "int64u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 0,
            },
            1: { // ClusterGeneralCommissioningServer.Attribute.BasicCommissioningInfo
                "name": "BasicCommissioningInfo",
                "type": "BasicCommissioningInfo",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": { type:"struct", value:[
                    { tag: 0, value: 60 },
                    { tag: 1, value: 900 },
                ]}
            },
            2: { // ClusterGeneralCommissioningServer.Attribute.RegulatoryConfig
                "name": "RegulatoryConfig",
                "type": "RegulatoryLocationType",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 0,
            },
            3: { // ClusterGeneralCommissioningServer.Attribute.LocationCapability
                "name": "LocationCapability",
                "type": "RegulatoryLocationType",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 2,
            },
            4: { // ClusterGeneralCommissioningServer.Attribute.SupportsConcurrentConnection
                "name": "SupportsConcurrentConnection",
                "type": "boolean",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65528: { // ClusterGeneralCommissioningServer.Attribute.GeneratedCommandList
                "name": "GeneratedCommandList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65529: { // ClusterGeneralCommissioningServer.Attribute.AcceptedCommandList
                "name": "AcceptedCommandList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65531: { // ClusterGeneralCommissioningServer.Attribute.AttributeList
                "name": "AttributeList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65532: { // ClusterGeneralCommissioningServer.Attribute.FeatureMap
                "name": "FeatureMap",
                "type": "bitmap32",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 0,
            },
            65533: { // ClusterGeneralCommissioningServer.Attribute.ClusterRevision
                "name": "ClusterRevision",
                "type": "int16u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 0,
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
            case ClusterGeneralCommissioningServer.Command.ArmFailSafe: this.onArmFailSafe(msg, path); break;
            case ClusterGeneralCommissioningServer.Command.SetRegulatoryConfig: this.onSetRegulatoryConfig(msg, path); break;
            case ClusterGeneralCommissioningServer.Command.CommissioningComplete: this.onCommissioningComplete(msg, path); break;
        }
    }

    onArmFailSafe(msg, commandPath)
    {
        logger.debug(this.constructor.name+".ArmFailSafe")

        this.sendArmFailSafeResponse(msg.Exchange, commandPath)
    }

    sendArmFailSafeResponse(exchange, commandPath)
    {
        logger.debug(this.constructor.name+".sendArmFailSafeResponse")

        var params = {
            ErrorCode: 0,
            DebugText: ""
        }

        var jsonObj = ClusterGeneralCommissioningServer.TemplateCommandArmFailSafeResponse(params)
        var commandDataJson = JSON.stringify(jsonObj, null, 2)
        logger.trace(commandDataJson, null, 2)

        commandPath.CommandId = ClusterGeneralCommissioningServer.Command.ArmFailSafeResponse
        this._imManager.sendInvokeCommandResponseData(exchange, commandPath, jsonObj)
    }

    onSetRegulatoryConfig(msg, commandPath)
    {
        logger.debug(this.constructor.name+".onSetRegulatoryConfig")

        this.sendSetRegulatoryConfigResponse(msg.Exchange, commandPath)
    }

    sendSetRegulatoryConfigResponse(exchange, commandPath) 
    {
        logger.debug(this.constructor.name+".sendSetRegulatoryConfigResponse")

        var params = {
            ErrorCode: 0,
            DebugText: ""
        }

        var jsonObj = ClusterGeneralCommissioningServer.TemplateCommandSetRegulatoryConfigResponse(params)
        var commandDataJson = JSON.stringify(jsonObj, null, 2)
        logger.trace(commandDataJson, null, 2)

        commandPath.CommandId = ClusterGeneralCommissioningServer.Command.SetRegulatoryConfigResponse
        this._imManager.sendInvokeCommandResponseData(exchange, commandPath, jsonObj)
    }

    onCommissioningComplete(msg, commandPath)
    {
        logger.debug(this.constructor.name+".onCommissioningComplete")

        this.sendCommissioningCompleteResponse(msg.Exchange, commandPath)
    }

    sendCommissioningCompleteResponse(exchange, commandPath) 
    {
        logger.debug(this.constructor.name+".sendCommissioningCompleteResponse")

        this._imManager.sendInvokeCommandResponseStatus(exchange, commandPath, 0)
    }

}


module.exports = ClusterGeneralCommissioningServer

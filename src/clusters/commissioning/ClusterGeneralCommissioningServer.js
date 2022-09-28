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
const Random = require(SRC+'util/Random')
const { TlvReader } = require(SRC+'tlv/TlvReader')
const { TlvWriter } = require(SRC+'tlv/TlvWriter')
const CommandPath = require(SRC+"protocols/interaction_model/CommandPath")
const InteractionModel = require(SRC+"protocols/interaction_model/InteractionModel")
const ClusterGeneralCommissioning = require("./ClusterGeneralCommissioning")

/**
 * ClusterGeneralCommissioningServer
 */
class ClusterGeneralCommissioningServer
{
    // ============================================
    //             ATTRIBUTE TEMPLATES
    // ============================================

    constructor(imManager) {
        this._imManager = imManager
        this._dataVersion = Random.getRandomUint32()

        this._attributes = {
            0: { // ClusterGeneralCommissioning.Attribute.Breadcrumb
                "name": "Breadcrumb",
                "type": "int64u",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 0,
            },
            1: { // ClusterGeneralCommissioning.Attribute.BasicCommissioningInfo
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
            2: { // ClusterGeneralCommissioning.Attribute.RegulatoryConfig
                "name": "RegulatoryConfig",
                "type": "RegulatoryLocationType",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 0,
            },
            3: { // ClusterGeneralCommissioning.Attribute.LocationCapability
                "name": "LocationCapability",
                "type": "RegulatoryLocationType",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 2,
            },
            4: { // ClusterGeneralCommissioning.Attribute.SupportsConcurrentConnection
                "name": "SupportsConcurrentConnection",
                "type": "boolean",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65528: { // ClusterGeneralCommissioning.Attribute.GeneratedCommandList
                "name": "GeneratedCommandList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65529: { // ClusterGeneralCommissioning.Attribute.AcceptedCommandList
                "name": "AcceptedCommandList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65531: { // ClusterGeneralCommissioning.Attribute.AttributeList
                "name": "AttributeList",
                "type": "array",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
            },
            65532: { // ClusterGeneralCommissioning.Attribute.FeatureMap
                "name": "FeatureMap",
                "type": "bitmap32",
                "nullable": false,
                "nosubscribe": true,
                "readonly": true,
                "value": 0,
            },
            65533: { // ClusterGeneralCommissioning.Attribute.ClusterRevision
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
            case ClusterGeneralCommissioning.Command.ArmFailSafe: this.onArmFailSafe(msg, path); break;
            case ClusterGeneralCommissioning.Command.SetRegulatoryConfig: this.onSetRegulatoryConfig(msg, path); break;
            case ClusterGeneralCommissioning.Command.CommissioningComplete: this.onCommissioningComplete(msg, path); break;
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

        var jsonObj = ClusterGeneralCommissioning.TemplateCommandArmFailSafeResponse(params)
        var commandDataJson = JSON.stringify(jsonObj, null, 2)
        logger.trace(commandDataJson, null, 2)

        commandPath.CommandId = ClusterGeneralCommissioning.Command.ArmFailSafeResponse
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

        var jsonObj = ClusterGeneralCommissioning.TemplateCommandSetRegulatoryConfigResponse(params)
        var commandDataJson = JSON.stringify(jsonObj, null, 2)
        logger.trace(commandDataJson, null, 2)

        commandPath.CommandId = ClusterGeneralCommissioning.Command.SetRegulatoryConfigResponse
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

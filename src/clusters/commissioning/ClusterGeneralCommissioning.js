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

/**
 * ClusterGeneralCommissioning common constants shared by client and server.
 */
class ClusterGeneralCommissioning
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
    //              COMMAND DEFINITIONS
    // ============================================
    static CommandArmFailSafe = {
        ClusterId: ClusterGeneralCommissioning.CLUSTER_ID,
        CommandId: ClusterGeneralCommissioning.Command.ArmFailSafe,
        SendTemplate: ClusterGeneralCommissioning.TemplateCommandArmFailSafe
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
}


module.exports = ClusterGeneralCommissioning

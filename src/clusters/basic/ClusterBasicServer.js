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
 * ClusterBasicServer
 */
 class ClusterBasicServer
 {
     static CLUSTER_NAME = 'BASIC_CLUSTER'
     static CLUSTER_ID = 0x0028
 
     static Command = {
         MfgSpecificPing: 0,
     }
 
     static Attribute = {
         DataModelRevision: 0,
         VendorName: 1,
         VendorID: 2,
         ProductName: 3,
         ProductID: 4,
         NodeLabel: 5,
         Location: 6,
         HardwareVersion: 7,
         HardwareVersionString: 8,
         SoftwareVersion: 9,
         SoftwareVersionString: 10,
         ManufacturingDate: 11,
         PartNumber: 12,
         ProductURL: 13,
         ProductLabel: 14,
         SerialNumber: 15,
         LocalConfigDisabled: 16,
         Reachable: 17,
         UniqueID: 18,
         CapabilityMinima: 19,
         GeneratedCommandList: 65528,
         AcceptedCommandList: 65529,
         AttributeList: 65531,
         FeatureMap: 65532,
         ClusterRevision: 65533,
     }
 
 
     // ============================================
     //              COMMAND TEMPLATES
     // ============================================
     static TemplateCommandMfgSpecificPing = function(params) {
         return [
         ]
     }
 
     // ============================================
     //             ATTRIBUTE TEMPLATES
     // ============================================
 
     constructor(imManager) {
         this._imManager = imManager
         this._dataVersion = Random.getRandomUint32()
 
         this._attributes = {
             0: { // ClusterBasicServer.Attribute.DataModelRevision
                 "name": "DataModelRevision",
                 "type": "int16u",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             1: { // ClusterBasicServer.Attribute.VendorName
                 "name": "VendorName",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             2: { // ClusterBasicServer.Attribute.VendorID
                 "name": "VendorID",
                 "type": "vendor_id",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
                 "value": 0xFFF1,

             },
             3: { // ClusterBasicServer.Attribute.ProductName
                 "name": "ProductName",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             4: { // ClusterBasicServer.Attribute.ProductID
                 "name": "ProductID",
                 "type": "int16u",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
                 "value": 0x8001,
             },
             5: { // ClusterBasicServer.Attribute.NodeLabel
                 "name": "NodeLabel",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             6: { // ClusterBasicServer.Attribute.Location
                 "name": "Location",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             7: { // ClusterBasicServer.Attribute.HardwareVersion
                 "name": "HardwareVersion",
                 "type": "int16u",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             8: { // ClusterBasicServer.Attribute.HardwareVersionString
                 "name": "HardwareVersionString",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             9: { // ClusterBasicServer.Attribute.SoftwareVersion
                 "name": "SoftwareVersion",
                 "type": "int32u",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             10: { // ClusterBasicServer.Attribute.SoftwareVersionString
                 "name": "SoftwareVersionString",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             11: { // ClusterBasicServer.Attribute.ManufacturingDate
                 "name": "ManufacturingDate",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             12: { // ClusterBasicServer.Attribute.PartNumber
                 "name": "PartNumber",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             13: { // ClusterBasicServer.Attribute.ProductURL
                 "name": "ProductURL",
                 "type": "long_char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             14: { // ClusterBasicServer.Attribute.ProductLabel
                 "name": "ProductLabel",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             15: { // ClusterBasicServer.Attribute.SerialNumber
                 "name": "SerialNumber",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             16: { // ClusterBasicServer.Attribute.LocalConfigDisabled
                 "name": "LocalConfigDisabled",
                 "type": "boolean",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             17: { // ClusterBasicServer.Attribute.Reachable
                 "name": "Reachable",
                 "type": "boolean",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             18: { // ClusterBasicServer.Attribute.UniqueID
                 "name": "UniqueID",
                 "type": "char_string",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             19: { // ClusterBasicServer.Attribute.CapabilityMinima
                 "name": "CapabilityMinima",
                 "type": "CapabilityMinimaStruct",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             65528: { // ClusterBasicServer.Attribute.GeneratedCommandList
                 "name": "GeneratedCommandList",
                 "type": "array",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             65529: { // ClusterBasicServer.Attribute.AcceptedCommandList
                 "name": "AcceptedCommandList",
                 "type": "array",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             65531: { // ClusterBasicServer.Attribute.AttributeList
                 "name": "AttributeList",
                 "type": "array",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             65532: { // ClusterBasicServer.Attribute.FeatureMap
                 "name": "FeatureMap",
                 "type": "bitmap32",
                 "nullable": false,
                 "nosubscribe": true,
                 "readonly": true,
             },
             65533: { // ClusterBasicServer.Attribute.ClusterRevision
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
 
     /**
      * Dispatches incoming commands for this cluster to the correct handler.
      */
     onCommand(msg, path)
     {
         console.log(this.constructor.name+".onCommand "+path.CommandId)
         switch(path.CommandId)
         {
             case ClusterBasicServer.Command.MfgSpecificPing: this.onMfgSpecificPing(msg, path); break;
         }
     }
 
     // ============================================
     //              COMMAND HANDLERS
     // ============================================
     onMfgSpecificPing(msg, commandPath)
     {
         console.log(this.constructor.name+".onMfgSpecificPing")
         this._imManager.sendInvokeCommandResponseStatus(exchange, commandPath, 0)
     }
 
 }

 module.exports = ClusterBasicServer
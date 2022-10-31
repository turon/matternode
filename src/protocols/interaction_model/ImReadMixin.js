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
const AttributePath = require('./AttributePath')

const Endpoints = require('../../../zzz_generated/Endpoints.json')


const ReadRequestMessage = {
    AttributeRequests: 0,   ///< AttributePathIB[]
    EventRequests: 1,       ///< EventPathIB[]
    EventFilters: 2,        ///< EventFilterIB[]
    FabricFiltered: 3,      ///< Boolean
    DataVersionFilters: 4,  ///< DataVersionFilterIB[]
}

const ReportDataMessage = {
    //SuppressResponse: 0,    ///< Boolean
    SubscriptionID: 0,      ///< uint32
    AttributeReports: 1,    ///< AttributeReportIB[]
    EventReports: 2,        ///< EventReportIB[]
    MoreChunkedMessages: 3, ///< Boolean
}

class ImReadMixin
{

    getAttributeOnEndpoint(endpointId, path) {
        var clusterClass = Endpoints[endpointId][path.ClusterId]
        if (clusterClass == undefined) return null
        logger.trace("  ==> /EP"+endpointId+"/"+clusterClass)

        var cluster = this.ClusterMap[clusterClass]
        if (cluster == undefined) return null

        var attr = cluster.getAttribute(path.AttributeId)
        logger.trace(attr)

        return attr
    }

    /**
     * Write a ReportData for the given attribute to the given path.
     * 
     * @param {TlvWriter} writer 
     * @param {*} attr 
     * @param {AttributePath} path 
     */
    reportAttribute(writer, attr, path) {
        writer.putStructStart()                 // AttributeReportIB = {
        writer.putStructStart(1)                //   AttributeDataIB (1) = {
        writer.putUnsignedInt(0x79cea838, 0)    //     DataVersion (0) = 0x79cea838,    // pull from cluster
        path.serialize(writer, 1)               //     AttributePathIB (1) = { ... },
        writer.put(attr.value, 2)               //     Data (2) = <<value>>,
        //writer.putUnsignedInt(0, 2)           //     Data (2) = 0,
        writer.putContainerEnd()                //   } AttributeDataIB
        writer.putContainerEnd()                // } AttributeReportIB
    }

    onReadRequest(msg) {
        logger.debug("IM: onReadRequest")

        var tlv = msg.AppPayload
        var reader = new TlvReader()
        var result = reader.decode(tlv).Json

        logger.trace(JSON.stringify(result, null, 2))

        // Validate Command Request
        var params = result[0].value
        var attrList = TlvReader.findTag(params, ReadRequestMessage.AttributeRequests)
        //var eventList = TlvReader.findTag(params, ReadRequestMessage.EventRequests)

        tracer.begin('IM tx ReportData')

        // Parse and build response
        var writer = new TlvWriter()
        writer.putStructStart()                                      // { payload
        writer.putArrayStart(ReportDataMessage.AttributeReports)     // [ AttributeReportIBs (1)

        attrList.forEach(entry => {
            // AttributePathIB = //1:node/2:endpoint/3:cluster/4:attr/5:listIndex
            var path = new AttributePath(entry.value)
            path.trace()

            if (path.EndpointId != undefined) {
                // Direct EP# lookup
                var attr = this.getAttributeOnEndpoint(path.EndpointId, path)
                if (attr != null) this.reportAttribute(writer, attr, path)
            } else {
                // Wildcard EP* handling
                for (var key in Endpoints) {
                    key = Number(key)
                    var attr = this.getAttributeOnEndpoint(key, path)
                    if (attr == null) continue
                    path.EndpointId = key
                    this.reportAttribute(writer, attr, path)
                }
            }
        })

        writer.putContainerEnd()    // ] AttributeReportIBs
        writer.putContainerEnd()    // } payload
        var payload = writer.Buffer

        var rsp = new Message()
        rsp.ProtocolId = ImConst.PROTOCOL_ID
        rsp.ProtocolOpcode = ImConst.Command.ReportData
        rsp.AppPayload = payload

        msg.Exchange.sendMessage(rsp)
        tracer.end('IM tx ReportData')
    }

    onReportData(msg) {
        logger.debug("IM: onReportData")
    }
}

module.exports = ImReadMixin
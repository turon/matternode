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
const { TlvReader } = require(SRC+'tlv/TlvReader')
const { TlvWriter } = require(SRC+'tlv/TlvWriter')


const AttributePathIB = {
    EnableTagCompression: 0,        ///< Boolean
    Node: 1,                        ///< uint64
    Endpoint: 2,                    ///< uint16
    Cluster: 3,                     ///< uint32
    Attribute: 4,                   ///< uint16
    ListIndex: 5                    ///< uint16, nullable
}

class AttributePath {
    constructor(pathTlv = undefined) {
        if (pathTlv != undefined) {
            this.EnableTagCompression = TlvReader.findTag(pathTlv, AttributePathIB.EnableTagCompression)
            this.NodeId = TlvReader.findTag(pathTlv, AttributePathIB.Node)
            this.EndpointId = TlvReader.findTag(pathTlv, AttributePathIB.Endpoint)
            this.ClusterId = TlvReader.findTag(pathTlv, AttributePathIB.Cluster)
            this.AttributeId = TlvReader.findTag(pathTlv, AttributePathIB.Attribute)
        }
    }

    get EnableTagCompression() { return this._tagCompression }
    get NodeId() { return this._nodeId }
    get EndpointId() { return this._endpointId }
    get ClusterId() { return this._clusterId }
    get AttributeId() { return this._attributeId }

    set EnableTagCompression(v) { this._tagCompression = v }
    set NodeId(v) { this._nodeId = v }
    set EndpointId(v) { this._endpointId = v }
    set ClusterId(v) { this._clusterId = v }
    set AttributeId(v) { this._attributeId = v }

    /**
     * Write out as TLV format.
     *
     * Example:
     *      AttributePathIB = //1:node/2:endpoint/3:cluster/4:attr/5:listIndex
     *
     *      AttributePathIB (1) =
     *      {
     *        Endpoint (2) = 0x0,
     *        Cluster (3) = 0x31,
     *        Attribute (4) = 0x0000_0003,
     *      }
     *
     * @param {TlvWriter} writer    TlvWriter object to encode path to
     * @param {Number} tag          TLV tag to use for AttributePathIB
     */
    serialize(writer, tag=1) {
        writer.putListStart(tag)     // { AttributePathIB (tag)
        if (this.NodeId      != undefined) { writer.putUnsignedInt(this.NodeId,      AttributePathIB.Node) }
        if (this.EndpointId  != undefined) { writer.putUnsignedInt(this.EndpointId,  AttributePathIB.Endpoint) }
        if (this.ClusterId   != undefined) { writer.putUnsignedInt(this.ClusterId,   AttributePathIB.Cluster) }
        if (this.AttributeId != undefined) { writer.putUnsignedInt(this.AttributeId, AttributePathIB.Attribute) }
        writer.putContainerEnd()     // } AttributePathIB
    }

    toString() {
        var pathNode = (this.NodeId == undefined) ? "" : "/N"+this.NodeId
        var pathEndpointId = (this.EndpointId == undefined) ? "/EP*" : "/EP"+this.EndpointId
        var pathStr = pathNode + pathEndpointId + "/C"+this.ClusterId+"/Attr"+this.AttributeId
        return pathStr
    }

    trace() {
        if (logger.level != 'trace') return
        var pathStr = this.toString()
        tracer.emit("AttrPath = "+pathStr)
        logger.trace("AttrPath = "+pathStr)
    }
}

module.exports = AttributePath
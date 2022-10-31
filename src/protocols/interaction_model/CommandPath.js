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

const CommandPathIB = {
    Endpoint: 0,
    Cluster: 1,
    Command: 2
}

class CommandPath {
    constructor(pathTlv = undefined) {
        if (pathTlv != undefined) {
            this.EndpointId = TlvReader.findTag(pathTlv, CommandPathIB.Endpoint)
            this.ClusterId = TlvReader.findTag(pathTlv, CommandPathIB.Cluster)
            this.CommandId = TlvReader.findTag(pathTlv, CommandPathIB.Command)
        }
    }

    get EndpointId() { return this._endpointId }
    get ClusterId() { return this._clusterId }
    get CommandId() { return this._commandId }

    set EndpointId(v) { this._endpointId = v }
    set ClusterId(v) { this._clusterId = v }
    set CommandId(v) { this._commandId = v }

    /**
     * Write out as TLV binary format.
     *
     * Example:
     *      CommandPathIB = //0:endpoint/1:cluster/2:command
     *
     *      CommandPathIB (0) =
     *      {
     *        EndpointId (0) = 0x0,
     *        ClusterId (1) = 0x30,
     *        CommandId (2) = 0x0,
     *      }
     *
     * @param {TlvWriter} writer    TlvWriter object to encode path to
     * @param {Number} tag          TLV tag to use for AttributePathIB
     */
     serialize(writer, tag=0) {
        writer.putListStart(tag)     // { CommandPathIB (tag)
        if (this.EndpointId  != undefined) { writer.putUnsignedInt(this.EndpointId, CommandPathIB.Endpoint) }
        if (this.ClusterId   != undefined) { writer.putUnsignedInt(this.ClusterId,  CommandPathIB.Cluster) }
        if (this.CommandId   != undefined) { writer.putUnsignedInt(this.AttributeId,  CommandPathIB.Command) }
        writer.putContainerEnd()     // } CommandPathIB
    }

    /**
     * Write out as CommandPathIB javascript object.
     */
    template(tag=0) {
        return { "tag": tag, "type": "list", "value": [        // CommandPathIB
            { "tag": CommandPathIB.Endpoint, "type": "uint16", "value": this.EndpointId },
            { "tag": CommandPathIB.Cluster, "type": "uint16", "value": this.ClusterId },
            { "tag": CommandPathIB.Command, "type": "uint16", "value": this.CommandId },
        ]}
    }

    toString() {
        var pathEndpointId = (this.EndpointId == undefined) ? "/EP*" : "/EP"+this.EndpointId
        var pathStr = pathEndpointId + "/C"+this.ClusterId+"/Cmd"+this.CommandId
        return pathStr
    }

    /**
     * Write this path's contents to logger.trace():
     *      TRACE: CommandPath = /EP0/C48/Cmd0
     */
    trace() {
        if (logger.level != 'trace') return
        var pathStr = this.toString()
        tracer.emit("CommandPath = "+pathStr)
        logger.trace("CommandPath = "+pathStr)
    }
}

module.exports = CommandPath
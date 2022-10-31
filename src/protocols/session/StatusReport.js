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

const Message = require("../../message/Message")
const SessionProtocolConst = require ("./SessionProtocolConst")
class StatusReport {
    static PROTOCOL_ID = SessionProtocolConst.PROTOCOL_ID
    static OPCODE = SessionProtocolConst.Command.StatusReport

    static GeneralCode = {
        SUCCESS:            0,  ///< Operation completed successfully.
        FAILURE:            1,  ///< Generic failure, additional details may be included in the protocol specific status.
        BAD_PRECONDITION:   2,  ///< Operation was rejected by the system because the system is in an invalid state.
        OUT_OF_RANGE:       3,  ///< A value was out of a required range
        BAD_REQUEST:        4,  ///< A request was unrecognized or malformed
        UNSUPPORTED:        5,  ///< An unrecognized or unsupported request was received
        UNEXPECTED:         6,  ///< A request was not expected at this time
        RESOURCE_EXHAUSTED: 7,  ///< Insufficient resources to process the given request
        BUSY:               8,  ///< Device is busy and cannot handle this request at this time
        TIMEOUT:            9,  ///< A timeout occurred
        CONTINUE:           10, ///< Context-specific signal to proceed
        ABORTED:            11, ///< Failure, may be due to a concurrency error.
        INVALID_ARGUMENT:   12, ///< An invalid/unsupported argument was provided
        NOT_FOUND:          13, ///< Some requested entity was not found
        ALREADY_EXISTS:     14, ///< The sender attempted to create something that already exists
        PERMISSION_DENIED:  15, ///< The sender does not have sufficient permissions to execute the requested operations.
        DATA_LOSS:          16, ///< Unrecoverable data loss or corruption has occurred.
    }

    /**
     * Send a Status Report with the given payload format:
     *
     * +----------+--------------+------------------------------------------------------
     * | SIZE     | FIELD        | DESCRIPTION
     * | [bytes]  |              |
     * |----------|--------------|------------------------------------------------------
     * |    2     | GeneralCode  |
     * |    4     | ProtocolId   | Protocol-Specific Status
     * |    2     | ProtocolCode | Protocol-Specific Status
     * | Variable | ProtocolData | Optional Protocol-Specific TLV, MAY be empty
     * +----------+--------------+------------------------------------------------------
     *
     * @param {*} exchange Exchange to send status report to
     * @param {*} payload Buffer with preformatted status report message (per spec above)
     */
    static send(exchange, payload)
    {
        var msg = new Message()
        msg.ProtocolId = StatusReport.PROTOCOL_ID
        msg.ProtocolOpcode = StatusReport.OPCODE

        msg.AppPayload = payload
        exchange.sendMessage(msg)
    }

    static sendStatus(exchange, generalCode, protocolId, protocolCode, protocolData = undefined)
    {
        var payload = Buffer.alloc(8)

        payload.writeUint16LE(generalCode)
        payload.writeUint32LE(protocolId)
        payload.writeUint16LE(protocolCode)

        if (protocolData != undefined) {
            payload = Buffer.concat([payload, protocolData])
        }

        StatusReport.send(exchange, payload)
    }

    static sendSuccess(exchange, protocolId, protocolCode, protocolData = undefined)
    {
        StatusReport.sendStatus(exchange, StatusReport.GeneralCode.SUCCESS,
                                protocolId, protocolCode, protocolData)
    }
}

module.exports = StatusReport
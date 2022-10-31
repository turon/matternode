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

const SessionProtocolConst = require("./SessionProtocolConst")
const PaseSession = require("./PaseSession")

class SessionProtocol {

    /**
     * Constructor for SessionProtocol manager.
     * Note: Unlike regular protocol managers, SessionProtocol is given access to the SessionManager,
     * as PaseSession and CaseSession create new Session objects with negotiated keys.
     * 
     * @param {*} exchangeMgr The ExchangeManager singleton.
     * @param {*} sessionMgr The SessionManager singleton.
     */
    constructor(exchangeMgr, sessionMgr) {
        var self = this

        this._exchangeMgr = exchangeMgr
        this._sessionMgr = sessionMgr
        this._paseSessions = []

        this._pairingCodes = {}

        console.log("Subscribe to protocol id "+SessionProtocolConst.PROTOCOL_ID)
        exchangeMgr.on(Number(SessionProtocolConst.PROTOCOL_ID), (msg, exchange) => { self.onProtocolMessage(msg, exchange) })
    }

    pairingCodeAdd(pairingCode) {
        this._pairingCodes[pairingCode] = true
    }

    pairingCodeRemove(pairingCode) {
        this._pairingCodes[pairingCode] = undefined
    }


    getPase(exchange)
    {
        var pase = this._paseSessions.find(p => p.Exchange === exchange)
        return pase
    }

    newPase(exchange)
    {
        var pase = PaseSession.create(exchange, this._sessionMgr)
        if (pase) this._paseSessions.push(pase)
        return pase
    }

    /**
     * Handles legal, unsolicited messages for this protocol to create the appropriate exchange handlers.
     * 
     * @param {*} msg incoming Message object
     * @param {*} exchange incoming Exchange object
     */
    onProtocolMessage(msg, exchange)
    {
        var opcode = msg.ProtocolOpcode

        console.log("Secure Channel: on unsolicited message exchange = " + msg.ExchangeId + " opcode = "+opcode)

        if (opcode == SessionProtocolConst.PaseCommand.ParamRequest)
        {
            // Create PaseSession for initial param request.
            // PaseSession will listen for subsequent messages for this exchange.

            var pase = this.getPase(exchange)
            if (!pase) {
                pase = this.newPase(exchange)
                pase.onExchangeMessage(msg, exchange)
            } else {
                console.log("Error: pase session already exists!")
            }
        }
        else if (opcode == SessionProtocolConst.CaseCommand.Sigma1)
        {
        }
    }
}

module.exports = SessionProtocol
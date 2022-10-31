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

const Const = require("../../Const")
const EchoProtocol = require('./EchoProtocol')

class EchoServer {

    constructor(exchangeMgr)
    {
        this._exchangeMgr = exchangeMgr
        this._exchange = undefined

        exchangeMgr.on(EchoProtocol.PROTOCOL_ID, (msg, exchange) => { this.onProtocolMessage(msg, exchange) })
    }

    onProtocolMessage(msg, exchange)
    {
        console.log("rx: Echo protocol message")
        switch(msg.Opcode) {
            case EchoProtocol.Command.EchoRequest: this.onEchoRequest(msg, exchange); break;
        }
    }

    sendEchoResponse(msg, exchange)
    {
        var payload = msg.Payload
        // exchange.send(peerInfo, payload)
    }

    onEchoRequest(msg, exchange)
    {
        this.sendEchoResponse(msg, exchange)
    }
}

module.exports = EchoServer
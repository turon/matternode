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

const EchoProtocol = require('./EchoProtocol')

class EchoClient {

    constructor(exchangeMgr, session)
    {
        this._exchangeMgr = exchangeMgr
        this._exchange = undefined
        this._session = session
    }

    sendEchoRequest(payload)
    {
        this._exchange = this.exchangeMgr.newExchange(this._session)
        this._exchange.setTimeout(EchoProtocol.kEchoMessageTimeoutMsec)

        var error = this._exchange.send(EchoProtocol.Command.EchoRequest, payload)

        if (error)
        {
            this._exchange.abort()
            this._exchange = undefined
        }
    }

    onExchangeMessageReceived(msg)
    {
    }
}

module.exports = EchoClient
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

const EventEmitter = require("events")
const Message = require("./Message")

const tracer = require('../util/Tracer')

/**
 * Exchange
 */
class Exchange extends EventEmitter
{
    constructor(exchangeId, session, IsInitiator = true)
    {
        super()
        this._session = session
        this._exchangeId = exchangeId
        this._exchangeAcl = undefined
        this._dispatch = undefined
        this._responseTimeout = 0
        this._IsInitiator = IsInitiator
        this._IsReliable = false
        this._IsAck = false
        this._ackCounter = 0

        tracer.objNew('exchange obj', {id:exchangeId})
    }

    get Delegate() { return this._delegate }
    set Delegate(delegate) { this._delegate = delegate }

    get Session() { return this._session }

    match(session, msg)
    {
        return ((msg.ExchangeId === this._exchangeId) &&
                (msg.SessionId === this._session.LocalSessionId) &&
                (msg.Iflag != this.IsInitiator) &&
                (session === this._session))
    }

    get IsInitiator() { return this._IsInitiator }
    set IsInitiator(v) { this._IsInitiator = !!v }

    get IsReliable() { return this._IsReliable }
    set IsReliable(v) { this._IsReliable = !!v }

    get IsAck() { return this._IsAck }
    set IsAck(v) { this._IsAck = !!v }

    get AckCounter() { return this._ackCounter }
    set AckCounter(v) { this._ackCounter = v }

    sendMessage(msg)
    {
        msg.ExchangeId = this._exchangeId
        msg.ExchangeFlags = 0
        msg.Iflag = this.IsInitiator
        msg.Rflag = this.IsReliable
    
        if (this.IsAck) {
            msg.Aflag = 1
            msg.AckCounter = this.AckCounter
        }

        var sessionId = msg.SessionId
        tracer.begin('msg tx sid='+sessionId+' ex='+this._exchangeId)
        this.Session.sendMessage(msg)
        tracer.end('msg tx sid='+sessionId+' ex='+this._exchangeId)
    }

    sendAck()
    {
        var ack = new Message()
        ack.ExchangeId = this._exchangeId
        ack.ExchangeFlags = 0
        ack.Aflag = 1
        ack.AckCounter = this.AckCounter
        ack.Iflag = this.IsInitiator
        this.Session.sendMessage(ack)
    }
}

module.exports = Exchange
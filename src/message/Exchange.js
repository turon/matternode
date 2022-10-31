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
    constructor(exchangeId, session, isInitiator = true)
    {
        super()
        this._session = session
        this._exchangeId = exchangeId
        this._exchangeAcl = undefined
        this._dispatch = undefined
        this._responseTimeout = 0
        this._isInitiator = isInitiator
        this._isReliable = false
        this._isAck = false
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
                (msg.Iflag != this.isInitiator) &&
                (session === this._session))
    }

    get isInitiator() { return this._isInitiator }
    set isInitiator(v) { this._isInitiator = !!v }

    get isReliable() { return this._isReliable }
    set isReliable(v) { this._isReliable = !!v }

    get isAck() { return this._isAck }
    set isAck(v) { this._isAck = !!v }

    get AckCounter() { return this._ackCounter }
    set AckCounter(v) { this._ackCounter = v }

    sendMessage(msg)
    {
        msg.ExchangeId = this._exchangeId
        msg.ExchangeFlags = 0
        msg.Iflag = this.isInitiator
        msg.Rflag = this.isReliable
    
        if (this.isAck) {
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
        ack.Iflag = this.isInitiator
        this.Session.sendMessage(ack)
    }
}

module.exports = Exchange
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
const Exchange = require("./Exchange")

const logger = require('../util/Logger')
const tracer = require('../util/Tracer')

/**
 * ExchangeManager handles all incoming and outgoing packets within an Exchange context.
 * The underlying session is hidden from users of the Exchange.
 * 
 * To subscribe to handle the initial unsolicited protocol message of a new Exchange:
 *    exchangeMgr.on(Number(PROTOCOL_ID), (msg, exchange) => { self.onProtocolMessage(msg, exchange) })
 *
 * To subscribe to handle subsequent messages on an Exchange:
 *    exchange.on("message", (msg, exchange) => { self.onExchangeMessage(msg, exchange) })
 */
class ExchangeManager extends EventEmitter
{
    constructor(sessionManager)
    {
        super()
        var self = this

        this._nextExchangeId = 0
        this._exchanges = []
        this._protocolHandlers = []

        this._sessionManager = sessionManager
        sessionManager.on('message', (msg, session) => { self.onSessionMessage(msg, session) })
        sessionManager.on('message_unsecured', (msg, session) => { self.onUnsecuredMessage(msg, session) })
    }

    getExchange(session, msg)
    {
        var exchange = this._exchanges.find(ex => ex.match(session, msg))
        return exchange
    }

    newExchange(session=null, msg=null, IsInitiator=true)
    {
        var exchangeId

        if (session == null) {
            session = this._sessionManager.newUnsecuredSession()
        }

        if (msg != null) {
            exchangeId = msg.ExchangeId
        } else {
            exchangeId = this._nextExchangeId++
        }

        // exchangeMgr, exchangeId, session, IsInitiator, delegate
        var exchange = new Exchange(exchangeId, session, IsInitiator)

        this._exchanges.push(exchange)

        return exchange
    }

    deleteExchange(exchange)
    {
        var exchangeIndex = this._exchanges.findIndex(ex => ex.ExchangeId === exchange.ExchangeId)
        this._exchanges.splice(exchangeIndex, 1);
    }

    onSessionMessage(msg, session)
    {
        var sessionId = msg.SessionId
        var exchangeId = msg.ExchangeId
        var Iflag = msg.Iflag

        tracer.begin('msg rx sid='+sessionId+' ex='+exchangeId)
        logger.debug("message rx: SessionID="+sessionId+" ExID="+exchangeId+" I="+Iflag)
        var exchange = this.getExchange(session, msg)
        if (exchange) {
            // Exchange found!
            exchange.AckCounter = msg.MessageCounter
            msg.Exchange = exchange
            exchange.emit("message", msg, exchange)

        } else {
            if (msg.Iflag == true) 
            {
                // Only create an exchange for initiator messages.
                // If an unsolicited message handler matches the protocol id, create exchange.
                logger.warn("message has no exchange -- creating new one for protocol id = "+msg.ProtocolId)
                exchange = this.newExchange(session, msg)
                exchange.IsInitiator = !msg.Iflag
                exchange.IsReliable = msg.Rflag
                exchange.IsAck = msg.Rflag
                exchange.AckCounter = msg.MessageCounter
                msg.Exchange = exchange
                this.emit(msg.ProtocolId, msg, exchange)
            }
            else 
            {
                logger.error("Exchange: invalid responder message has no exchange.")
            }
        }
        tracer.end('msg rx sid='+sessionId+' ex='+exchangeId)

        /*

        if (!exchange && msg.IsInitiator)
        {
            // Unsolicited message handling

            var handler = this._protocolHandlers.find(h => h.ProtocolId === msg.ProtocolId);
            if (handler != undefined)
            {
                exchange = this.newExchange(msg.ExchangeId, !msg.IsInitiator, handler)
                handler.onMessage(msg, dmsg)
            }
        }

        if (exchange)
        {
            // Forward to Exchange handler.
            exchange.onMessage(msg, dmsg)
        }
        */
    }
    

    onUnsecuredMessage(msg, session)
    {
        //logger.debug("Unsecured session message.")
        this.onSessionMessage(msg, session)
    }
}

module.exports = ExchangeManager
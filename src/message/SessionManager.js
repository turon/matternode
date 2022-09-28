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
const Session = require("./Session")

const logger = require('../util/Logger')

/**
 * SessionManager consumes 'message' events from the transport layer (UdpServer), 
 * manages the table of active Session contexts, matches messages with those sessions, 
 * and then dispatches the messages to subsequent event subscribers such as ExchangeManager.
 * 
 * dgram.emit('message')
 *   \--> UdpServer.emit('message') 
 *          \--> SessionManager.emit('message) 
 *                 |--> ExchangeManager.emit('unsolicitedMessage')
 *                 |--> Exchange.emit('exchangeMessage')
 *
 * SessionManager emits the following Events:
 * 
 * Event: 'message'
 *   The SessionManager 'message' event is emitted when a new datagram is available on a session.
 *   The event handler function is passed three arguments: msg, peerInfo, and session.
 * 
 *      msg <Message object> The message.
 *      peerInfo <Object> Remote address information.
 *          address <string> The sender address.
 *          family <string> The address family ('IPv4' or 'IPv6').
 *          port <number> The sender port.
 *          size <number> The message size.
 *      session <Session object> The session associated with the message.
 * 
 *    If the source address of the incoming packet is an IPv6 link-local address, 
 *    the interface name is added to the address. For example, a packet received 
 *    on the en0 interface might have the address field set to 'fe80::2618:1234:ab11:3b9c%en0', 
 *    where '%en0' is the interface name as a zone ID suffix.
 */
class SessionManager extends EventEmitter
{
    constructor(udpServer)
    {
        super()

        this._sessionsSecured = []
        this._sessionsUnsecured = []
        this._nextSessionId = 1

        this._udpServer = udpServer
        this.addSocket(udpServer)
    }

    get SecureSessions() { return this._sessionsSecured }
    get UnsecuredSessions() { return this._sessionsUnsecured }

    getSecureSession(sessionId)
    {
        var session = this.SecureSessions.find(s => s.LocalSessionId === sessionId);
        return session
    }

    getUnsecureSession(peerInfo, peerNodeId)
    {
        var session = this.UnsecuredSessions.find(s => (
            s.PeerInfo.address === peerInfo.address && 
            s.PeerInfo.port === peerInfo.port &&
            (s.PeerNodeId === peerNodeId || s.PeerNodeId === undefined)
            ))
        return session
    }

    newSession(localSessionId, peerSessionId, isSecure=true)
    {
        var session = new Session(localSessionId, peerSessionId, isSecure)

        var sessionTable = (isSecure) ? this.SecureSessions : this.UnsecuredSessions
        sessionTable.push(session)

        return session
    }

    newUnsecuredSession()
    {
        return this.newSession(
            Session.UNSECURED_SESSION_ID, 
            Session.UNSECURED_SESSION_ID, 
            false)
    }

    addSocket(udpSocket) {
        var self = this
        udpSocket.on('message', (msg, peerInfo) => {
            // Add transport layer info to peerInfo to support dual role client/server nodes.
            peerInfo.transport = udpSocket
            self.onMessage(msg, peerInfo) 
        })
    }

    onUnsecuredMessage(msg) {

        var sessionId = Session.UNSECURED_SESSION_ID
        var peerNodeId =  (msg.Iflag) ? msg.SourceNodeId : msg.DestinationNodeId
        var session = this.getUnsecureSession(msg.PeerInfo, peerNodeId)
        if (session) {
            // Session found!
            if (session.PeerNodeId === undefined) {
                session.PeerNodeId = msg.SourceNodeId
            }
        } else {
            logger.warn("unsecured message has no session -- create one for now. ")
            session = this.newSession(sessionId, sessionId, false)
            session.PeerNodeId = msg.SourceNodeId

            // return // TODO: drop message when no session
        }

        /*
        var counter = msg.MessageCounter
        var duplicate = !session.verifyCounter(counter)

        if (!duplicate)
        {
            session.counterUpdate(counter)
        }
        */

        // Update to latest peer address
        session.PeerInfo = msg.PeerInfo
        session.PeerMessageCounter = msg.MessageCounter
        session.updateActivity()

        // Exchange / Protocol dispatch
        if (msg) this.emit("message_unsecured", msg, session)

        return msg
    }

    onSecureMessage(buf, peerInfo) {

        var msg = new Message(buf, buf, peerInfo)
        if (!msg) return
        //logger.debug(JSON.stringify(msg))

        var sessionId = msg.SessionId
        var session = this.getSecureSession(sessionId)
        if (session) {
            // Session found!
        } else {
            // Auto-create sessions for default test key.
            logger.error("Error: secure message has no session -- create one with test keys.")
            session = this.newSession(sessionId, sessionId)
            session.PeerNodeId = msg.SourceNodeId

            // return // TODO: drop message when no session
        }

        session.decryptMessage(msg)

        /*
        // Message Counter processing

        var counter = msg.MessageCounter
        var duplicate = !session.verifyCounter(counter)

        if (!duplicate)
        {
            session.counterUpdate(counter)
        }
        */

        // Update to latest peer address
        session.PeerInfo = msg.PeerInfo
        session.PeerMessageCounter = msg.MessageCounter
        session.updateActivity()

        // Dispatch to ExchangeManager / Protocol and any other dispatch
        this.emit("message", msg, session)

        return msg
    }

    onMessage(buf, peerInfo)
    {
        var rawMsg = new Message(buf, null, peerInfo)
        if (!rawMsg) return

        if (rawMsg.isUnencrypted())
        {
            this.onUnsecuredMessage(rawMsg)
        }
        else 
        {
            this.onSecureMessage(buf, peerInfo)
        }
    }
    
}

module.exports = SessionManager

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

const PersistantStore = require("./platform/PersistantStore")
const UdpServer = require("./net/UdpServer")
const UdpClient = require("./net/UdpClient")
const Discovery = require("./net/Discovery")
const SessionManager = require("./message/SessionManager")
const ExchangeManager = require("./message/ExchangeManager")
const SessionProtocol = require("./protocols/session/SessionProtocol")
const InteractionModel = require("./protocols/interaction_model/InteractionModel")

/**
 * Class to manage a Matter Node.
 */
class Node {
    
    constructor() {
        this._store = new PersistantStore()

        // Message layer
        this._server = new UdpServer()
        this._client = new UdpClient()
        this._discovery = new Discovery()
        this._sessionMgr = new SessionManager(this._server)
        this._exchangeMgr = new ExchangeManager(this._sessionMgr)
        // TODO: Refactor for multi-client support
        this._sessionMgr.addSocket(this._client)

        // Mandatory protocol support
        this._protocolSession = new SessionProtocol(this._exchangeMgr, this._sessionMgr)
        this._protocolIM = new InteractionModel(this._exchangeMgr)

        // Mandatory cluster support
    }

    init(nodenum = 0)
    {
        this._store.init(nodenum)
        this._discovery.setTarget(this._store.mdnsTarget)
    }

    start() {
        this._server.start()
    }

    /**
     * Get the PersistantStore object for this Node.
     */
    get Store() { return this._store }

    /**
     * Get the Discovery object for this Node.
     */
    get Server() { return this._server }

    /**
     * Get the Discovery object for this Node.
     */
    get Client() { return this._client }

    /**
     * Get the Discovery object for this Node.
     */
    get Discovery() { return this._discovery }

    /**
     * Get the SessionManager object for this Node.
     */
    get SessionManager() { return this._sessionMgr }

    /**
     * Get the ExchangeManager object for this Node.
     */
    get ExchangeManager() { return this._exchangeMgr }

    /**
     * Get the SessionProtocol object for this Node.
     */
    get SessionProtocol() { return this._protocolSession }

    /**
     * Get the InteractionModel manager object for this Node.
     */
     get InteractionModel() { return this._protocolIM }
}

global.theNode = new Node()

module.exports = theNode
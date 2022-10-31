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

const dgram = require("dgram")
const logger = require('../util/Logger')
const EventEmitter = require("events")

/**
 * Class to manage Matter server operations.
 */
class UdpServer extends EventEmitter {
    constructor() {
        super()
        var self = this

        this._server = dgram.createSocket("udp6")
        this._server.on("error", (err) => { self.onError(err) })
        this._server.on("listening", () => { self.onListening() })
        this._server.on("message", (msg, peerInfo) => { self.onMessage(msg, peerInfo) })
    }

    get ip6Address() { return this._server.address().address }
    get ip6Port() { return this._server.address().port }

    start() {
        this._server.bind(theNode.Store.IpPort);

        // TODO: group listener support
        /*
        this._server.bind(PORT, BROADCAST_ADDR, function() {
            this._server.addMembership(MULTICAST_ADDR)
            this._server.setBroadcast(true)
        })
        */

        logger.info("Server started!")
    }

    onError(err) {
        this.emit('error', err)
        logger.error("server error:\n" + err.stack);
        this._server.close();
    }

    onListening() {
        logger.info("server listening [" + this.ip6Address + "]:" + this.ip6Port)
    }

    onMessage(msg, peerInfo) {
        logger.info("udp server rx: "+msg.toString('hex'))
        this.emit("message", msg, peerInfo)
    }
    send(msg, port=undefined, host=undefined) {
        this._server.send(msg, 0, msg.length, port, host, function(err, bytes) {
            if (err) throw err;
        });
        logger.info('server sent to [' + host +']:'+ port);
    }

}

module.exports = UdpServer
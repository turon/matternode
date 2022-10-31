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
const EventEmitter = require("events")

const logger = require('../util/Logger')
const MsgCodec = require('../message/MsgCodec')

/**
 * Class to manage Matter server operations.
 */
 class UdpClient extends EventEmitter {
    constructor() {
        super()
        var self = this

        this._client = dgram.createSocket('udp6');
        this._client.on("error", (err) => { self.onError(err) })
        this._client.on("listening", () => { self.onListening() })
        this._client.on("message", (msg, peerInfo) => { self.onMessage(msg, peerInfo) })
    }

    get ip6Address() { return this._client.address().address }
    get ip6Port() { return this._client.address().port }

    send(msg, port=undefined, host=undefined) {
        if (port == undefined) {
            port = theNode.Store.IpPort
        }
        if (host == undefined) {
            host = MsgCodec.DEFAULT_HOST
        }

        this._client.send(msg, 0, msg.length, port, host, function(err, bytes) {
            if (err) throw err;
        });
        logger.info('client sent to [' + host +']:'+ port);
    }

    onError(err) {
        this.emit('error', err)
        logger.error("server error:\n" + err.stack);
        this._server.close();
    }

    onListening() {
        logger.info("client listening [" + this.ip6Address + "]:" + this.ip6Port)
    }


    onMessage(msg, peerInfo) {
        logger.info("udp client rx: "+msg.toString('hex'))
        this.emit("message", msg, peerInfo)
    }
}

module.exports = UdpClient

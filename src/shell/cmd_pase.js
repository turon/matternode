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

const yargs = require('yargs')
const theNode = require('../Node')
const PaseSession = require('../protocols/session/PaseSession')

/**
 * Execute the `pase` shell command.
 *
 * Usage: msg <destination>
 * Where:
 *      <destination>   NodeId of peer node to send message to
 *
 * @param {Array} args
 * @returns 0
 */
function doPase(args) {    
    var dst //= BigInt(MsgCodec.NODE_ID_ANY)
    var ipPort = 5540
    var ipHost = "::1"
    var passcode = Buffer.alloc(4)
    passcode.writeUInt32LE(this._paramPaircode, 0)

    const argv = yargs(args)
    .option('dst', {
        alias: 'd',
        description: 'the destination node id',
        type: 'string',
    })
    .option('key', {
        alias: 'k',
        description: 'the PAKE key or pincode to use to establish the PASE session',
        type: 'string',
    })
    .option('ip', {
        alias: 'i',
        description: 'the destination IP address',
        type: 'string',
    })
    .option('port', {
        alias: 'p',
        description: 'the IP port to connect to',
        type: 'number',
    })
    .exitProcess(false)
    .help()
    .parse()

    if (argv.help) return 0

    if (argv.dst != undefined) {
        if (argv.dst != '') {
            dst = BigInt(argv.dst)
        }
    }
    if (argv.p != undefined) { ipPort = argv.p }
    if (argv.h != undefined) { ipHost = argv.h }

    if (argv.key != undefined) {
        key = Buffer.from(argv.key, "hex")
    }

    // TODO: generalize into client API
    var exchange = theNode.ExchangeManager.newExchange()
    exchange.Session.Transport = theNode.Client
    exchange.Session.PeerInfo = {
        port: ipPort,
        address: ipHost,
    }
    var pase = theNode.SessionProtocol.newPase(exchange)
    pase.startPase(ipHost, ipPort, passcode)

    return 0
}


module.exports = {
    doPase
}
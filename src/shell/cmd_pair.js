/**
 * @license
 * Copyright (c) 2022 Project CHIP Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const yargs = require('yargs')
const theNode = require('../Node')
const Commissioner = require('../controller/Commissioner')

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
function doPair(args) {    
    var nodeid //= BigInt(MsgCodec.NODE_ID_ANY)
    var ipPort = 5540
    var ipHost = "::1"
    var pincode = Buffer.alloc(4)
    pincode.writeUInt32LE(this._paramPaircode, 0)

    const argv = yargs(args)
    .option('nodeid', {
        alias: 'n',
        description: 'the nodeid to commission the node with',
        type: 'number',
    })
    .option('pincode', {
        alias: 'c',
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

    if (argv.nodeid != undefined) {
        if (argv.nodeid != '') {
            nodeid = BigInt(argv.nodeid)
        }
    }
    if (argv.p != undefined) { ipPort = argv.p }
    if (argv.h != undefined) { ipHost = argv.h }

    if (argv.pincode != undefined) {
        pincode = Buffer.from(argv.pincode, "hex")
    }

    const params = { }
    const commissioner = new Commissioner(theNode, params)
    const device = { ipHost, ipPort, pincode }
    commissioner.pair(device, pincode, nodeid)

    return 0
}


module.exports = {
    doPair
}
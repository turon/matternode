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
const MsgCodec = require('../message/MsgCodec')

// Register general message handler for `msg` command.
theNode.SessionManager.on('message', onMsg)

/**
 * Receive handler for messages.
 * 
 * @param {*} msg 
 * @param {*} session 
 */
function onMsg(msg, session) {
    const peerInfo = msg.PeerInfo
    console.log("server got: " +
        msg.Encrypted.toString('hex') + " from " +
        peerInfo.address + ":" + peerInfo.port)
        console.log("Plain:  " + msg.Decrypted.toString('hex'))
}

/**
 * Encode a Message.
 *
 * Usage: msg <destination>
 * Where:
 *      <destination>   NodeId of peer node to send message to
 *
 * @param {Array} args
 * @returns 0
 */
function doMsg(args) {    
    var sessionId = 0x0BB8 // 3000
    var counter = 0x00003039 // 12345
    var src = BigInt('0x'+theNode.Store.NodeId)
    var dst = BigInt(MsgCodec.NODE_ID_ANY)
    var dsiz = 0
    var sFlag = 0
    var pFlag = 0
    var cFlag = 0
    var iFlag = 1
    var aFlag = 0
    var rFlag = 1
    var ipPort
    var ipHost
    var sessionType = MsgCodec.MSG_SESSION_TYPE_UNICAST
    var exchangeId = 0x0EEE // 3822
    var protocolId = 0x7D20 // 32032
    var opcode = 0x64 // 100

    var key = Buffer.from(theNode.Store.EncryptionKey, "hex")

    const argv = yargs(args)
    .option('dst', {
        alias: 'd',
        description: 'the destination node id',
        type: 'string',
    })
    .option('src', {
        alias: 'n',
        description: 'the source node id',
        type: 'string',
    })
    .option('counter', {
        alias: 'c',
        description: 'the message counter',
        type: 'number',
    })
    .option('session', {
        alias: 's',
        description: 'the session id',
        type: 'number',
    })
    .option('key', {
        alias: 'k',
        description: 'the encryption key to use for encoding the message',
        type: 'string',
    })
    .option('privacy', {
        alias: 'x',
        description: 'the privacy flag',
        type: 'number',
    })
    .option('control', {
        alias: 'c',
        description: 'the control message flag',
        type: 'number',
    })
    .option('exchange', {
        alias: 'e',
        description: 'the exchange id',
        type: 'number',
    })
    .option('initiator', {
        alias: 'i',
        description: 'the initiator flag (responder if clear)',
        type: 'number',
    })
    .option('ack', {
        alias: 'a',
        description: 'the acknowledgement flag',
        type: 'number',
    })
    .option('reliable', {
        alias: 'r',
        description: 'the reliable message flag',
        type: 'number',
    })
    .option('port', {
        alias: 'p',
        description: 'the ip port to send to',
        type: 'number',
    })
    .option('host', {
        alias: 'h',
        description: 'the hostname or ipv6 address to send to',
        type: 'string',
    })
    .exitProcess(false)
    .parse()

    //console.log(argv)

    if (argv.help) return 0

    // Parse `msg` command arguments that were passed in
    if (argv.dst != undefined) {
        if (argv.dst != '') {
            dst = BigInt(argv.dst)
        }
        dsiz = MsgCodec.MSG_FLAGS_DST_PRESENT
    }
    if (argv.src != undefined) { 
        if (argv.src != '') {
            src = BigInt(argv.src)
        }
        sFlag = 1
    }
    if (argv.session != undefined) { sessionId = argv.session }
    if (argv.exchange != undefined) { exchangeId = argv.exchange }
    if (argv.counter != undefined) { counter = argv.counter }
    if (argv.x != undefined) { pFlag = argv.x }
    if (argv.c != undefined) { cFlag = argv.c }
    if (argv.i != undefined) { iFlag = argv.i }
    if (argv.a != undefined) { aFlag = argv.a }
    if (argv.r != undefined) { rFlag = argv.r }
    if (argv.p != undefined) { ipPort = argv.p }
    if (argv.h != undefined) { ipHost = argv.h }
    if (argv.key != undefined) {
        key = Buffer.from(argv.key, "hex")
    }

    // Encode message from `msg` command inputs
    var messageFlags = MsgCodec.encodeMessageFlags(dsiz, sFlag)
    var securityFlags = MsgCodec.encodeSecurityFlags(sessionType, cFlag, pFlag)
    var messageHeader = MsgCodec.encodeHeader(messageFlags, securityFlags, sessionId,
                                    counter, src, dst)

    var exchangeFlags = MsgCodec.encodeExchangeFlags(iFlag, aFlag, rFlag)

    var protocolHeader = MsgCodec.encodeProtocolHeader(exchangeFlags, exchangeId, 
                                            opcode,protocolId,null,null)
    var msg = Buffer.concat([messageHeader,protocolHeader])

    console.log("Plain:  " + msg.toString('hex'))
    var enc = MsgCodec.encrypt(msg, key)

    console.log("Secure: " + enc.toString('hex'))

    theNode.Client.send(enc, ipPort, ipHost)

    return 0
}


module.exports = {
    doMsg
}
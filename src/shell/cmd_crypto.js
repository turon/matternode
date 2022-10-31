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

/**
 * Crypto toolkit utility.
 *
 * Usage: crypto [flags]
 * Where:
 *      -d, --decrypt <msg>      Decrypts the given message [hexstring]
 *      -e, --encrypt <msg>      Encrypts the given message [hexstring]
 * 
 * @param {Array} args
 * @returns 0
 */
function doCrypto(args) {   
    var key = Buffer.from(theNode.Store.EncryptionKey, "hex")
 
    const argv = yargs(args)
    .option('decrypt', {
        alias: 'd',
        description: 'decrypt the given msg',
        type: 'string',
    })
    .option('encrypt', {
        alias: 'e',
        description: 'encrypt the given msg',
        type: 'string',
    })
    .option('key', {
        alias: 'k',
        description: 'encryption key to use, otherwise use `key` as stored in config',
        type: 'string',
    })
    .exitProcess(false)
    .parse()

    if (argv.help) return 0

    // Parse command arguments
    if (argv.key != undefined)
    {
        key = Buffer.from(argv.key, "hex")
    }

    console.log("Key:  " + key.toString('hex'))

    if (argv.decrypt != undefined)
    {
        var buf = Buffer.from(argv.decrypt, "hex")
        console.log("Cipher:  " + buf.toString('hex'))

        var dmsg = MsgCodec.decrypt(buf, key)
        if (!dmsg) {
            console.log("ERROR: message failed authentication")
        } else {
            console.log("Plain:  " + dmsg.toString('hex'))
        }
    }
    else if (argv.encrypt != undefined)
    {
        var buf = Buffer.from(argv.encrypt, "hex")
        console.log("Plain:  " + buf.toString('hex'))
        var enc = MsgCodec.encrypt(buf, key)
        console.log("Cipher:  " + enc.toString('hex'))
    }
    else
    {
        yargs.showHelp()
    }

    return 0
}

module.exports = {
    doCrypto
}
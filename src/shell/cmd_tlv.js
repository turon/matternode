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

const TlvCodec = require('../tlv/TlvCodec')
const { TlvReader } = require('../tlv/TlvReader')
const { TlvWriter } = require('../tlv/TlvWriter')

/**
 * Encode or decode Matter TLV.
 *
 * Usage:
 *      tlv --decode <hex>
 *      tlv --encode <json>
 */
function doTlv(args) {    
    var tabWidth = 2

    const argv = yargs(args)
    .option('decode', {
        alias: 'd',
        description: 'the raw tlv to decode in hex',
        type: 'string',
    })
    .option('encode', {
        alias: 'e',
        description: 'the json to encode',
        type: 'string',
    })
    .option('tab_width', {
        alias: 't',
        description: 'tab width of json (default 2)',
        type: 'number',
    })
    .exitProcess(false)
    .help()
    .parse()

    //console.log(argv)
    if (argv.help) return 0

    if (argv.tab_width != undefined) {
        tabWidth = argv.tab_width
    }

    if (argv.decode != undefined)
    {
        var tlv = Buffer.from(argv.decode, "hex")
        var reader = new TlvReader()
        reader.decode(tlv)
        var result = reader.Json
        console.log(JSON.stringify(result,null,tabWidth))
    }
    else if (argv.encode != undefined)
    {
        console.log(argv.encode)
        var json = JSON.parse(argv.encode)
        var writer = new TlvWriter()
        writer.encode(json)
        var result = writer.Buffer
        console.log(json)
        console.log(result.toString('hex'))
    }
    else
    {
        yargs.showHelp()
    }

    return 0
}


module.exports = {
    doTlv
}
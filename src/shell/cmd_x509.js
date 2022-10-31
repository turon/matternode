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

const x509 = require('@peculiar/x509')

/**
 * Encode or decode Matter Certificates.
 *
 * Usage:
 *      x509 --in <certificate> --out <tlv|der|pem>
 */
function doX509(args) {    
    var tabWidth = 2

    const argv = yargs(args)
    .option('in', {
        alias: 'i',
        description: 'the x509 certificate input in tlv, tlv hex, der, der hex, or pem',
        type: 'string',
    })
    .option('out', {
        alias: 'o',
        description: 'the output format of the x509 cetificate: pem, base64, base64url, or hex (der)',
        type: 'string',
    })
    .exitProcess(false)
    .help()
    .parse()

    if (argv.help) return 0

    if (argv.in != undefined)
    {
        const cert = new x509.X509Certificate(argv.in);
        console.log(cert.toString(argv.out))
    }
    else
    {
        yargs.showHelp()
    }

    return 0
}


module.exports = {
    doX509
}
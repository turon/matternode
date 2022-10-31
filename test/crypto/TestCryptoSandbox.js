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

const SRC_ROOT = '../../src/'

const assert = require('assert')
const crypto = require('crypto')
const Crypto = require(SRC_ROOT+'crypto/Crypto')

const theTestCryptoVectors = [

    { // https://www.ietf.org/rfc/rfc6979.txt
        privateKey: 'c9afa9d845ba75166b5c215767b1d6934e50c3db36e89b127b8a622b120f6721',
        publicKey: '0460fed4ba255a9d31c961eb74c6356d68c049b8923b61fa6ce669622e60f29fb67903fe1008b8bc99a41ae9e95628bc64f2f1b20c2d7e9f5177a3c294d4462299',
        message: 'sample',
        signature: 'efd48b2aacb6a8fd1140dd9cd45e81d69d2c877b56aaf991c34d0ea84eaf3716f7cb1c942d657c41d436c7a1b6e29f65f3e900dbb9aff4064dc4ab2f843acda8',
    },
    { // https://www.ietf.org/rfc/rfc6979.txt
        privateKey: 'c9afa9d845ba75166b5c215767b1d6934e50c3db36e89b127b8a622b120f6721',
        publicKey: '0460fed4ba255a9d31c961eb74c6356d68c049b8923b61fa6ce669622e60f29fb67903fe1008b8bc99a41ae9e95628bc64f2f1b20c2d7e9f5177a3c294d4462299',
        message: 'test',
        signature: 'f1abb023518351cd71d881567b1ea663ed3efcf6c5132b354f28d3b0b7d38367019f4113742a2b14bd25926b49c649155f267e60d3814b4c0cc84250e46f0083',
    },
]

function testCryptoSandbox(testEntry)
{
    it("crypto.ecdh generateKeys", async function () {
        try {
            const ecdh = crypto.createECDH('prime256v1')
            ecdh.generateKeys()
            console.log('priv: '+ecdh.getPrivateKey('hex'))
            console.log('pub:'+ecdh.getPublicKey('hex'))

            ecdh.setPrivateKey(Buffer.from(testEntry.privateKey,'hex'))
            var pubKey = ecdh.getPublicKey().toString('hex')  // Defaults to 'buffer'
            console.log('priv: '+ecdh.getPrivateKey('hex'))
            console.log('pub:'+pubKey)
            assert.equal(pubKey, testEntry.publicKey)

        } catch (err) {
            console.error(err)
        }
    })

    /*
    it("crypto.generateKeyPairSync", async function () {
        const message = Buffer.from(testEntry.message, 'utf-8')
        const privateKey = Buffer.from(testEntry.privateKey, 'hex')

        var sig

        try {
            const privKey = crypto.createPrivateKey({
                key: privateKey, format: 'der', type: 'pkcs1'
            })
            const sign = crypto.createSign('SHA256')
            sign.update(message)
            sign.end();
            sig = sign.sign(privKey);
    
            sig = crypto.sign('SHA256', message, { key: privKey, dsaEncoding: 'ieee-p1363' })
        } catch (err) {
            console.error(err)
        }
        return sig
    })

    it("crypto.generateKeyPairSync", async function () {
        const key = await crypto.generateKeyPairSync('ec', 
            { 
                namedCurve: 'P-256' ,
                publicKeyEncoding: { type: 'spki', format: 'der' },
                privateKeyEncoding: { type: 'pkcs8', format: 'der' },
            }
        )
        console.log('priv: '+key.privateKey.toString('hex'))
        console.log('pub:'+key.publicKey.toString('hex'))
    })
    */
}

describe('Test Crypto Sandbox', () => {
    theTestCryptoVectors.forEach(testEntry => testCryptoSandbox(testEntry))
})

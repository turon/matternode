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
const Crypto = require(SRC_ROOT+'crypto/Crypto')

const theTestAesCcmVector = [
    {
        name: "ac063659d220; basic no empty params",
        key: "63964771734fbd76e3b40519d1d94a48",
        nonce: "010007080d1234973612345677",
        plain: "ea0a00576f726c64",
        aad: "f4a002c7fb1e4ca0a469a021de0db875",
        encrypted: "de1547118463123e",
        mic: "14604c1ddb4f5987064b1736f3923962",
    },
    {
        name: "2ef53070ae20; basic empty aad",
        key: "0953fa93e7caac9638f58820220a398e",
        nonce: "00800000011201000012345678",
        plain: "fffd034b50057e400000010000",
        aad: "",
        encrypted: "b5e5bfdacbaf6cb7fb6bff871f",        
        mic: "b0d6dd827d35bf372fa6425dcd17d356",
    }
]


const theTestAesCtrVector = [
    {
        name: "rfc3686 aes-ctr-128 nonce=13 bytes, m=16 bytes",
        key: "ae6852f8121067cc4bf7a5765577f39e",
        nonce: "00000030000000000000000000",
        plain: "53696e676c6520626c6f636b206d7367",
        encrypted: "0d0a6b6dc1f69b4d14ca4c15422242c4",
    },
    {
        name: "rfc3686 aes-ctr-128 nonce=13 bytes, m=32 bytes",
        key: "7e24067817fae0d743d6ce1f32539163",
        nonce: "006cb6dbc0543b59da48d90b00",
        plain: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
        encrypted: "4f3df94915884de0dc0e30950de7a6e95a917e1d064222db2f6ec73d994ad95f",
    },
    {
        name: "group message 1",
        key: "bfe9da016a765365f2dd97a9f939e425",
        nonce: "db7d4fca22328e6b1e44dc0468",
        plain: "7856341201000000000000000200",
        encrypted: "31457fc65ec2edafaf0166a06542",
    },
    
]

function testAeadCrypto(testEntry)
{
    it("Test Crytpo.AeadEncrypt: "+testEntry.name, function () {
        try {
            const plain = Buffer.from(testEntry.plain, 'hex')
            const key = Buffer.from(testEntry.key, 'hex')
            const aad = Buffer.from(testEntry.aad, 'hex')
            const nonce = Buffer.from(testEntry.nonce, 'hex')
            const encrypted = Crypto.AeadEncrypt(key, plain, aad, nonce)
            assert.equal(encrypted.toString('hex'), testEntry.encrypted + testEntry.mic)
        } catch (err) {
            console.error(err)
        }
    })

    it("Test Crytpo.AeadDecrypt: "+testEntry.name, function () {
        try {
            const encrypted = Buffer.from(testEntry.encrypted, 'hex')
            const key = Buffer.from(testEntry.key, 'hex')
            const aad = Buffer.from(testEntry.aad, 'hex')
            const nonce = Buffer.from(testEntry.nonce, 'hex')
            const mic = Buffer.from(testEntry.mic, 'hex')
            const plain = Crypto.AeadDecrypt(key, encrypted, aad, nonce, mic)
            assert.equal(plain.toString('hex'), testEntry.plain)
        } catch (err) {
            console.error(err)
        }
    })
}

function testPrivacyCrypto(testEntry)
{
    it("Test Crytpo.PrivacyEncrypt: "+testEntry.name, async function () {
        const plain = Buffer.from(testEntry.plain, 'hex')
        const key = Buffer.from(testEntry.key, 'hex')
        const nonce = Buffer.from(testEntry.nonce, 'hex')
        const encrypted = Crypto.PrivacyEncrypt(key, plain, nonce)
        assert.equal(encrypted.toString('hex'), testEntry.encrypted)
    })

    it("Test Crytpo.PrivacyDecrypt: "+testEntry.name, async function () {
        const encrypted = Buffer.from(testEntry.encrypted, 'hex')
        const key = Buffer.from(testEntry.key, 'hex')
        const nonce = Buffer.from(testEntry.nonce, 'hex')
        const plain = Crypto.PrivacyDecrypt(key, encrypted, nonce)
        assert.equal(plain.toString('hex'), testEntry.plain)
    })
}

describe('Test Crypto_Encrypt/Decrypt()', () => {
    theTestAesCcmVector.forEach(testEntry => testAeadCrypto(testEntry))
    theTestAesCtrVector.forEach(testEntry => testPrivacyCrypto(testEntry))
    theTestAesCcmVector.forEach(testEntry => testPrivacyCrypto(testEntry))
})

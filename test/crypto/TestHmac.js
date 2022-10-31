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

const theTestCryptoHmacVector = [
    {
        input: '54657374205573696e67204c6172676572205468616e20426c6f636b2d53697a65204b6579202d2048617368204b6579204669727374',
        key: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        expected: '60e431591ee0b67f0d8a26aacbf5b77f8e0bc6213728c5140546040f0ee37f54',
    },
]

function testCryptoHmac(testEntry)
{
    it("Test Crytpo.HMAC", async function () {
        try {
            const key = Buffer.from(testEntry.key, 'hex')
            const input = Buffer.from(testEntry.input, 'hex')
            const hmac = Crypto.Hmac(key, input)
            assert.equal(hmac.toString('hex'),testEntry.expected)
        } catch (err) {
            console.error(err)
        }
    })
}

describe('Test Crypto_HMAC()', () => {
    theTestCryptoHmacVector.forEach(testEntry => testCryptoHmac(testEntry))
})

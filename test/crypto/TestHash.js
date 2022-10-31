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

const theTestCryptoHashVector = [
    {
        name: 'Short message test case (zero length)',
        input: '',
        expected: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
        name: 'Short message test case (8 bits; 1 byte)',
        input: 'd3',
        expected: '28969cdfa74a12c82f3bad960b0b000aca2ac329deea5c2328ebc6f2ba9802c1',
    },
    {
        name: 'Short message test case (16 bits; 2 bytes)',
        input: '11af',
        expected: '5ca7133fa735326081558ac312c620eeca9970d1e70a4b95533d956f072d1f98',
    },
    {
        name: 'Short message test case (64 bits; 8 bytes)',
        input: '5738c929c4f4ccb6',
        expected: '963bb88f27f512777aab6c8b1a02c70ec0ad651d428f870036e1917120fb48bf',
    },
    {
        name: 'Short message test case (120 bits; 15 bytes)',
        input: '294af4802e5e925eb1c6cc9c724f09',
        expected: 'dcbaf335360de853b9cddfdafb90fa75567d0d3d58af8db9d764113aef570125',
    },
    {
        name: 'Short message test case (128 bits; 16 bytes)',
        input: '0a27847cdc98bd6f62220b046edd762b',
        expected: '80c25ec1600587e7f28b18b1b18e3cdc89928e39cab3bc25e4d4a4c139bcedc4',
    },
    {
        name: 'Short message test case (136 bits; 17 bytes)',
        input: '1b503fb9a73b16ada3fcf1042623ae7610',
        expected: 'd5c30315f72ed05fe519a1bf75ab5fd0ffec5ac1acb0daf66b6b769598594509',
    },
]

function testCryptoHash(testEntry)
{
    it("Test Crytpo.Hash: "+testEntry.name, async function () {
        try {
            const input = Buffer.from(testEntry.input, 'hex')
            var hash = Crypto.Hash(input)
            assert.equal(hash.toString('hex'),testEntry.expected)
        } catch (err) {
            console.error(err)
        }
    })
}

describe('Test Crypto_Hash()', () => {
    theTestCryptoHashVector.forEach(testEntry => testCryptoHash(testEntry))
})

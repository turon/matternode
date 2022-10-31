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

const theTestCryptoKdfVector = [
    {
        name: 'SDK KDF test 1',
        inputKey: '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b',
        salt: '000102030405060708090a0b0c',
        info: 'f0f1f2f3f4f5f6f7f8f9',
        outputKey: '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865',
    },
    {
        name: 'SDK Group Operational Key test 1',
        inputKey: 'a0a1a2a3a4a5a6a7a8a9aaabacadaeaf',           ///< EpochKey
        salt: '2906c908d115d362',                               ///< CompressedFabricId
        info: Buffer.from('GroupKey v1.0').toString('hex'),
        outputKey: '1f19ed3cef8a211baf306faeeee7aac6',
    },
    {
        name: 'SDK Group Operational Key test 2',
        inputKey: 'b0b1b2b3b4b5b6b7b8b9babbbcbdbebf',           ///< EpochKey
        salt: '2906c908d115d362',                               ///< CompressedFabricId
        info: Buffer.from('GroupKey v1.0').toString('hex'),
        outputKey: 'aa979a48bd8cdf293a0709b9c1eb1930',
    },
    {
        name: 'SDK Group Operational Key test 3',
        inputKey: '235bf7e62823d358dca4ba50b1535f4b',           ///< EpochKey
        salt: '87e1b004e235a130',                               ///< CompressedFabricId
        info: Buffer.from('GroupKey v1.0').toString('hex'),
        outputKey: 'a6f5306baf6d050af23ba4bd6b9dd960',
    },
    {
        name: 'SDK Group Privacy Key test 1',
        inputKey: '1f19ed3cef8a211baf306faeeee7aac6',           ///< EncryptionKey
        salt: '',
        info: Buffer.from('PrivacyKey').toString('hex'),
        outputKey: 'b8279f89621ed327a9c39f6a27247358',
    },
    {
        name: 'SDK Group Privacy Key test 2',
        inputKey: 'aa979a48bd8cdf293a0709b9c1eb1930',           ///< EncryptionKey
        salt: '',
        info: Buffer.from('PrivacyKey').toString('hex'),
        outputKey: 'f72570c3c089a0fe28758357afffb8d2',
    },
    {
        name: 'SDK Group Privacy Key test 3',
        inputKey: 'a6f5306baf6d050af23ba4bd6b9dd960',           ///< EncryptionKey
        salt: '',
        info: Buffer.from('PrivacyKey').toString('hex'),
        outputKey: '01f8d1927126f194082572d49b1fdc73',
    },
]

function testCryptoKdf(testEntry)
{
    it("Test Crypto.KDF: "+testEntry.name, async function () {
        try {
            const key = Buffer.from(testEntry.inputKey, 'hex')
            const salt = Buffer.from(testEntry.salt, 'hex')
            const info = Buffer.from(testEntry.info, 'hex')
            const expected = Buffer.from(testEntry.outputKey, 'hex')
            const outputKey = Crypto.Kdf(key, salt, info, expected.length)
            assert.equal(outputKey.toString('hex'), testEntry.outputKey)
        } catch (err) {
            console.error(err)
        }
    })
}

describe('Test Crypto_KDF()', () => {
    theTestCryptoKdfVector.forEach(testEntry => testCryptoKdf(testEntry))
})

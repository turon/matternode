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

const assert = require('assert')

const SRC_ROOT = '../../src/'
const SessionCryptoContext = require(SRC_ROOT+"message/SessionCryptoContext")


const theTestCryptoContextSecretsVector = [
    {
        secret: "Test secret for key derivation.\0",
        salt: Buffer.alloc(0),
        info: Buffer.from("SessionKeys", "utf8"),
        len: 48,

        keyI2R: "5eded244e5532b3cdc23409dbad052d2",
        keyR2I: "a9e011b1737c6d4b70e4c0a2fe660476",
        keyAttestation: "c5aead0e0691c420284c9580f90e07b0",
    },
]

function testCryptoContextInitFromSecret(testEntry) {

    var secret = Buffer.from(testEntry.secret, "utf-8")
    var salt = testEntry.salt
    var info = testEntry.info
    var len = testEntry.len

    it("initFromSecret", () => {
        var cryptoContext = new SessionCryptoContext()
        cryptoContext._keys = []
        cryptoContext.initFromSecret(secret, salt, info, len)

        assert.equal(cryptoContext._keys[0].toString('hex'), testEntry.keyI2R)
        assert.equal(cryptoContext._keys[1].toString('hex'), testEntry.keyR2I)
        assert.equal(cryptoContext._keys[2].toString('hex'), testEntry.keyAttestation)
    })
}

describe('Test SessionCryptoContext', () => {
    theTestCryptoContextSecretsVector.forEach(testEntry => testCryptoContextInitFromSecret(testEntry));
})

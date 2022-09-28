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

const hkdf = require('futoin-hkdf')
const logger = require('../util/Logger')

const CHIP_CONFIG_SECURITY_TEST_MODE = 1
const SECURITY_TEST_MODE_SECRET =  Buffer.from("Test secret for key derivation.\0", "utf-8")
const SECURITY_TEST_MODE_SALT = Buffer.alloc(0)
const SECURITY_TEST_MODE_INFO = Buffer.from("SessionKeys", "utf8")
class SessionCryptoContext {
    static KeyIndex = {
        kI2RKey: 0,
        kR2IKey: 1,
        kAttestationChallenge: 2
    }

    constructor()
    {
        // Default to accept TEST_MODE key for unsolicited messages
        this._keys = [
            Buffer.from('5eded244e5532b3cdc23409dbad052d2', 'hex'),     // I2R: Initiator-to-Responder
            Buffer.from('a9e011b1737c6d4b70e4c0a2fe660476', 'hex'),     // R2I: Responder-to-Initiator
            Buffer.from('c5aead0e0691c420284c9580f90e07b0', 'hex'),     // Attestation Challenge
        ]
    }

    get AttestationChallenge() {
        return this._keys[SessionCryptoContext.KeyIndex.kAttestationChallenge]
    }

    /**
     * Run HKDF SHA256 algorithm to convert secret and salt into session keys.
     * 
     * @param {*} secret Buffer with secret input for KDF
     * @param {*} salt Buffer with salt input for KDF
     */
    initFromSecret(secret, salt, info, len=48)
    {
        if (CHIP_CONFIG_SECURITY_TEST_MODE) {
            logger.error("CHIP_CONFIG_SECURITY_TEST_MODE=1 security is using a known, fixed key!")
            //return
            secret = SECURITY_TEST_MODE_SECRET
            salt = SECURITY_TEST_MODE_SALT
            info = SECURITY_TEST_MODE_INFO
        }

        // HKDF SHA256
        var sessionKey = hkdf(secret, len, { salt, info, hash: 'SHA-256' })
        this._keys = [ 
            sessionKey.subarray(0,16),
            sessionKey.subarray(16,32),
            sessionKey.subarray(32)
        ]
        this._keys.forEach((key, i) => {
            // TODO: add special test mode for tracing secrets
            logger.trace("Session Secret["+i+"] = "+key.toString('hex'))
        })
    }
}

module.exports = SessionCryptoContext
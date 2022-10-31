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

const Crypto = require('./Crypto')

class GroupKey {

    static kSaltZero = Buffer.alloc(0)

    static kGroupKeyInfo = Buffer.from("GroupKey v1.0")
    static kGroupKeyHashInfo = Buffer.from("GroupKeyHash")
    static kPrivacyKeyInfo = Buffer.from("PrivacyKey")

    /**
    OperationalGroupKey =
        Crypto_KDF
        (
            InputKey = Epoch Key,
            Salt = CompressedFabricIdentifier,
            Info = "GroupKey v1.0",
            Length = CRYPTO_SYMMETRIC_KEY_LENGTH_BITS
        )
     * 
     * @param {Buffer} epochKey 
     * @param {Buffer} compressedFabricId 
     * @returns {Buffer} operationalGroupKey
     */
    static DeriveGroupKey(epochKey, compressedFabricId) {
        const groupKey = Crypto.Kdf(
            epochKey,
            compressedFabricId,
            this.kGroupKeyInfo,
            Crypto.CRYPTO_SYMMETRIC_KEY_LENGTH_BYTES
        )
        return groupKey
    }

    /**
    GKH = Crypto_KDF (
        InputKey = OperationalGroupKey,
        Salt = [],
        Info = "GroupKeyHash",
        Length = 16)
     * 
     * @param {Buffer} groupKey 
     * @returns {Buffer} groupKeyHash (groupSessionId)
     */
    static DeriveGroupKeyHash(groupKey) {
        const groupKeyHash = Crypto.Kdf(
            groupKey, 
            this.kSaltZero,
            this.kGroupKeyHashInfo,
            Crypto.CRYPTO_SYMMETRIC_KEY_LENGTH_BYTES
        )
        return groupKeyHash.subarray(0,2)
    }


    /**
    PrivacyKey =
         Crypto_KDF
         (
            InputKey = EncryptionKey,
            Salt = [],
            Info = "PrivacyKey",
            Length = CRYPTO_SYMMETRIC_KEY_LENGTH_BITS
         )
     * 
     * @param {Buffer} groupKey 
     * @returns {Buffer} privacyKey
     */
    static DerivePrivacyKey(groupKey) {
        const privacyKey = Crypto.Kdf(
            groupKey,
            this.kSaltZero,
            this.kPrivacyKeyInfo,
            Crypto.CRYPTO_SYMMETRIC_KEY_LENGTH_BYTES
        )
        return privacyKey
    }

}

module.exports = GroupKey
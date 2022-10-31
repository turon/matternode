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

const crypto = require('node:crypto')

const EC = require('elliptic').ec
const ec = new EC('p256')

const x509 = require("@peculiar/x509")
const webcrypto = require('@peculiar/webcrypto')
const webcryptoProvider = new webcrypto.Crypto()
const SubtleCrypto = webcryptoProvider.subtle
x509.cryptoProvider.set(webcryptoProvider)

const logger = require('../util/Logger')

/**
 * Crypto
 */
class Crypto {

    static CRYPTO_AEAD_MIC_LENGTH_BYTES = 16
    static CRYPTO_AEAD_CCM_NONCE_SIZE = 13
    static CRYPTO_AEAD_CTR_NONCE_SIZE = 16

    static CRYPTO_SYMMETRIC_KEY_LENGTH_BYTES = 16

    // CCM mode:
    // https://nodejs.org/api/crypto.html#:~:text=or%20compromised%20algorithms-,CCM%20mode,-Crypto%20constants
 
    /**
     * Crypto_GenerateKeyPair
     * @see 3.5.2. Key generation
     */
    static GenerateKeyPair() {
        var ecdh = crypto.createECDH('prime256v1')
        ecdh.generateKeys()
        return {
            privateKey: ecdh.getPrivateKey(),
            publicKey: ecdh.getPublicKey()
        }
    }

    static PublicFromPrivate(privateKey) {
        var ecdh = crypto.createECDH('prime256v1')
        ecdh.setPrivateKey(privateKey)
        return ecdh.getPublicKey()
    }

    /**
     * Crypto.Hash computes the cryptographic hash of a message.
     * @see 3.3. Hash function (Hash)
     * 
     * @param {Buffer} message 
     * @returns {Buffer} hash
     */
    static Hash(message) {
        return crypto.createHash('sha256').update(message).digest()
    }

    /**
     * Crypto.Hmac computes the Keyed-Hash Message Authentication Code (HMAC).
     * @see 3.4. Keyed-Hash Message Authentication Code (HMAC)
     * 
     * @param {Buffer} key
     * @param {Buffer} message 
     * @returns {Buffer} hmac
     */
    static Hmac(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest()
    }

    /**
     * Crypto.Kdf derives a new key with the given inputs.
     * @see 3.8. Key Derivation Function (KDF)
     * 
     * @param {Buffer} inputKey
     * @param {Buffer} salt 
     * @param {Buffer} info 
     * @param {number} length [bytes]
     * @returns {Buffer} outputKey
     */
     static Kdf(inputKey, salt, info, length) {
        const outputKey = crypto.hkdfSync('sha256', inputKey, salt, info, length)
        return Buffer.from(outputKey)
    }

    /**
     * Crypto_Sign generates a signature for the given message 
     * using the deterministic ECDSA-with-P256 algorithm.
     * 
     * @see RFC6979
     * @see 3.5.3. Signature and verification
     * 
     * @param {Buffer} message 
     * @param {Buffer} privateKey 
     * 
     * @returns {Buffer} [64 byte]: signature
     */
    static Sign(message, privateKey) {
        var key = ec.keyFromPrivate(privateKey)
        var digest = Crypto.Hash(message)
        var sig = key.sign(digest)
        return Buffer.concat([sig.r.toBuffer(), sig.s.toBuffer()])
    }

    /**
     * Crypto_Verify validates the given ECDSA signature for a message.
     * 
     * @see RFC6979
     * @see 3.5.3. Signature and verification
     * 
     * @param {Buffer} message 
     * @param {Buffer} signature  [64 bytes]: r || s
     * @param {Buffer} publicKey  [65 bytes]: 04 || x || y
     *
     * @returns {boolean} isValid
     */
    static Verify(message, signature, publicKey) {
        //logger.info("PUB = "+ publicKey.toString('hex'))
        // Public Key MUST be either:
        // 1) '04' + hex string of x + hex string of y; or
        // 2) object with two hex string properties (x and y); or
        // 3) object with two buffer properties (x and y)
        var keyHex = publicKey.toString('hex')
        var key = ec.keyFromPublic(keyHex, 'hex')
        var sig = {
            r: signature.subarray(0,32),
            s: signature.subarray(32),
        }
        var digest = Crypto.Hash(message)
        return key.verify(digest, sig)
    }

    /**
     * AeadEncrypt encrypts the given message using the given key.
     * @see 3.6.1. Generate and encrypt
     * 
     * byte[lengthInBytes(P) + CRYPTO_AEAD_MIC_LENGTH_BYTES]
     *   Crypto_AEAD_GenerateEncrypt(
     *           SymmetricKey K,
     *           byte[lengthInBytes(P)] P,
     *           byte[] A,
     *           byte[CRYPTO_AEAD_NONCE_LENGTH_BYTES] N)
     * 
     * @param {Buffer} key
     * @param {Buffer} message
     * @param {Buffer} additionalData
     * @param {Buffer} nonce
     * @returns {Buffer} ciphertext
     */
    static AeadEncrypt(key, plaintext, additionalData, nonce) {
        var cipher = crypto.createCipheriv("aes-128-ccm", key, nonce, {authTagLength: 16})
        cipher.setAAD(additionalData, { plaintextLength: plaintext.length })
        var ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
        var tag = cipher.getAuthTag()

        return Buffer.concat([ciphertext, tag])
    }

    /**
     * AeadDecrypt decrypts the given ciphertext using the given key.
     * @see 3.6.2. Decrypt and verify
     * 
     * {boolean success, byte[lengthInBytes(P)] payload}
     *   Crypto_AEAD_DecryptVerify(
     *      SymmetricKey K,
     *      byte[lengthInBytes(P) + CRYPTO_AEAD_MIC_LENGTH_BYTES] C,
     *      byte[] A,
     *      byte[CRYPTO_AEAD_NONCE_LENGTH_BYTES] N)
     */
    static AeadDecrypt(key, ciphertext, additionalData, nonce, mic) {
        var plaintext = null
        try {
            var decipher = crypto.createDecipheriv("aes-128-ccm", key, nonce, {authTagLength: 16})
            decipher.setAuthTag(mic)
            decipher.setAAD(additionalData, { plaintextLength: ciphertext.length })
            var plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
        } catch (err) {
            logger.error("Crypto: ERROR in decryption -- ", err.message)
            return null
        }
        return plaintext

    }

    /**
     * 
     * @see 3.7.1. Privacy encryption
     * byte[lengthInBytes(M)]
     *   Crypto_Privacy_Encrypt(
     *      SymmetricKey K,
     *      byte[lengthInBytes(M)] M,
     *      byte[CRYPTO_PRIVACY_NONCE_LENGTH_BYTES] N)
     * 
     * Crypto_Privacy_Encrypt(K, M, N) := 
     *      byte[lengthInBytes(M)]
     *      AES-CTR-Encrypt(K := K, P := M, N := N)
     */
    static PrivacyEncrypt(symmetricKey, plaintext, nonce) {
        var cipher = crypto.createCipheriv("aes-128-ccm", symmetricKey, nonce, {authTagLength: 16})
        var ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
        return ciphertext
    }

    /**
     * @see 3.7.2. Privacy decryption
     * 
     * byte[lengthInBytes(C)]
     *   Crypto_Privacy_Decrypt(
     *      SymmetricKey K,
     *      byte[lengthInBytes(C)] C,
     *      byte[CRYPTO_PRIVACY_NONCE_LENGTH_BYTES] N)
     * 
     * Crypto_Privacy_Decrypt(K, C, N) :=
     *      byte[lengthInBytes(C)]
     *      AES-CTR-Decrypt(K := K, C := C, N := N)
     */
    static PrivacyDecrypt(symmetricKey, ciphertext, nonce) {
        return Crypto.PrivacyEncrypt(symmetricKey, ciphertext, nonce)
    }

    /**
     * Crypto_GenerateCsr
     * 
     * @param {*} rawPrivateKey 
     * @returns {Buffer} CSR
     */
    static async GenerateCsr(rawPrivateKey) {
        const algorithm = {
            name: "ECDSA",
            namedCurve: "P-256",
            hash: "SHA-256",
        }
        const privateKey = await SubtleCrypto.importKey(
            "jwk", 
            { 
                kty: "EC",
                crv: "P-256",
                ext: true, 
                d: rawPrivateKey.toString('base64url'),
            },
            algorithm,
            true, // Extractable?
            ["sign"] 
        )
        const publicKey = await SubtleCrypto.importKey(
            "raw",
            Crypto.PublicFromPrivate(rawPrivateKey),
            algorithm,
            true, // Extractable?
            ["verify"] 
        )
        const keys = { privateKey, publicKey }
        //const keys = await SubtleCrypto.generateKey(algorithm, false, ["sign", "verify"])

        const csr = await x509.Pkcs10CertificateRequestGenerator.create({
            name: "O=CSA",
            keys,
            signingAlgorithm: algorithm,
            extenstions: [],
        });
          
        logger.trace('Generated CSR: '+csr.toString("hex"))
        return csr      
    }

    /**
     * Generates the CompressedFabricId for this Fabric.
     * 
     * CompressedFabricIdentifier =
     * Crypto_KDF(
     *   inputKey := TargetOperationalRootPublicKey,
     *   salt:= TargetOperationalFabricID,
     *   info := CompressedFabricInfo,
     *   len := 64 bits)
     * 
     * @param {Buffer} rootPublicKey
     * @param {BigInt} fabricId 
     * @returns {Buffer} compressedFabricId
     */
    static GenerateCompressedFabricId(rootPublicKey, fabricId) {
        const kCompressedFabricInfo = Buffer.from("CompressedFabric")
        const fabricIdBuffer = Buffer.alloc(8)
        fabricIdBuffer.writeBigUint64BE(fabricId)
        return Crypto.Kdf(rootPublicKey, fabricIdBuffer, kCompressedFabricInfo, 8)
    }

    /**
     * Returns a Buffer of random bytes of the given length.
     * 
     * bit[len] Crypto_DRBG(int len) 
     * 
     * @see 3.1 Deterministic Random Bit Generator (DRBG)
     */
    static Random(size) {
        return crypto.randomBytes(size)
    }

    /**
     * Returns a random 16-bit unsigned integer.
     */
    static RandomU16() {
        return crypto.randomBytes(2).readUInt16BE(0)
    }

    /**
     * Returns a random 32-bit unsigned integer.
     */
    static RandomU32() {
        return crypto.randomBytes(4).readUInt32BE(0)
    }

    /**
     * Returns a random 64-bit unsigned integer.
     */
    static RandomU64() {
        return crypto.randomBytes(8).readBigUint64BE(0)
    }
}

module.exports = Crypto
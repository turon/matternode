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

const crypto = require('crypto')

const logger = require('../util/Logger')
const MsgCodec = require('../message/MsgCodec')
const Crypto = require('../crypto/Crypto')

/**
 * Message is the core utility class for encode / decode of the raw Matter message format.
 * 
 * ExchangeManager will add the following fields during processing:
 *      .Exchange -- the Exchange object associated with the recieved message.
 */
class Message {

    static SESSION_ID_UNSECURED = 0x0000

    static MESSAGE_HEADER_MIN_SIZE = 8
    static MESSAGE_HEADER_CLEARTEXT_SIZE = 4
    static EXCHANGE_HEADER_MIN_SIZE = 6      ///< exchange flags, opcode, exchange id, protocol id

    static MESSAGE_NODE_ID_SIZE = 8
    static MESSAGE_GROUP_ID_SIZE = 2
    static CRYPTO_AEAD_MIC_LENGTH_BYTES = 16

    static ACK_COUNTER_SIZE = 4

    static DestinationType = {
        Omit: 0,
        NodeId: 1,
        GroupId: 2
    }

    static SourceType = {
        Omit: 0,
        NodeId: 4,
    }

    constructor(buf=undefined, enc=null, peerInfo=null)
    {
        if (buf == undefined) {
            buf = Buffer.alloc(Message.MESSAGE_HEADER_MIN_SIZE + Message.EXCHANGE_HEADER_MIN_SIZE)
        }
        this._buffer = buf
        this._encrypted = enc
        this._peerInfo = peerInfo

        this._hasSource = false
        this._hasDestination = false
    }

    get Decrypted() { return this._buffer }
    set Decrypted(buf) { this._buffer = buf }

    get Encrypted() { return this._encrypted }
    set Encrypted(buf) { this._encrypted = buf }

    get PeerInfo() { return this._peerInfo }
    set PeerInfo(peerInfo) { this._peerInfo = peerInfo }

    get MessageFlags() { return this._buffer.readUInt8(0) }
    get SessionId() { return this._buffer.readUInt16LE(1) }
    get SecurityFlags() { return this._buffer.readUInt8(3) }
    get MessageCounter() { return this._buffer.readUInt32LE(4) }

    set MessageFlags(v) { this._buffer.writeUInt8(v, 0) }
    set SessionId(v) { this._buffer.writeUInt16LE(v, 1) }
    set SecurityFlags(v) { this._buffer.writeUInt8(v, 3) }
    set MessageCounter(v) { this._buffer.writeUInt32LE(v, 4) }

    get Version() { return this.MessageFlags >> 4 }
    get Sflag() { return !!(this.MessageFlags & 0x04) } 
    set Sflag(v) {
        this.MessageFlags &= 0x04
        this.MessageFlags |= v & 0x04
    }

    // !! converts to boolean
    get Dsiz() { return this.MessageFlags & 0x03 }
    set Dsiz(v) {
        this.MessageFlags &= 0x03
        this.MessageFlags |= v & 0x03
    }

    get Mic() {
        const len = this._encrypted.length
        const mic = this._encrypted.subarray(len - Crypto.CRYPTO_AEAD_MIC_LENGTH_BYTES, len)
        return mic
    }

    get SourceNodeId() {
        if (this.Sflag) {
            return this._buffer.readBigUInt64LE(Message.MESSAGE_HEADER_MIN_SIZE)
        }
        else
        {
            return MsgCodec.NODE_ID_ANY
        }
    }

    set SourceNodeId(v) {
        const offset = Message.MESSAGE_HEADER_MIN_SIZE
        if (this.Sflag) {
            if (!this._hasSource)
            {
                this._buffer = Buffer.concat([
                    this._buffer.subarray(0,8),
                    Buffer.alloc(Message.MESSAGE_NODE_ID_SIZE),
                    this._buffer.subarray(8),
                ])
                this._hasSource = true
            }

            this._buffer.writeBigUInt64LE(BigInt(v),offset)
        }
    }

    get DestinationNodeId() {
        var dsiz = this.Dsiz
        var offset = Message.MESSAGE_HEADER_MIN_SIZE
        offset += (this.Sflag) ? Message.MESSAGE_NODE_ID_SIZE : 0   ///< shift for source node id

        if (dsiz == 1)
        {
            return this._buffer.readBigUInt64LE(offset)
        }
        else if (this.dsiz == 2)
        {
            return this._buffer.readUInt16LE(offset)
        }
        else
        {
            return MsgCodec.NODE_ID_ANY
        }
    }

    set DestinationNodeId(v) {
        var offset = Message.MESSAGE_HEADER_MIN_SIZE
        offset += (this.Sflag) ? Message.MESSAGE_NODE_ID_SIZE : 0

        if (this.Dsiz == 0) {

        } else {
            if (!this._hasDestination)
            {
                var destBuf

                if (this.Dsiz == 1) {
                    destBuf = Buffer.alloc(Message.MESSAGE_NODE_ID_SIZE)
                } else if (this.Dsiz == 2) {
                    destBuf = Buffer.alloc(Message.MESSAGE_GROUP_ID_SIZE)
                }

                this._buffer = Buffer.concat([
                    this._buffer.subarray(0,offset),
                    destBuf,
                    this._buffer.subarray(offset),
                ])

                this._hasDestination = true
            }

            if (this.Dsiz == 1) {
                this._buffer.writeBigUInt64LE(BigInt(v),offset)
            } else if (this.Dsiz == 2) {
                this._buffer.writeUInt16LE(v,offset)
            }
        }
    }

    get Pflag() { return !!(this.SecurityFlags & 0x80) }
    get Cflag() { return !!(this.SecurityFlags & 0x40) }
    get Mxflag() { return !!(this.SecurityFlags & 0x20) }
    get SessionType() { return this.SecurityFlags & 0x03 }

    get PayloadOffset() {
        var offset = Message.MESSAGE_HEADER_MIN_SIZE   // Fixed header offset
        offset += (this.Sflag) ? 8 : 0                 // Source nodeid offset

        var dsiz = this.Dsiz
        if (dsiz == 1)
        {
            offset += 8
        }
        else if (dsiz == 2)
        {
            offset += 2
        }

        return offset
    }

    get Payload() {
            return this._buffer.subarray(this.PayloadOffset)
    }

    get ExchangeFlags() { return this.Payload.readUInt8(0) }
    get ProtocolOpcode() { return this.Payload.readUInt8(1) }
    get ExchangeId() { return this.Payload.readUInt16LE(2) }
    get ProtocolId() { return Number(this.Payload.readUInt16LE(4)) }

    set ExchangeFlags(v) { this.Payload.writeUInt8(v,0) }
    set ProtocolOpcode(v) { this.Payload.writeUInt8(v,1) }
    set ExchangeId(v) { this.Payload.writeUInt16LE(v,2) }
    set ProtocolId(v) { this.Payload.writeUInt16LE(v,4) }

    get Iflag() { return !!(this.ExchangeFlags & 0x01) }
    get Aflag() { return !!(this.ExchangeFlags & 0x02) }
    get Rflag() { return !!(this.ExchangeFlags & 0x04) }
    get Sxflag() { return !!(this.ExchangeFlags & 0x08) }
    get Vflag() { return !!(this.ExchangeFlags & 0x10) }

    set Iflag(v) {
        if (v) {
            this.ExchangeFlags |= 0x01
        } else {
            this.ExchangeFlags &= ~0x01
        }
    }
    set Aflag(v) {
        if (v) {
            this.ExchangeFlags |= 0x02
        } else {
            this.ExchangeFlags &= ~0x02
        }
    }
    set Rflag(v) {
        if (v) {
            this.ExchangeFlags |= 0x04
        } else {
            this.ExchangeFlags &= ~0x04
        }
    }

    set AckCounter(v) {
        var offset = this.PayloadOffset + Message.EXCHANGE_HEADER_MIN_SIZE
        if (this.Aflag) {
            this._buffer = Buffer.concat([
                this._buffer.subarray(0,offset),
                Buffer.alloc(Message.ACK_COUNTER_SIZE),
                this._buffer.subarray(offset),
            ])

            this._buffer.writeUInt32LE(v,offset)
        }
    }


    isUnencrypted() { return ((this.SessionType == 0) && (this.SessionId == Message.SESSION_ID_UNSECURED)) }
    isEncrypted() { return !this.isUnencrypted() }

    get AppPayload() {
        var exchangeHeaderSize = Message.EXCHANGE_HEADER_MIN_SIZE
        exchangeHeaderSize += (this.Aflag) ? Message.ACK_COUNTER_SIZE : 0
        return this._buffer.subarray(this.PayloadOffset + exchangeHeaderSize)
    }

    set AppPayload(v) {
        this._buffer = Buffer.concat([this._buffer, v])
    }

    /**
     * Calculate Encryption Nonce for the given plaintext message.
     * 
     * @see 4.7.1.1. Nonce
     * N = Security Flags || Message Counter || Source Node ID
     */
    get Nonce() {
        var sourceNodeId = this.SourceNodeId
        if (sourceNodeId == MsgCodec.NODE_ID_ANY) { sourceNodeId = 0n }
        return MsgCodec.getNonce(this._buffer, sourceNodeId)
    }

    /**
     * Calculate the Privacy Nonce for the given encrypted message.
     * 
     * @see 4.8.2. Privacy Processing of Outgoing Messages
     * N = Session ID || MIC[(CRYPTO_AEAD_NONCE_LENGTH_BYTES-3)..0]
     */
    get PrivacyNonce() {
        const MIC_FRAGMENT_SIZE = 11
        const sessionId = this.SessionId
        const mic = this.Mic
        const micFragment = mic.subarray(Crypto.CRYPTO_AEAD_MIC_LENGTH_BYTES-MIC_FRAGMENT_SIZE, 
            Crypto.CRYPTO_AEAD_MIC_LENGTH_BYTES)

        var offset = 0
        var privacyNonce = Buffer.alloc(MIC_FRAGMENT_SIZE+2)
        privacyNonce.writeUInt16BE(sessionId,offset)
        offset += 2
        privacyNonce.fill(micFragment,offset)

        return privacyNonce
    }

    encrypt(key, apply=true) {
        if (this.isUnencrypted()) { return undefined }

        const buf = MsgCodec.encrypt(this._buffer, key)
        logger.trace("Secure: " + buf.toString('hex'))
        if (apply) {
            this._encrypted = buf
        }

        return buf
    }

    decrypt(key, apply=true) {
        if (this.isUnencrypted()) { return undefined }

        var dmsg = MsgCodec.decrypt(this._encrypted, key)

        if (!dmsg) {
            logger.error("Error: message failed authentication")
            return undefined
        }

        if (apply) {
            this._buffer = dmsg
        }

        return dmsg
    }



    /**
     * Obfuscate the plaintext header portions of the encrypted message.
     *
     * @param {Buffer} privacyKey The privacy key to use for obfuscation.
     * @param {boolean} apply If true, the deobfuscated header will be applied to the message.
     * @returns {Buffer} The deobfuscated header.
     */
     privacyEncrypt(privacyKey, apply=true) {
        if (!this.Pflag) { return this._encrypted }

        const offsetStart = Message.MESSAGE_HEADER_CLEARTEXT_SIZE
        const offsetEnd = this.PayloadOffset
        const plainText = this._encrypted.subarray(offsetStart, offsetEnd)

        const privateHeader = Crypto.PrivacyEncrypt(privacyKey, plainText, this.PrivacyNonce)
        /*
        const flags = Buffer.from([0x01])   // q=2, thus q-1 = 1
        const counter = Buffer.from([0x00, 0x00])
        const iv = Buffer.concat([flags, this.PrivacyNonce, counter])
        var cipher = crypto.createCipheriv("aes-128-ctr", privacyKey, iv)
        const privateHeader = Buffer.concat([cipher.update(plainText), cipher.final()])
        */
    
        const privateMessage = Buffer.concat([this._encrypted.subarray(0,offsetStart), privateHeader, this._encrypted.subarray(offsetEnd)])
        if (apply) {
            this._encrypted = privateMessage
        }
        return privateMessage
    }

    /**
     * Deobfuscate the private header portions of the encrypted message.
     *
     * @param {Buffer} privacyKey The privacy key to use for deobfuscation.
     * @param {boolean} apply If true, the deobfuscated header will be applied to the message.
     * @returns {Buffer} The deobfuscated header.
     */
    privacyDecrypt(privacyKey, apply=true) {
        if (!this.Pflag) { return this._encrypted }

        const offsetStart = Message.MESSAGE_HEADER_CLEARTEXT_SIZE
        const offsetEnd = this.PayloadOffset
        const privateText = this._encrypted.subarray(offsetStart, offsetEnd)
        const plainHeader = Crypto.PrivacyEncrypt(privacyKey, privateText, this.PrivacyNonce)
    
        /*
        const flags = Buffer.from([0x01])   // q=2, thus q-1 = 1
        const counter = Buffer.from([0x00, 0x00])
        const iv = Buffer.concat([flags, this.PrivacyNonce, counter])
        var cipher = crypto.createDecipheriv("aes-128-ctr", privacyKey, iv)
        const plainHeader = Buffer.concat([cipher.update(privateText), cipher.final()])
        */
    
        const plainMessage = Buffer.concat([this._encrypted.subarray(0,offsetStart), plainHeader, this._encrypted.subarray(offsetEnd)])
        if (apply) {
            this._encrypted = plainMessage
            this._buffer = plainMessage      // Replace with encrypted buffer for Nonce calculation.
        }
        return plainMessage
    }
}

module.exports = Message
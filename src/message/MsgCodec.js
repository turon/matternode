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

var crypto = require('crypto')
var logger = require('../util/Logger')

/**
 * A class for encode and decode of Matter Messages.
 */
class MsgCodec {

    static DEFAULT_PORT = 5540;
    static DEFAULT_HOST = '::1';

    static MTU = 1280

    // Message Flags
    static MSG_FLAGS_VERSION_OFFSET = 4

    static MSG_FLAGS_SRC_OMIT       = 0x00
    static MSG_FLAGS_SRC_PRESENT    = 0x04
    
    static MSG_FLAGS_DST_OMIT       = 0x00
    static MSG_FLAGS_DST_PRESENT    = 0x01
    static MSG_FLAGS_DST_GROUP      = 0x02
    
    // Security Flags
    static SEC_FLAGS_PRIVACY        = 0x80
    static SEC_FLAGS_CONTROL        = 0x40
    static SEC_FLAGS_MX             = 0x20  ///< Message extensions
    
    static MSG_SESSION_TYPE_UNICAST = 0x00
    static MSG_SESSION_TYPE_GROUP   = 0x01

    // Exchange Flags
    static EXC_FLAGS_INITIATOR      = 0x01
    static EXC_FLAGS_ACK            = 0x02
    static EXC_FLAGS_RELIABILITY    = 0x04
    static EXC_FLAGS_SX             = 0x08   ///< Secure extensions
    static EXC_FLAGS_VENDOR         = 0x10

    static NODE_ID_ANY = 0xFFFFFFFFFFFFFFFFn

    /**
     * Encodes the given flags into a MessageFlags byte.
     * 
     *   |===
     *   |~bit~ ~7~|~6~|~5~|~4~|~3~ | ~2~|~1~|~0~
     * 4+| Version             | -  |S 2+| DSIZ
     *   |===
     * 
     * @param {number} dsiz destination size
     * @param {number} sFlag source present flags
     * @param {number} version Version nibble
     * @returns {number} Encoded message flags
     */
    static encodeMessageFlags(dsiz = 0, sFlag = 0, version = 0) {
        var flags = 0

        flags |= (version & 0x0F) << 4
        flags |= (sFlag & 0x01) << 2
        flags |= (dsiz & 0x03)

        return flags
    }

    /**
     * Encodes the given flags into a SecurityFlags byte.
     * 
     * |===
     * |~bit~ ~7~|~6~|~5~   |~4~|~3~|~2~ |~1~|~0~
     * | P       | C | MX 3+| Reserved 2+| Session Type
     * |===
     * 
     * @param {number} sessionType session type nibble
     * @param {number} cFlag control message flag
     * @param {number} pFlag privacy flag
     * @param {number} mxFlag message extensions flag
     * 
     * @returns {number} Encoded security flags
     */
    static encodeSecurityFlags(sessionType, cFlag = 0, pFlag = 0, mxFlag = 0) {
        var flags = 0
    
        flags |= (pFlag & 0x01) << 7
        flags |= (cFlag & 0x01) << 6
        flags |= (mxFlag & 0x01) << 5
        flags |= (sessionType & 0x03)
    
        return flags
    }

    /**
     * Encodes the given flags into an ExchangeFlags byte.
     * 
     * |===
     * |~bit~ ~7~|~6~|~5~|~4~|~3~ |~2~|~1~|~0~
     * |   -     | - | - | V | SX | R | A | I
     * |===
     * 
     * @param {number} iFlag initiator flag
     * @param {number} aFlag acknowledgement flag
     * @param {number} rFlag reliability flag
     * @param {number} vFlag vendor protocol flag
     * @param {number} sxFlag secure extensions flag
     * 
     * @returns {number} Encoded exchange flags
     */
    static encodeExchangeFlags(iFlag, aFlag, rFlag, vFlag = 0, sxFlag = 0) {
        var flags = 0
        
        flags |= (vFlag & 0x01) << 4
        flags |= (sxFlag & 0x01) << 3
        flags |= (rFlag & 0x01) << 2
        flags |= (aFlag & 0x01) << 1
        flags |= (iFlag & 0x01)
        
        return flags
    }

    /**
     * Encodes the given fields into an unencrypted message header.
     * 
     * @param {number} msgFlags Message flags byte
     * @param {number} sessionId Session Id uint16
     * @param {number} secFlags Security flags byte
     * @param {number} msgCounter Message counter
     * @param {BigInt} src Source Node Id or null
     * @param {BigInt} dst Destination Node Id or null
     * @param {number} msgLength Message length or null
     * @returns {Buffer} Encoded message header as Buffer
     */
    static encodeHeader(msgFlags, secFlags, sessionId, msgCounter, src = null, dst = null) {
        var offset = 0
        var buf = Buffer.alloc(this.MTU)

        // Mandatory fields
        buf.writeUInt8(msgFlags,offset++)
        buf.writeUInt16LE(sessionId,offset)
        offset += 2
        buf.writeUInt8(secFlags,offset++)
        buf.writeUInt32LE(msgCounter,offset)
        offset += 4

        if ((msgFlags & MsgCodec.MSG_FLAGS_SRC_PRESENT) && (src != null)) {
            buf.writeBigUInt64LE(src,offset)
            offset += 8
        }
        if ((msgFlags & MsgCodec.MSG_FLAGS_DST_PRESENT) && (dst != null)) {
            buf.writeBigUInt64LE(dst,offset)
            offset += 8
        }
        return buf.subarray(0, offset)
    }

    /**
     * Encode the Matter Protocol Header with the given parameters.
     *
     * @param {number} exchangeFlags Exchange Flags field
     * @param {number} opcode Protocol Opcode
     * @param {number} exchangeId Exchange Identifier
     * @param {number} protocolId Protocol Identifier
     * @param {number} vendorId Protocol Vendor Identifier
     * @param {number} ackMsgCounter Acknowledgement Message Counter
     * @returns {Buffer} Encoded protocol header as Buffer
     */
    static encodeProtocolHeader(exchangeFlags, exchangeId, opcode, protocolId, vendorId = null, ackMsgCounter = null) {
        var offset = 0
        var buf = Buffer.alloc(this.MTU)

        // Mandatory fields
        buf.writeUInt8(exchangeFlags,offset++)
        buf.writeUInt8(opcode,offset++)
        buf.writeUInt16LE(exchangeId,offset)
        offset += 2
        buf.writeUInt16LE(protocolId,offset)
        offset += 2

        if (vendorId != null) {
            buf.writeUInt16LE(vendorId,offset)
            offset += 2
        }
        if (ackMsgCounter != null) {
            buf.writeUInt32LE(ackMsgCounter,offset)
            offset += 4
        }
        return buf.subarray(0, offset)
    }

    /**
     * Extract nonce from given message.
     *
     * @param {Buffer} msg Message to extract Nonce from.
     *
     * @returns {Buffer} Nonce of given message.
     */
    static getNonce(msg, srcNode=0n) {
        var nonce = msg.subarray(3,8)
        var src
        if (msg[0] & MsgCodec.MSG_FLAGS_SRC_PRESENT) {
            src = msg.subarray(8,16)
        } else {
            src = Buffer.alloc(8)
            src.writeBigUInt64LE(srcNode,0)
        }
        nonce = Buffer.concat([nonce,src],13)

        logger.trace("Nonce:  " + nonce.toString('hex'))

        return nonce
    }

    /**
     * Encrypt the given message with the provided key.
     *
     * @param {Buffer} msg Plaintext message to encrypt.
     * @param {Buffer} key EncryptionKey to use to encrypt message.
     * @param {Buffer} nonce Extract from message in big endian format.
     */
    static encrypt(msg, key) {
        var headerSize = 8  // msgFlags (1) + sessionId (2) + secFlags (1) + msgCounter (4)
        if (msg[0] & MsgCodec.MSG_FLAGS_SRC_PRESENT) { headerSize += 8 }
        if (msg[0] & MsgCodec.MSG_FLAGS_DST_PRESENT) { headerSize += 8 }
        if (msg[0] & MsgCodec.MSG_FLAGS_DST_GROUP) { headerSize += 2 }

        const nonce = MsgCodec.getNonce(msg)      // number used only once
        const aad = msg.subarray(0,headerSize)    // additional authenticated data
        const pay = msg.subarray(headerSize)      // plaintext payload to be encrypted

        logger.trace("AAD:  " + aad.toString('hex'))
        logger.trace("Plain:  " + pay.toString('hex'))

        // TODO(#8): move AES-CCM into crypto/Crypto.js
        var cipher = crypto.createCipheriv("aes-128-ccm", key, nonce, {authTagLength: 16})
        cipher.setAAD(aad, { plaintextLength: pay.length })
        var encrypted = Buffer.concat([cipher.update(pay), cipher.final()])
        var tag = cipher.getAuthTag()

        logger.trace("Tag:  " + tag.toString('hex'))

        return Buffer.concat([aad, encrypted, tag])
    }

    /**
     * Decrypt the given message with the provided key.
     *
     * @param {Buffer} enc Encrypted message to decrypt.
     * @param {Buffer} key EncryptionKey to use to decrypt message.
     */
     static decrypt(msg, key) {
        var headerSize = 8  // msgFlags (1) + sessionId (2) + secFlags (1) + msgCounter (4)
        if (msg[0] & MsgCodec.MSG_FLAGS_SRC_PRESENT) { headerSize += 8 }
        if (msg[0] & MsgCodec.MSG_FLAGS_DST_PRESENT) { headerSize += 8 }
        if (msg[0] & MsgCodec.MSG_FLAGS_DST_GROUP) { headerSize += 2 }

        const nonce = MsgCodec.getNonce(msg)                   // number used only once
        const aad = msg.subarray(0,headerSize)                 // additional authenticated data
        const enc = msg.subarray(headerSize,msg.length-16)     // encrypted message to be decrypted
        const mic = msg.subarray(msg.length-16)                // message integrity check / tag

        logger.trace("MSG:    " + msg.toString('hex'))
        logger.trace("AAD:    " + aad.toString('hex'))
        logger.trace("NONCE:  " + nonce.toString('hex'))
        logger.trace("Cipher: " + enc.toString('hex'))
        logger.trace("MIC:    " + mic.toString('hex'))

        var dmsg = null

        try {
            var decipher = crypto.createDecipheriv("aes-128-ccm", key, nonce, {authTagLength: 16})
            decipher.setAuthTag(mic)
            decipher.setAAD(aad, { plaintextLength: enc.length })
            dmsg = Buffer.concat([decipher.update(enc), decipher.final()])
        } catch (err) {
            logger.error("Crypto: ERROR in decryption -- ", err.message)
            return null
        }

        return Buffer.concat([aad, dmsg])
    }
}

module.exports = MsgCodec

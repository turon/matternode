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

import { TlvType } from './TlvType'

export class TlvCodec {

    static TLV_TYPE_SIGNED_INTEGER = 0x00
    static TLV_TYPE_UNSIGNED_INTEGER = 0x04
    static TLV_TYPE_BOOLEAN_FALSE = 0x08
    static TLV_TYPE_BOOLEAN_TRUE = 0x09
    static TLV_TYPE_FLOAT = 0x0A
    static TLV_TYPE_DOUBLE = 0x0B
    static TLV_TYPE_UTF8_STRING = 0x0C
    static TLV_TYPE_BYTE_STRING = 0x10
    static TLV_TYPE_NULL = 0x14
    static TLV_TYPE_STRUCTURE = 0x15
    static TLV_TYPE_ARRAY = 0x16
    static TLV_TYPE_LIST = 0x17
    static TLV_TYPE_END = 0x18

    static TLV_TAG_CONTROL_ANONYMOUS = 0x00
    static TLV_TAG_CONTROL_CONTEXT_SPECIFIC = 0x20
    static TLV_TAG_CONTROL_COMMON_PROFILE_2Bytes = 0x40
    static TLV_TAG_CONTROL_COMMON_PROFILE_4Bytes = 0x60
    static TLV_TAG_CONTROL_IMPLICIT_PROFILE_2Bytes = 0x80
    static TLV_TAG_CONTROL_IMPLICIT_PROFILE_4Bytes = 0xA0
    static TLV_TAG_CONTROL_FULLY_QUALIFIED_6Bytes = 0xC0
    static TLV_TAG_CONTROL_FULLY_QUALIFIED_8Bytes = 0xE0

    static INT8_MIN = -128
    static INT16_MIN = -32768
    static INT32_MIN = -2147483648
    static INT64_MIN = -9223372036854775808

    static INT8_MAX = 127
    static INT16_MAX = 32767
    static INT32_MAX = 2147483647
    static INT64_MAX = 9223372036854775807

    static UINT8_MAX = 255
    static UINT16_MAX = 65535
    static UINT32_MAX = 4294967295
    static UINT64_MAX = 18446744073709551615

    static ElementTypes : Record<number,string> =
    {
        0x00: "int8",       // "Signed Integer 1-byte value",
        0x01: "int16",      // "Signed Integer 2-byte value",
        0x02: "int32",      // "Signed Integer 4-byte value",
        0x03: "int64",      // "Signed Integer 8-byte value",
        0x04: "uint8",      // "Unsigned Integer 1-byte value",
        0x05: "uint16",     // "Unsigned Integer 2-byte value",
        0x06: "uint32",     // "Unsigned Integer 4-byte value",
        0x07: "uint64",     // "Unsigned Integer 8-byte value",
        0x08: "boolean",    // "Boolean False",
        0x09: "boolean",    // "Boolean True",
        0x0A: "float",      // "Floating Point 4-byte value",
        0x0B: "double",     // "Floating Point 8-byte value",
        0x0C: "string uint8 len",       // "UTF-8 String 1-byte length",
        0x0D: "string uint16 len",      // "UTF-8 String 2-byte length",
        0x0E: "string uint32 len",      // "UTF-8 String 4-byte length",
        0x0F: "string uint64 len",      // "UTF-8 String 8-byte length",
        0x10: "Buffer uint8 len",       // "Byte String 1-byte length",
        0x11: "Buffer uint16 len",      // "Byte String 2-byte length",
        0x12: "Buffer uint32 len",      // "Byte String 4-byte length",
        0x13: "Buffer uint64 len",      // "Byte String 8-byte length",
        0x14: "null",
        0x15: "struct",
        0x16: "array",
        0x17: "list",
        0x18: "End of Collection",
    }
    
    static TagControls : Record<number,string> =
    {
        0x00: "Anonymous",
        0x20: "Context 1-byte",
        0x40: "Common Profile 2-byte",
        0x60: "Common Profile 4-byte",
        0x80: "Implicit Profile 2-byte",
        0xA0: "Implicit Profile 4-byte",
        0xC0: "Fully Qualified 6-byte",
        0xE0: "Fully Qualified 8-byte",
    }

    /**
     * Encode a value as a TLV signed integer.
     * 
     * @param {number|BigInt} val 
     */
    static encodeSignedInt(val:number|bigint) : Buffer {
        var encoded:Buffer

        if (val >= TlvCodec.INT8_MIN && val <= TlvCodec.INT8_MAX)
        {
            encoded = Buffer.alloc(1)
            encoded.writeInt8(Number(val))
        } 
        else if (val >= TlvCodec.INT16_MIN && val <= TlvCodec.INT16_MAX)
        {
            encoded = Buffer.alloc(2)
            encoded.writeInt16LE(Number(val))
        } 
        else if (val >= TlvCodec.INT32_MIN && val <= TlvCodec.INT32_MAX)
        {
            encoded = Buffer.alloc(4)
            encoded.writeInt32LE(Number(val))
        } 
        else if (val >= TlvCodec.INT64_MIN && val <= TlvCodec.INT64_MAX)
        {
            encoded = Buffer.alloc(8)
            encoded.writeBigInt64LE(BigInt(val))
        } 
        else
        {
            throw("TLV: Integer value out of range")
        }

        return encoded
    }    

    static encodeU64(val:number|bigint) : Buffer {
        var encoded = Buffer.alloc(8)
        encoded.writeBigUInt64LE(BigInt(val))
        return encoded
    }

    /**
     * Encode a value as a TLV unsigned integer.
     * 
     * @param {number} val 
     */
    static encodeUnsignedInt(val:number) : Buffer {
        var encoded:Buffer

        if (val < 0)
        {
            throw("TLV: Integer value out of range")
        } 
        else if (val <= TlvCodec.UINT8_MAX)
        {
            encoded = Buffer.alloc(1)
            encoded.writeUInt8(val)
        }
        else if (val <= TlvCodec.UINT16_MAX)
        {
            encoded = Buffer.alloc(2)
            encoded.writeUInt16LE(val)
        }
        else if (val <= TlvCodec.UINT32_MAX)
        {
            encoded = Buffer.alloc(4)
            encoded.writeUInt32LE(val)
        }
        else if (val <= TlvCodec.UINT64_MAX)
        {
            encoded = Buffer.alloc(8)
            encoded.writeBigUInt64LE(BigInt(val))
        }
        else
        {
            throw("TLV: Integer value out of range")
        }

        return encoded
    }

    /**
     * Encode a value as a TLV floating point.
     * 
     * @param {number} val 
     */
    static encodeFloat(val:number) : Buffer {
        var encoded = Buffer.alloc(4)
        encoded.writeFloatLE(val)
        return encoded
    }

    /**
     * Encode a value as a TLV double.
     * 
     * @param {number} val 
     */
    static encodeDouble(val:number) : Buffer {
        var encoded = Buffer.alloc(8)
        encoded.writeDoubleLE(val)
        return encoded
    }
    
    static encodeTag(tag:number)
    {
        var encoded = Buffer.alloc(0)

        if (tag >= 0 || tag <= TlvCodec.UINT16_MAX) {
            encoded = Buffer.alloc(2)
            encoded.writeUInt16LE(tag)
        }
        else if (tag > TlvCodec.UINT16_MAX || tag <= TlvCodec.UINT32_MAX)
        {
            encoded = Buffer.alloc(4)
            encoded.writeUInt32LE(tag)
        }
        return encoded
    }

    /**
     * Encode the TLV Control Octet containing Tag Control and Element Type fields.
     * 
     * @param {number} type
     * @param {number} lenOfLenOrVal 
     * @param {number?} tag 
     * @param {number?} profile 
     */
    static encodeControlByte(type:number, lenOfLenOrVal:number=0, tag?:number, profile?:number) : Buffer {
        var encoded = Buffer.alloc(0)
        var encodedControl = Buffer.alloc(1)
        var controlByte = type

        if (lenOfLenOrVal == 2)
        {
            controlByte |= 1
        }
        else if (lenOfLenOrVal == 4)
        {
            controlByte |= 2
        }
        else if (lenOfLenOrVal == 8)
        {
            controlByte |= 3
        }
        else if (lenOfLenOrVal > 1)
        {
            throw("TLV: Illegal control value length")
        }
    
        if (profile == undefined)
        {
            // Anonymous or context-specific

            if (tag == undefined)
            {
                controlByte |= TlvCodec.TLV_TAG_CONTROL_ANONYMOUS
            }
            else if (typeof(tag) == "number")
            {
                if (tag < 0 || tag > TlvCodec.UINT8_MAX) 
                {
                    throw("TLV: Context-specific tag number out of range")
                }
                controlByte |= TlvCodec.TLV_TAG_CONTROL_CONTEXT_SPECIFIC
                encoded = Buffer.alloc(1)
                encoded.writeUInt8(tag)
            }
        }
        else if (profile == 0 || 
                 profile == TlvCodec.TLV_TAG_CONTROL_COMMON_PROFILE_2Bytes ||
                 profile == TlvCodec.TLV_TAG_CONTROL_COMMON_PROFILE_4Bytes)
        {
            // Common profile
            if (tag == undefined)
            {
                throw("TLV: tag undefined")
            }
            else if (tag >= 0 && tag <= TlvCodec.UINT16_MAX)
            {
                controlByte |= TlvCodec.TLV_TAG_CONTROL_COMMON_PROFILE_2Bytes
                encoded = Buffer.alloc(2)
                encoded.writeUInt8(controlByte)
                encoded.writeUInt16LE(tag)
            }
            else if (tag > TlvCodec.UINT16_MAX && tag <= TlvCodec.UINT32_MAX)
            {
                controlByte |= TlvCodec.TLV_TAG_CONTROL_COMMON_PROFILE_4Bytes
                encoded = Buffer.alloc(4)
                encoded.writeUInt32LE(tag)
            }
            else
            {
                throw("TLV: Illegal tag length")
            }
        }
        else if (profile == -1 || 
                 profile == TlvCodec.TLV_TAG_CONTROL_IMPLICIT_PROFILE_2Bytes ||
                 profile == TlvCodec.TLV_TAG_CONTROL_IMPLICIT_PROFILE_4Bytes)
        {
            // Implicit profile
            if (tag == undefined)
            {
                throw("TLV: tag undefined")
            }
            else if (tag >= 0 && tag <= TlvCodec.UINT16_MAX)
            {
                controlByte |= TlvCodec.TLV_TAG_CONTROL_IMPLICIT_PROFILE_2Bytes
                encoded = Buffer.alloc(2)
                encoded.writeUInt16LE(tag)
            }
            else if (tag > TlvCodec.UINT16_MAX && tag <= TlvCodec.UINT32_MAX)
            {
                controlByte |= TlvCodec.TLV_TAG_CONTROL_IMPLICIT_PROFILE_4Bytes
                encoded = Buffer.alloc(4)
                encoded.writeUInt32LE(tag)
            }
            else
            {
                throw("TLV: Illegal tag length")
            }
        }
        else 
        {
            // Fully qualified profile tag
            if (tag == undefined)
            {
                throw("TLV: tag undefined")
            }
            if (tag >= 0 && tag <= TlvCodec.UINT16_MAX)
            {
                controlByte |= TlvCodec.TLV_TAG_CONTROL_FULLY_QUALIFIED_6Bytes
                encoded = Buffer.alloc(6)
                encoded.writeUInt32LE(profile)
                encoded.writeUInt16LE(tag,4)
            }
            else if (tag > TlvCodec.UINT16_MAX && tag <= TlvCodec.UINT32_MAX)
            {
                controlByte |= TlvCodec.TLV_TAG_CONTROL_FULLY_QUALIFIED_8Bytes
                encoded = Buffer.alloc(8)
                encoded.writeUInt32LE(profile)
                encoded.writeUInt32LE(tag,4)
            }
        }

        encodedControl.writeUInt8(controlByte)
        var result = Buffer.concat([encodedControl, encoded]);
        return result
    }

    /**
     * Encode the TLV Control Octet containing Tag Control and Element Type fields.
     * 
     * @param {Buffer} tlv
     */
    static decodeControlByte(tlv:Buffer) : TlvType.DecodedControlByte {
        var controlByte:number = tlv.readUInt8(0)
        var elementType:number = controlByte & 0x1F
        var tagControl:number = controlByte & 0xE0
        return {
            'typeNum': elementType,
            'tagType': tagControl,
            'type': TlvCodec.ElementTypes[elementType],
            'tagTypeName': TlvCodec.TagControls[tagControl]
        }
    }

    /**
     * Decodes the first byte of a TLV element into an element {value, length} tuple.
     * @param {Buffer} tlv 
     * @param {number} elementType 
     * @returns { TlvType.ValueLength}
     */
    static decodeValueAndLength(tlv:Buffer, elementType:number) : TlvType.ValueLength {
        var v = undefined
        var l = 0
    
        // Process primitive types [Control][Value]
        if (elementType == TlvCodec.TLV_TYPE_NULL)
        {
            v = undefined
        }
        else if (elementType == TlvCodec.TLV_TYPE_BOOLEAN_TRUE)
        {
            v = true
        }
        else if (elementType == TlvCodec.TLV_TYPE_BOOLEAN_FALSE)
        {
            v = false
        }
        else if (elementType == TlvCodec.TLV_TYPE_UTF8_STRING ||
                 elementType == TlvCodec.TLV_TYPE_BYTE_STRING ||
                 elementType == TlvCodec.TLV_TYPE_UNSIGNED_INTEGER) 
        {
            v = tlv.readUInt8(0)
            l = 1
        } 
        else if (elementType == TlvCodec.TLV_TYPE_UTF8_STRING+1 ||
                 elementType == TlvCodec.TLV_TYPE_BYTE_STRING+1 ||
                 elementType == TlvCodec.TLV_TYPE_UNSIGNED_INTEGER+1)
        {
            v = tlv.readUInt16LE(0)
            l = 2
        } 
        else if (elementType == TlvCodec.TLV_TYPE_UTF8_STRING+2 ||
                 elementType == TlvCodec.TLV_TYPE_BYTE_STRING+2 ||
                 elementType == TlvCodec.TLV_TYPE_UNSIGNED_INTEGER+2)
        {
            v = tlv.readUInt32LE(0)
            l = 4
        } 
        else if (elementType == TlvCodec.TLV_TYPE_UTF8_STRING+3 ||
                 elementType == TlvCodec.TLV_TYPE_BYTE_STRING+3 ||
                 elementType == TlvCodec.TLV_TYPE_UNSIGNED_INTEGER+3)
        {
            v = tlv.readBigUInt64LE(0)
            l = 8
        }
        else if (elementType == TlvCodec.TLV_TYPE_SIGNED_INTEGER)
        {
            v = tlv.readInt8(0)
            l = 1
        } 
        else if (elementType == TlvCodec.TLV_TYPE_SIGNED_INTEGER+1)
        {
            v = tlv.readInt16LE(0)
            l = 2
        } 
        else if (elementType == TlvCodec.TLV_TYPE_SIGNED_INTEGER+2)
        {
            v = tlv.readInt32LE(0)
            l = 4
        } 
        else if (elementType == TlvCodec.TLV_TYPE_SIGNED_INTEGER+3)
        {
            v = tlv.readBigInt64LE(0)
            l = 8
        } 
        else if (elementType == TlvCodec.TLV_TYPE_FLOAT)
        {
            v = tlv.readFloatLE(0)
            l = 4
        } 
        else if (elementType == TlvCodec.TLV_TYPE_DOUBLE)
        {
            v = tlv.readDoubleLE(0)
            l = 8
        } 
        else if (elementType == TlvCodec.TLV_TYPE_STRUCTURE ||
                 elementType == TlvCodec.TLV_TYPE_ARRAY ||
                 elementType == TlvCodec.TLV_TYPE_LIST)
        {
            v = []
        } 

        // Post-processing for utf8 and byte strings: [Control][Length][Value]
        if ((elementType >= TlvCodec.TLV_TYPE_UTF8_STRING &&
             elementType <= TlvCodec.TLV_TYPE_UTF8_STRING+3) &&
             typeof(v) === 'number')
        {
            var lenSize:number = l
            var valSize:number = v
            v = tlv.subarray(lenSize,lenSize+valSize).toString("utf-8")
            l += valSize
        }
        else if ((elementType >= TlvCodec.TLV_TYPE_BYTE_STRING &&
                  elementType <= TlvCodec.TLV_TYPE_BYTE_STRING+3) &&
                  typeof(v) === 'number')
        {   
            var lenSize:number = l
            var valSize:number = v
            v = tlv.subarray(lenSize,lenSize+valSize)
            l += valSize
        } 

        return {"value": v, "length": l}
    }

    /**
     * The control byte specifies the type of a TLV element and how its tag, length and value 
     * fields are encoded. The control byte consists of two subfields: 
     * an element type field which occupies the lower 5 bits,
     * and a tag control field which occupies the upper 3 bits. The element type field encodes the element’s type
     * as well as how the corresponding length and value fields are encoded.  In the case of Booleans and the
     * null value, the element type field also encodes the value itself."
     *
     * @param {Buffer} tlv 
     * @param {number} tagType 
     * @returns {Object} deterministic json representation of tlv
     */
    static decodeTagAndLength(tlv:Buffer, tagType:number) : TlvType.DecodedTagLength {
        var profile = undefined
        var tag
        var l = 0
    
        // Process primitive types [Control][Value]
        if (tagType == TlvCodec.TLV_TAG_CONTROL_ANONYMOUS)
        {
            tag = undefined
        }
        else if (tagType == TlvCodec.TLV_TAG_CONTROL_CONTEXT_SPECIFIC) 
        {
            tag = tlv.readUInt8(0)
            l = 1
        } 
        else if (tagType == TlvCodec.TLV_TAG_CONTROL_COMMON_PROFILE_2Bytes ||
                 tagType == TlvCodec.TLV_TAG_CONTROL_IMPLICIT_PROFILE_2Bytes)
        {
            profile = 0
            tag = tlv.readUInt16LE(0)
            l = 2
        } 
        else if (tagType == TlvCodec.TLV_TAG_CONTROL_COMMON_PROFILE_4Bytes ||
                 tagType == TlvCodec.TLV_TAG_CONTROL_IMPLICIT_PROFILE_4Bytes)
        {
            profile = 0
            tag = tlv.readUInt32LE(0)
            l = 4
        } 
        else if (tagType == TlvCodec.TLV_TAG_CONTROL_FULLY_QUALIFIED_6Bytes)
        {
            profile = tlv.readUInt32LE(0)
            tag = tlv.readUInt16LE(4)
            l = 6
        }
        else if (tagType == TlvCodec.TLV_TAG_CONTROL_FULLY_QUALIFIED_8Bytes)
        {
            profile = tlv.readUInt32LE(0)
            tag = tlv.readUInt32LE(4)
            l = 8
        }
        else
        {
            tag = 0
        }
    
        if (tagType == TlvCodec.TLV_TAG_CONTROL_IMPLICIT_PROFILE_2Bytes ||
            tagType == TlvCodec.TLV_TAG_CONTROL_IMPLICIT_PROFILE_4Bytes)
        {
            profile = -1
        }

        var result:TlvType.DecodedTagLength = {"tag": tag, "tagLength": l}

        if (profile != undefined) {
            result['profile'] = profile
        }

        return result
    }

} // class TlvCodec

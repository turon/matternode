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
import { TlvCodec } from './TlvCodec'

export class TlvWriter {
    buf : Buffer

    constructor(buf=undefined) {
        this.buf = (buf != undefined) ? buf : Buffer.alloc(0)
    }
    
    get Buffer() {
        return this.buf
    }

    /**
     * Write a value as a TLV unsigned integer with the specified TLV tag.
     * 
     * @param {number?} tag 
     * @param {number} val An unsigned integer number to encode as TLV value
     */
     putUnsignedInt(val:number, tag?:number, profile?:number) {
        var encoded = TlvCodec.encodeUnsignedInt(val)
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_UNSIGNED_INTEGER,
            encoded.length, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag, encoded]);
    }

    /**
     * Write a value as a TLV signed integer with the specified TLV tag.
     * 
     * @param {*} tag 
     * @param {number} val A signed integer number to encode as TLV value
     */
     putSignedInt(val:number, tag?:number, profile?:number) {
        var encoded = TlvCodec.encodeSignedInt(val)
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_SIGNED_INTEGER,
            encoded.length, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag, encoded]);
    }

    /**
     * Write a value as a TLV float with the specified TLV tag.
     * 
     * @param {*} tag 
     * @param {number} val A floating point number to encode as TLV value
     */
    putFloat(val:number, tag?:number, profile?:number) {
        var encoded = TlvCodec.encodeFloat(val)
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_FLOAT,
            0, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag, encoded]);
        return Buffer.concat([controlAndTag, encoded])
    }

    /**
     * Write a value as a TLV double with the specified TLV tag.
     * 
     * @param {*} tag 
     * @param {number} val A floating point number to encode as TLV value
     */
    putDouble(val:number, tag?:number, profile?:number) {
        var encoded = TlvCodec.encodeDouble(val)
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_DOUBLE,
            0, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag, encoded]);
    }
    
    /**
     * Write a value as a TLV boolean with the specified TLV tag.
     * 
     * @param {*} tag 
     * @param {boolean} val A boolean to encode as TLV value
     */
    putBoolean(val:boolean, tag?:number, profile?:number) {
        var type = (val) ? TlvCodec.TLV_TYPE_BOOLEAN_TRUE : TlvCodec.TLV_TYPE_BOOLEAN_FALSE
        var controlAndTag = TlvCodec.encodeControlByte(type, 0, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag]);
    }

    /**
     * Write a TLV null with the specified TLV tag.
     * 
     * @param {*} tag 
     */
    putNull(tag?:number, profile?:number) {
        var type = TlvCodec.TLV_TYPE_NULL
        var controlAndTag = TlvCodec.encodeControlByte(type, 0, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag]);
    }

    /**
     * Write a value as a TLV byte string with the specified TLV tag.
     * 
     * @param {*} tag 
     * @param {*} val A Buffer to encode as TLV value
     */
    putBytes(val:Buffer, tag?:number, profile?:number) {
        var valLen = TlvCodec.encodeUnsignedInt(val.length)
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_BYTE_STRING,
            valLen.length, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag, valLen, val]);
    }

    /**
     * Write a value as a TLV utf-8 string with the specified TLV tag.
     * 
     * @param {*} tag 
     * @param {*} val A string to encode as TLV value
     */
    putString(val:string, tag?:number, profile?:number) {
        var encoded = Buffer.from(val, 'utf-8');
        var valLen = TlvCodec.encodeUnsignedInt(val.length)
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_UTF8_STRING,
            valLen.length, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag, valLen, encoded]);
    }

    putStructStart(tag?:number, profile?:number) {
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_STRUCTURE, 0, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag]);
        return controlAndTag
    }

    putArrayStart(tag?:number, profile?:number) {
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_ARRAY, 0, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag]);
        return controlAndTag
    }

    putListStart(tag?:number, profile?:number) {
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_LIST, 0, tag, profile)
        this.buf = Buffer.concat([this.buf, controlAndTag]);
        return controlAndTag
    }

    putContainerEnd() {
        var controlAndTag = TlvCodec.encodeControlByte(
            TlvCodec.TLV_TYPE_END)
        this.buf = Buffer.concat([this.buf, controlAndTag]);
    }

    /**
     * Write a generic value as the appropriate TLV encoding with the specified TLV tag.
     * 
     * @param {*} tag 
     * @param {*} val A value of any type (int, float, string, bool, null)
     */
    put(val:any, tag?:number, profile?:number) {
        if (val == undefined) {
            this.putNull(tag, profile)
        } else if (typeof(val) == "string") {
            this.putString(val, tag, profile)
        } else if (Buffer.isBuffer(val)) {
            this.putBytes(val, tag, profile)
        } else if (Number.isInteger(val) || (typeof(val) == "bigint")) {
            if (val < 0) {
                this.putSignedInt(val, tag, profile)
            } else {
                this.putUnsignedInt(val, tag, profile)
            }
        } else if (typeof(val) == "number") {
            this.putDouble(val, tag, profile)
        } else if (typeof(val) == "boolean") {
            this.putBoolean(val, tag, profile)
        } else if (typeof(val) == "object") {
            val.tag = tag
            val.profile = profile
            this.encode(val)
        }
    }

    /**
     * Encodes the given json into binary tlv format.
     * 
     * Json encoded as follows:
     * {
     *  "profile": number or undefined=none
     *  "tag": number or undefined=anonymous, 0=common, -1=implicit
     *  "type": string from TlvCodec.ElementTypes or undefined for auto-detect
     *  "value": raw value or [] for containers.  undefined for null
     * }
     * 
     * See theTestTlvJsonVector in TestTlvJson.js for examples.
     * 
     * @param {*} json JSON to encode
     */
    encode(json:TlvType.DeterministicJson) {
        var type = json['type']

        // Recursively walk through raw arrays
        if (Array.isArray(json))
        {
            json.forEach(entry => {
                this.encode(entry)
            })
        }
        // Handle container objects
        else if (type == 'struct')
        {
            this.putStructStart(json['tag'], json['profile'])
            this.encode(json['value'])
            this.putContainerEnd()
        }
        else if (type == 'array')
        {
            this.putArrayStart(json['tag'], json['profile'])
            this.encode(json['value'])
            this.putContainerEnd()
        }
        else if (type == 'list')
        {
            this.putListStart(json['tag'], json['profile'])
            this.encode(json['value'])
            this.putContainerEnd()
        }
        // Accept overrides for signed and float (otherwise default to unsigned and double).
        else if (type == 'int8' || type == 'int16' || type == 'int32' || type == 'int64')
        {
            this.putSignedInt(json['value'], json['tag'], json['profile'])
        }
        else if (type == 'uint8' || type == 'uint16' || type == 'uint32' || type == 'uint64')
        {
            this.putUnsignedInt(json['value'], json['tag'], json['profile'])
        }
        else if (type == 'float')
        {
            this.putFloat(json['value'], json['tag'], json['profile'])
        }
        else if ((type == 'boolean') || (type == 'bool'))
        {
            this.putBoolean(json['value'], json['tag'], json['profile'])
        }
        // Handle generic objects
        else if (type == "Buffer")
        {
            var value = json['value']
            if (typeof(value) == 'string') {
                value = Buffer.from(value, "hex")
            } else {
                value = Buffer.from(value)
            }
            this.put(value, json['tag'], json['profile'])
        }
        // Handle generic objects
        else if (typeof(json) == "object")
        {
            this.put(json['value'], json['tag'], json['profile'])
        }
        // Handle raw values
        else
        {
            this.put(json)
        }

        return this
    }
}

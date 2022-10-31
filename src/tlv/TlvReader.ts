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

export class TlvReader {
    _json: Array<TlvType.DeterministicJson>
    _container?: Array<TlvType.DeterministicJson>

    public constructor() {
        this._json = []
        this._container = this._json
    }

    get Json() {
        return this._json
    }

    /**
     * Find the tlv sub-element with the given tag.
     *
     * @param {Array} tlv Array portion of deterministic json of type struct, list, or array.
     * @param {Number} tag Tag value to find.
     */
    static findTag(tlvJson:Array<TlvType.DeterministicJson>, tag:number) {
        const entry = tlvJson.find(element => element.tag === tag )
        return (entry != undefined) ? entry.value : undefined
    }

    decode(tlv:Buffer) {
        var containerDepth = 1
        var top = this._container
        var containerStack = [ top ]

        while (tlv.length > 0 && containerDepth > 0)
        {
            var control = TlvCodec.decodeControlByte(tlv)
            var type = control['typeNum']
            //var chunk = tlv

            tlv = tlv.subarray(1)
            var tag = TlvCodec.decodeTagAndLength(tlv, control['tagType'])

            tlv = tlv.subarray(tag['tagLength'])
            var valueAndLength:TlvType.ValueLength = TlvCodec.decodeValueAndLength(tlv, type)

            // Merge all parsed objects into one entry.valueAndLength };
            //var decoding = { ...control, ...tag, ...valueAndLength }
            var decoding : TlvType.DeterministicJson = {
                'profile': tag['profile'],
                'tag': tag['tag'],
                'type': control['type'],
                'value': valueAndLength['value']
            }

            tlv = tlv.subarray(valueAndLength['length'])

            /*
            chunk = chunk.subarray(0,1+decoding['tagLength']+decoding['length'])
            console.log("__ENTRY__\n")
            console.log("tlv chunk = "+chunk.toString("hex"))
            console.log(decoding)
            */

            if (type == TlvCodec.TLV_TYPE_END)
            {
                containerDepth--
                this._container = containerStack.pop()
            }
            else
            {
                if (decoding! && this._container!) this._container.push(decoding)
            }

            if (type == TlvCodec.TLV_TYPE_STRUCTURE ||
                type == TlvCodec.TLV_TYPE_ARRAY ||
                type == TlvCodec.TLV_TYPE_LIST)
            {
                containerDepth++
                containerStack.push(this._container)
                this._container = decoding['value']
            }
        }

        return this
    }
}

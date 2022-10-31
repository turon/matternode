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

import { TlvType } from "./TlvType"

/**
 * Utility class for parsing TLV objects
 */
export class TlvParser {
    /**
     * Safely stringify a deterministic TLV JSON object, accounting for bigint.
     * 
     * @param tlvJson 
     * @returns {string} JSON representation of the TLV object
     */
    static JsonStringify(tlvJson:Array<TlvType.DeterministicJson>) {
        const replacer = (key:any, value:any) => {
            typeof value === 'bigint'
                ? value.toString() // convert any bigint to string
                : value            // return everything else unchanged
        }
        return JSON.stringify(tlvJson, replacer)
    }

    static findTag(tlvJson:Array<TlvType.DeterministicJson>, tag:number) {
        const entry = tlvJson.find(element => element.tag === tag )
        return (entry != undefined) ? entry.value : undefined
    }

    static setNameForTag(tlvJson:Array<TlvType.DeterministicJson>, tag:number, tagName:string) {
        const entry = tlvJson.find(element => element.tag === tag )
        if (entry != undefined) {
            entry.tagName = tagName
        }
    }

    /**
     * Find and return the entry with the given tag name.
     */
    static get(tlvJson:Array<TlvType.DeterministicJson>, tagName:string) {
        const entry = tlvJson.find(element => element.tagName === tagName )
        return (entry != undefined) ? entry.value : undefined
    }

    static mapFields(tlvJson:Array<TlvType.DeterministicJson>, tagNameMap:Map<number, string>) {
        tlvJson.forEach(element => {
            if (element.tag! && tagNameMap.has(element.tag)) {
                element.tagName = tagNameMap.get(element.tag)
            }
        } )
    }

    /*
    static getFromTagPath(tlvJson:Array<TlvType.DeterministicJson>, tagPath:Array<number>) {
        var obj = tlvJson
        for (var i = 0; i < tagPath.length; i++) {
            obj = obj[tagPath[i]]
        }
        return obj
    }
    */
}
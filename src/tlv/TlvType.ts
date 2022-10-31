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

export namespace TlvType
{
    /**
     * DeterministicJson is a JSON object that is used to represent 
     * the parsed TLV Buffer in a form that can be deterministically 
     * encoded back to the original binary TLV Buffer.
     */
     export interface DeterministicJson {
        tag?: number,       ///< numeric tag
        type?: string,      ///< type of element (struct, list, array, Buffer, uintX, ...)
        profile?: number,   ///< profile id to scope tag of element
        value?: any,        ///< value of element
        tagName?: string,   ///< human-readable name of the tag
    }
    
    export interface ValueLength {
        value?: any
        length: number
    }

    export interface DecodedTagLength {
        tag?: number,
        tagLength: number,
        profile?: number
    }
    
    export interface DecodedControlByte
    {
        typeNum: number,
        tagType: number,
        type: string,
        tagTypeName: string
    }
}

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

const UINT8_MAX = 255
const UINT16_MAX = 65535
const UINT32_MAX = 4294967295

class Random {

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomUint8() {
        return Random.getRandomInt(0,UINT8_MAX)
    }

    static getRandomUint16() {
        return Random.getRandomInt(0,UINT16_MAX)
    }

    static getRandomUint32() {
        return Random.getRandomInt(0,UINT32_MAX)
    }
}

module.exports = Random
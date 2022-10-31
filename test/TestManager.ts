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

export class TestManager {
    static _nextNodeNum = 100

    /**
     * Allocates a unique node number for the next node to be created.
     * 
     * Use of this function is prevents collissions between node numbers
     * across the test suite in CI environments where the number and mix
     * of parallel prcesses is unpredictable.
     * 
     * @returns {number} Unique nodenum an ExpectNode can use
     */
    static getNodeNum() {
        return TestManager._nextNodeNum++
    }
}

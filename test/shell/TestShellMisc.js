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

const assert = require('assert')
const path = require('path')

const SRC_ROOT = '../../src/'
const { TestManager } = require('../TestManager')
const ExpectNode = require(SRC_ROOT+'expect/ExpectNode')
const ExpectProcess = require(SRC_ROOT+'expect/ExpectProcess')

describe(path.basename(__filename), async function () {

    this.timeout(ExpectProcess.DEFAULT_TIMEOUT)

    it("Test Shell: bash passthrough", async function () {
        try {
            var node0 = new ExpectNode(TestManager.getNodeNum())    // TODO: activate pass-through with constructor args

            node0.proc.send("")
            await node0.proc.expect(">")

            node0.proc.send("echo hello_hey")
            await node0.proc.expect("hello_hey")

            node0.exit()
        } catch(err) {
            console.error(err)
        }
    })

})
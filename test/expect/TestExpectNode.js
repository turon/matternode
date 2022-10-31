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

const SRC_ROOT = '../../src/'
const { TestManager } = require('../TestManager')
const ExpectNode = require(SRC_ROOT+'expect/ExpectNode')
const ExpectProcess = require(SRC_ROOT+'expect/ExpectProcess')

describe('Test ExpectNode', async function () {

    this.timeout(ExpectProcess.DEFAULT_TIMEOUT)

    it("Test Shell: help", async function () {
        var node = new ExpectNode(TestManager.getNodeNum())
        //node.proc.Verbose = ExpectProcess.Verbosity.DEBUG
        await node.init()
        node.proc.send("help")
        await node.proc.expect("Done")
        node.proc.send("exit")
        await node.proc.expect("Goodbye")
        node.exit()
    })

    it("Test Shell: exit via process message", async function () {
        try {
            var node = new ExpectNode(TestManager.getNodeNum())
            await node.init()
            node.exit()    
        } catch(err) {
            console.trace(err)
        }
    })

})
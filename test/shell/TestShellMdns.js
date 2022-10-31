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

const path = require('path')

const SRC_ROOT = '../../src/'
const { TestManager } = require('../TestManager')
const ExpectNode = require(SRC_ROOT+'expect/ExpectNode')
const ExpectProcess = require(SRC_ROOT+'expect/ExpectProcess')

describe(path.basename(__filename), async function () {

    this.timeout(ExpectProcess.DEFAULT_TIMEOUT)

    it("Test Shell: mdns", async function () {
        try {
            var node0 = new ExpectNode(TestManager.getNodeNum())
            var node1 = new ExpectNode(TestManager.getNodeNum())

            await node0.init()
            await node1.init()

            node0.proc.send("mdns")
            // observe loopback
            await node0.proc.expect('mdns response:.*_matter._tcp.local.*:'+node0.Port)
            // observe remote node1
            await node0.proc.expect('mdns response:.*_matter._tcp.local.*:'+node1.Port)

            node0.exit()
            node1.exit()
        } catch(err) {
            console.error(err)
        }
    })


    it("Test Shell: mdns help", async function () {
        var node = new ExpectNode(TestManager.getNodeNum())
        await node.init()

        node.proc.send("mdns --help")
        await node.proc.expect("Options:")
        await node.proc.expect("Done")

        node.exit()
    })


})
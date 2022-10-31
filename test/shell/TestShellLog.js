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

    const NODE_NUM = TestManager.getNodeNum()

    var node

    before(async function () {
        this.timeout(ExpectProcess.DEFAULT_TIMEOUT)

        node = new ExpectNode(NODE_NUM)
        await node.init()
    })

    it("Test Shell: loglevel", async function () {
        try {
            node.proc.send("loglevel fatal")
            await node.proc.expect("fatal")
            await node.proc.expect("Done")
            node.proc.send("log hey")
            await node.proc.expect(/FATAL.*hey/)
            node.proc.send("loglevel")
            await node.proc.expect("fatal")
            await node.proc.expect("Done")

            node.proc.send("loglevel error")
            await node.proc.expect("error")
            await node.proc.expect("Done")
            node.proc.send("log hey")
            await node.proc.expect(/ERROR.*hey/)
            node.proc.send("loglevel")
            await node.proc.expect("error")
            await node.proc.expect("Done")

            node.proc.send("loglevel warn")
            await node.proc.expect("warn")
            await node.proc.expect("Done")
            node.proc.send("log hey")
            await node.proc.expect(/WARN.*hey/)
            node.proc.send("loglevel")
            await node.proc.expect("warn")
            await node.proc.expect("Done")

            node.proc.send("loglevel info")
            await node.proc.expect("info")
            await node.proc.expect("Done")
            node.proc.send("log hey")
            await node.proc.expect(/INFO.*hey/)
            node.proc.send("loglevel")
            await node.proc.expect("info")
            await node.proc.expect("Done")

            node.proc.send("loglevel debug")
            await node.proc.expect("debug")
            await node.proc.expect("Done")
            node.proc.send("log hey")
            await node.proc.expect(/DEBUG.*hey/)
            node.proc.send("loglevel")
            await node.proc.expect("debug")
            await node.proc.expect("Done")

            node.proc.send("loglevel trace")
            await node.proc.expect("trace")
            await node.proc.expect("Done")
            node.proc.send("log hey")
            await node.proc.expect(/TRACE.*hey/)
            node.proc.send("loglevel")
            await node.proc.expect("trace")
            await node.proc.expect("Done")

        } catch(err) {
            console.trace(err)
        }
    })

    after(async function () {
        node.exit()
    })
})

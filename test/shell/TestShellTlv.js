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
    var node

    before(async function () {
        this.timeout(ExpectProcess.DEFAULT_TIMEOUT)

        node = new ExpectNode(TestManager.getNodeNum())
        node.proc.send("")
        await node.proc.expect(">")
        //node.proc.Verbose = ExpectProcess.Verbosity.DEBUG
    })

    it("Test Shell command: tlv --decode UINT", async function () {
        try {
            node.proc.send("tlv -d 0400")
            await node.proc.expect(/value.*0/m)

            node.proc.send("tlv -d 0401")
            await node.proc.expect(/value.*1/m)

            node.proc.send("tlv -d 052301")
            await node.proc.expect(/value.*291/m)

            node.proc.send("tlv -d 0667452301")
            await node.proc.expect(/value.*19088743/m)

        } catch(err) {
            console.error(err)
        }
    })

    it("Test Shell command: tlv --encode", async function () {
        try {
            node.proc.send('tlv -e {"type":"uint32","value":19088743}')
            await node.proc.expect("0667452301")
        } catch(err) {
            console.error(err)
        }
    })

    it("Test Shell: tlv help", async function () {
        node.proc.send("tlv --help")
        await node.proc.expect("Options:")
        await node.proc.expect("Done")
    })

    after(async function () {
        node.exit()
    })

})
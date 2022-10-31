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

    const NODE_NUM = TestManager.getNodeNum()
    const NODE_PORT = NODE_NUM + 5540
    var node

    before(async function () {
        this.timeout(ExpectProcess.DEFAULT_TIMEOUT)

        node = new ExpectNode(NODE_NUM)
        await node.init()
        //node.proc.Verbose = ExpectProcess.Verbosity.DEBUG
    })

    it("Test Shell: config", async function () {
        try {
            node.proc.send("config")
            await node.proc.expect("store: nodenum = "+NODE_NUM)
            await node.proc.expect("Done")
        } catch(err) {
            console.trace(err)
        }
    })

    it("Test Shell: fabricid", async function () {
        try {
            node.proc.send("fabricid 1")
            await node.proc.expect("0000000000000001")
            await node.proc.expect("Done")
            node.proc.send("fabricid")
            await node.proc.expect("0000000000000001")
            await node.proc.expect("Done")
            node.proc.send("fabricid ABCD")
            await node.proc.expect("000000000000ABCD")
            await node.proc.expect("Done")
            node.proc.send("fabricid")
            await node.proc.expect("000000000000ABCD")
            await node.proc.expect("Done")
        } catch(err) {
            console.trace(err)
        }
    })

    it("Test Shell: nodeid", async function () {
        try {
            node.proc.send("nodeid 1")
            await node.proc.expect("0000000000000001")
            await node.proc.expect("Done")
            node.proc.send("nodeid")
            await node.proc.expect("0000000000000001")
            await node.proc.expect("Done")
            node.proc.send("nodeid 3bb1ea4bae915164")
            await node.proc.expect("3bb1ea4bae915164")
            await node.proc.expect("Done")
            node.proc.send("nodeid")
            await node.proc.expect("3bb1ea4bae915164")
            await node.proc.expect("Done")
        } catch(err) {
            console.trace(err)
        }
    })

    it("Test Shell: nodenum", async function () {
        try {
            node.proc.send("nodenum")
            await node.proc.expect(NODE_NUM)
            await node.proc.expect("Done")
        } catch(err) {
            console.trace(err)
        }
    })

    it("Test Shell: port", async function () {
        try {
            node.proc.send("port")
            await node.proc.expect(NODE_PORT)
            await node.proc.expect("Done")
        } catch(err) {
            console.trace(err)
        }
    })

    it("Test Shell: key", async function () {
        try {
            node.proc.send("key 5eded244e5532b3cdc23409dbad052d2")
            await node.proc.expect("5eded244e5532b3cdc23409dbad052d2")
            await node.proc.expect("Done")
            node.proc.send("key")
            await node.proc.expect("5eded244e5532b3cdc23409dbad052d2")
            await node.proc.expect("Done")
        } catch(err) {
            console.trace(err)
        }
    })

    after(async function () {
        node.exit()
    })
})
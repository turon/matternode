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

    var node0
    var node1

    before(async function () {
        try {
            this.timeout(ExpectProcess.DEFAULT_TIMEOUT)

            node0 = new ExpectNode(TestManager.getNodeNum())
            node1 = new ExpectNode(TestManager.getNodeNum())

            await node0.init()
            await node1.init()
    
        } catch(err) {
            console.error(err)
        }
    })

    it("Test Shell: msg", async function () {
        try {

            node0.proc.send("msg -p "+node1.Port)
            await node0.proc.expect("client sent to \\\[::1\\\]:"+node1.Port)
            await node1.proc.expect("Plain:  00b80b00393000000564ee0e207d")

            node1.proc.send("msg -p "+node0.Port)
            await node1.proc.expect("client sent to \\\[::1\\\]:"+node0.Port)
            await node0.proc.expect("Plain:  00b80b00393000000564ee0e207d")

        } catch(err) {
            console.error(err)
        }
    })

    it("Test Shell: session", async function () {
        try {
            node0.proc.send("session")
            await node0.proc.expect("Session {")
            await node0.proc.expect("_secure: true")

            node0.proc.send("session --help")
            await node0.proc.expect("Options:")

        } catch(err) {
            console.error(err)
        }
    })

    it("Test Shell: exchange", async function () {
        try {
            node0.proc.send("exchange")
            await node0.proc.expect("Exchange {")
            await node0.proc.expect("_secure: true")

            node0.proc.send("exchange --help")
            await node0.proc.expect("Options:")

        } catch(err) {
            console.error(err)
        }
    })

    it("Test Shell: msg help", async function () {
        node0.proc.send("msg --help")
        await node0.proc.expect("Options:")
        await node0.proc.expect("Done")
    })

    after(async function () {
        node0.exit()
        node1.exit()    
    })

})
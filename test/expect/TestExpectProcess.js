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

const SRC_ROOT = '../../src/'
const ExpectProcess = require(SRC_ROOT+'expect/ExpectProcess')

describe('Test ExpectProcess', () => {

    it("Test echo", async function () {
        var proc = new ExpectProcess()
        proc.spawn('echo', ['hello'])
        await proc.expect('hello')
    })

    it("Test count", async function () {
        this.timeout(10000) // 10 second timeout for setup

        var proc = new ExpectProcess()
        proc.spawn('bash',['-c','count=1; while true; do echo $count; ((count++)); sleep 0.1; done'])
        await proc.expect('1')
        await proc.expect('2')
        await proc.expect('3')
        await proc.expect('5')
        proc.exit()
    })

    it("Test cat - basic", async function () {
        var proc = new ExpectProcess()
        proc.spawn('cat', ['--'])
        proc.send('hi')
        await proc.expectNext('hi')
        proc.exit()
    })

    it("Test cat - advanced", async function () {
        var proc = new ExpectProcess()
        proc.spawn('cat', ['--'])
        proc.send('hi')
        await proc.expect('hi')
        proc.send('noise')
        proc.send('noise2')
        proc.send('hi123')
        await proc.expect('hi123')
        proc.send('hi it is 123')
        await proc.expect(/hi.*123/)
        proc.send('noise')
        proc.send('noise2')
        proc.send('hi123')
        await proc.expect(/noise2/)
/*
        // Negative test
        var exception = false
        proc.send('hi')
        try {
            // Suppress assert exception output
            proc.Verbose = ExpectProcess.Verbosity.NONE
            await proc.expect('bye')
        } catch(err) {
            exception = true
        } finally {
            assert.ok(exception)
        }
        proc.Verbose = ExpectProcess.Verbosity.CRITICAL
*/
        proc.exit()
    })

    /*
    it("Test grep", async function () {
        var proc = new ExpectProcess()
        proc.Verbose = ExpectProcess.Verbosity.DEBUG
        proc.spawn('grep', ['-e','hi.*','--'])
        proc.send('hi')
        await proc.expect('hi')
        proc.send('hi123')
        await proc.expect('hi123')
        proc.send('hi it is 123')
        await proc.expect('hi.*123')
        proc.exit()
    })
    */

})
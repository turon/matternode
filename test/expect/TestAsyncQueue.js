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
const assert = require('assert')

const SRC_ROOT = '../../src/'
const AsyncQueue = require(SRC_ROOT+'async/AsyncQueue')
const AsyncTimeout = require(SRC_ROOT+'async/AsyncTimeout')

const TEST_OUT = 'foo'

async function asyncFoo() {
    return TEST_OUT
}

describe('Test mocha async', () => {

    it('mocha async', async function() {
        const v = await asyncFoo()
        assert.equal(v, TEST_OUT)
    })

    it('mocha then', async function() {
        asyncFoo().then(v => assert.equal(v, TEST_OUT))
    })
})

describe(path.basename(__filename), function () {
  it('enqueue, dequeue', async function () {
    const queue = new AsyncQueue();

    setTimeout(() => {
      queue.enqueue(1)
    }, 100)
    
    setTimeout(() => {
      queue.enqueue(2)
    }, 200)

    assert.equal(1, await queue.dequeue());
    assert.equal(2, await queue.dequeue());
  })

  it('isEmpty', async function () {
      try {
        const queue = new AsyncQueue();
        assert.equal(queue.isEmpty(), true)
        queue.enqueue(1)
        assert.equal(queue.isEmpty(), false)
        assert.equal(1, await queue.dequeue())
        assert.equal(queue.isEmpty(), true)    
        queue.enqueue(2)
        assert.equal(queue.isEmpty(), false)
        queue.enqueue(3)
        assert.equal(queue.isEmpty(), false)
        assert.equal(2, await queue.dequeue())
        assert.equal(queue.isEmpty(), false)    
        assert.equal(3, await queue.dequeue())
        assert.equal(queue.isEmpty(), true)    
      } catch (err) {
        console.error(err)
        throw(err)
      }
  })

  it('dequeue blocking', async function () {
        const queue = new AsyncQueue();

        await AsyncTimeout(async function () {
            await queue.dequeue()
            assert.fail()
        }, 100)
  })

})
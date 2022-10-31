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

/**
 * AsyncQueue
 */
class AsyncQueue {
    constructor() {
      this.resolvers = []
      this.promises = []
    }
  
    _createEntry() {
      this.promises.push(
        new Promise(resolve => {
          this.resolvers.push(resolve)
        })
      );
    }
  
    isEmpty() {
      return (!this.promises.length)
    }

    enqueue(v) {
      if (!this.resolvers.length) this._createEntry()
      this.resolvers.shift()(Promise.resolve(v))
    }
  
    dequeue() {
      if (!this.promises.length) this._createEntry()
      return this.promises.shift()
    }
}
  
module.exports = AsyncQueue
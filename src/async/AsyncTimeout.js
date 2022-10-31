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
 * AsyncTimeout - returns a Promise that will execute the given function 
 * within the given timeout (in milliseconds).
 * 
 * @param {*} func 
 * @param {number} timeout 
 * @returns {Promise}
 */
async function AsyncTimeout(func, timeout) 
{
    var timeoutId
    const timeoutPromise = new Promise((_resolve, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('AsyncTimeout expired'))
        }, timeout)
    })

    return Promise.race([func, timeoutPromise])
        .then(result => {
            clearTimeout(timeoutId)
            return result
        })
}
  
module.exports = AsyncTimeout
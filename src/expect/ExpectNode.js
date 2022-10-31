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

const ExpectProcess = require('./ExpectProcess')

/**
 * ExpectNode
 */
class ExpectNode 
{
    static PORT_OFFSET = 5540

    constructor(nodeNum) {
        this._nodeNum = nodeNum
        this._nodePort = nodeNum + ExpectNode.PORT_OFFSET
        this.proc = new ExpectProcess()
        this.proc.fork("dist/app.js", [nodeNum])
    }

    get Port() {
        return this._nodePort
    }

    async init() {
        await this.proc.expect("Server started!")
        this.proc.send("")
        await this.proc.expect(">")
    }

    exit() {
        this.proc.exit()
    }

    // TODO: shortcut methods cause tests to timeout and fail after passing...
    /*
    send(line) {
        this.proc.send(line)
    }

    async expect(condition) {
        this.proc.expect(condition)
    }
    */
}

module.exports = ExpectNode
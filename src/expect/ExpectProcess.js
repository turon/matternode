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

const os = require('os')
const util = require('util')
const assert = require('assert')
const { SIGHUP } = require('constants')
const { spawn, fork } = require('child_process')
const logger = require('../util/Logger')
const AsyncQueue = require('../async/AsyncQueue')
const AsyncTimeout = require('../async/AsyncTimeout')

/**
 * ExpectProcess
 */
class ExpectProcess {

    static COLOR_YELLOW = "\x1b[33m"

    static DEFAULT_TIMEOUT = 10000

    constructor(c) {
        this.stdoutQ = new AsyncQueue()
        this.stderrQ = new AsyncQueue()
        this.timeout = ExpectProcess.DEFAULT_TIMEOUT
    }

    set Timeout(ms) { this.timeout = ms }
    get Timeout() { return this.timeout }

    initChild(child) {
        var self = this
        this.process = child

        child.on('error', (err) => {
            console.error('ERROR (${err}): Failed to start subprocess.')
            assert.ok(false, 'ERROR (${err}): Failed to start subprocess.')
        })

        child.on('disconnect', () => {
            // Use ipc disconnect to detect parent exit and auto-kill child.
            logger.debug('Child disconnected; exiting')
            self.kill()
            //throw new Error("Child exit")
        })

        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function(data) {
            // Push lines of output into queue.
            var lines = data.split(os.EOL)
            lines.forEach(line => self.stdoutQ.enqueue(line))
            logger.debug('stdout: '+data)
        })

        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function(data) {
            // Push lines of output into queue.
            self.stderrQ.enqueue(Promise.resolve(data))
            console.log('stderr: '+data)
        })

        child.on('exit', function(code, signal) {
            logger.debug('ExpectProcess exit: ' + code)
            if (code == null) {
                return
            }
            assert.equal(code, 0)
        })

        child.on('close', function(code) {
            if (code != 0 && code != null) {
                logger.trace('ExpectProcess close: ' + code);
            }
        })

        child.on('message', function(message, sendHandle) {
            logger.debug('Child message: ' + message) 
            switch (message) {
                case 'exit': {
                    //process.kill(-child.pid)
                    child.kill(SIGHUP)
                    //process.exit(0)
                }
            }
        })
    }

    /**
     * Execute the given shell command as a child subprocess.
     * 
     * @param {*} command Command to spawn
     * @param {*} args Array of arguments to pass to child process
     */
    spawn (command, args) {
        var self = this
        this.command = command
        var child = spawn(command, args, { silent: true, stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] })
        this.initChild(child)
    }

    /**
     * Execute the given node.js script as a child subprocess.
     * 
     * @param {*} command Node.js script to fork
     * @param {*} args Array of arguments to pass to child process
     */
    fork (command, args) {
        var self = this
        this.command = command
        var child = fork(command, args, { silent: true, ipc: true })
        this.initChild(child)
    }

    sendRaw (line) {
        //var self = this
        //this.process.stdin.cork();
        this.process.stdin.write(line)
        //process.nextTick(() => self.process.stdin.uncork());
    }

    send (line) {
        logger.debug("send: "+line)
        this.sendRaw(line + '\n')
    }

    sendEof() {
        this.process.stdin.end()
        //this.process.stdin.destroy()
    }

    message (msg) {
        console.log('Message to child: '+msg)
        this.process.send(msg)
    }

    exit() {
        //this.proc.sendEof()
        this.kill()
        //this.message('exit')
            // handler in app.js and subprocess...
    }

    kill() {
        this.process.kill(SIGHUP)
    }

    static escapeRegExp(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    }

    /**
     * Compare the given condition against the given line and throw an exception if no match.
     *
     * @param {*} condition 
     * @param {*} line 
     */
    expectLine(condition, line) {
        try {
            if (!util.types.isRegExp(condition)) {
                //condition = ExpectProcess.escapeRegExp(condition)
                condition = new RegExp(condition)
            }
            assert.match(line, condition)
        } catch (err) {
            logger.error(err)

            //this.process.exit(err)
            //this.kill()
            throw(err)
        }
    }

    /**
     * Compare the given condition against the given line and throw an exception if no match.
     *
     * @param {*} condition 
     * @returns this
     */
     async expectNext(condition) {
        var line = await this.stdoutQ.dequeue()
        this.expectLine(condition, line)
    }

    expectMatch(condition, line) {
        if (!util.types.isRegExp(condition)) {
            //condition = ExpectProcess.escapeRegExp(condition)
            condition = new RegExp(condition)
        }
        return line.match(condition)
    }
    async expectSearch(condition) {
        var match = null
        while (match == null) {
            var line = await this.stdoutQ.dequeue()
            logger.debug("dequeue: "+line)
            match = this.expectMatch(condition, line)
            logger.debug("match: "+match)
        }
        return match
    }

    /**
     * Expect the given condition string converted to a RegEx.
     * @param {string} condition 
     */
    async expectRegEx(condition) {
        var condition = new RegExp(condition)
        this.expect(condition)
    }

    async expect(condition) {
        var self = this
        try {
            await AsyncTimeout(self.expectSearch(condition), this.Timeout)
        } catch (err) {
            console.log('FAIL: Expected not found: '+condition)
            logger.error(err)
            throw(err)
        }
    }
}

module.exports = ExpectProcess
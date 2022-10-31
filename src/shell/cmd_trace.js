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

const yargs = require('yargs')
const tracer = require("../util/Tracer")

/**
 * Output a log message.
 *
 * Usage:
 *      trace <msg>
 *      trace --level <level> <msg>
 */
function doTrace(args)
{
    const argv = yargs(args)
    .option('level', {
        alias: 'l',
        description: 'level to trace at',
        type: 'string',
    })
    .exitProcess(false)
    .help()
    .parse()

    if (argv.help) return 0

    if (args.length > 1) {
        tracer.emit(args[1])
    }

    return 0
}


module.exports = {
    doTrace
}
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

const theNode = require('../Node')
const SessionManager = require('../message/SessionManager')

function doSession(args) {

    const argv = yargs(args)
    .option('peerSessionId', {
        alias: 'p',
        description: 'the peer session id',
        type: 'number',
    })
    .option('localSessionId', {
        alias: 'l',
        description: 'the local session id',
        type: 'number',
    })
    .exitProcess(false)
    .help()
    .parse()

    if (argv.help) return 0

    if (argv.peerSessionId != undefined)
    {
        var session = theNode.SessionManager.getSecureSession(argv.peerSessionId)
        if (session) console.log(session)
    }
    else if (argv.localSessionId != undefined)
    {
        var session = theNode.SessionManager.getSecureSession(argv.localSessionId)
        if (session) console.log(session)
    }
    else
    {
        var sessionSecureTable = theNode.SessionManager.SecureSessions
        var sessionUnsecuredTable = theNode.SessionManager.UnsecuredSessions
        console.log("__SECURE SESSIONS__")
        console.log(sessionSecureTable)
        console.log("__UNSECURED SESSIONS__")
        console.log(sessionUnsecuredTable)
    }
    
    return 0
}


module.exports = {
    doSession
}
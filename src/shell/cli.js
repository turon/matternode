#!/usr/bin/env node

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

const Shell = require('./Shell')
const cmd_config = require('./cmd_config')
const cmd_crypto = require('./cmd_crypto')
const cmd_log = require('./cmd_log')
const cmd_mdns = require('./cmd_mdns')
const cmd_msg = require('./cmd_msg')
const cmd_pair = require('./cmd_pair')
const cmd_pase = require('./cmd_pase')
const cmd_tlv = require('./cmd_tlv')
const cmd_trace = require('./cmd_trace')
const cmd_exchange = require('./cmd_exchange')
const cmd_session = require('./cmd_session')
const cmd_x509 = require('./cmd_x509')

const PROMPT = "matternode> "

/**
 * JSON array defining all top-level commands.
 */
var theCommandList = [
    {
        "command": "help",
        "help":    "Display list of all commands",
        "handler": doHelp,
    },
    {
        "command": "config",
        "help":    "Display all config variables",
        "handler": cmd_config.doConfig,
    },
    {
        "command": "crypto",
        "help":    "Run crypto functions",
        "handler": cmd_crypto.doCrypto,
    },
    {
        "command": "dacpriv",
        "help":    "Get and set the Device Attestation private key",
        "handler": cmd_config.doDaPrivateKey,
    },
    {
        "command": "dacpub",
        "help":    "Get the Device Attestation public key",
        "handler": cmd_config.doDaPublicKey,
    },
    {
        "command": "dac",
        "help":    "Get the Device Attestation Certificate",
        "handler": cmd_config.doDaCertificate,
    },
    {
        "command": "exchange",
        "help":    "Manage active exchanges",
        "handler": cmd_exchange.doExchange,
    },
    {
        "command": "exit",
        "help": "Exit the shell",
        "handler": doExit
    },
    {
        "command": "fabricid",
        "help":    "Get and set the FabricId",
        "handler": cmd_config.doFabricId,
    },
    {
        "command": "key",
        "help":    "Get and set the EncryptionKey",
        "handler": cmd_config.doEncryptionKey,
    },
    {
        "command": "log",
        "help":    "Output a log message",
        "handler": cmd_log.doLog,
    },
    {
        "command": "loglevel",
        "help":    "Get and set the LogLevel",
        "handler": cmd_config.doLogLevel,
    },
    {
        "command": "mdns",
        "help":    "Execute the mDNS discovery client",
        "handler": cmd_mdns.doMdns,
    },
    {
        "command": "msg",
        "help":    "Encode a message",
        "handler": cmd_msg.doMsg,
    },
    {
        "command": "nodeid",
        "help":    "Get and set the NodeId",
        "handler": cmd_config.doNodeId,
    },
    {
        "command": "nodenum",
        "help":    "Get and set the Node Number",
        "handler": cmd_config.doNodeNum,
    },
    {
        "command": "pair",
        "help":    "Commission a node",
        "handler": cmd_pair.doPair,
    },
    {
        "command": "pase",
        "help":    "Manage a PASE session",
        "handler": cmd_pase.doPase,
    },
    {
        "command": "port",
        "help":    "Get and set the IPv6 port",
        "handler": cmd_config.doIpPort,
    },
    {
        "command": "session",
        "help":    "Manage active sessions",
        "handler": cmd_session.doSession,
    },
    {
        "command": "tlv",
        "help":    "Encode / decode TLV",
        "handler": cmd_tlv.doTlv,
    },
    {
        "command": "trace",
        "help":    "Output a trace event",
        "handler": cmd_trace.doTrace,
    },
    {
        "command": "tracelevel",
        "help":    "Get and set the TraceLevel",
        "handler": cmd_config.doTraceLevel,
    },
    {
        "command": "x509",
        "help":    "Encode and decode X.509 certificates",
        "handler": cmd_x509.doX509,
    },
]

/**
 * Run the `exit` command and terminate the shell.
 * 
 * @param {*} args array of string arguments
 * @returns 0
 */
function doExit(args) {
    console.log("Goodbye")
    process.exit(0)
    return 0
}

/**
 * Run the `help` command and output list of commands.
 * 
 * @param {*} args array of string arguments
 * @returns 0
 */
function doHelp(args) {
    theCommandList.forEach(entry => {
        console.log(entry['command'] + "\t" + entry['help'])
    })
    return 0
}

var theShell = new Shell(PROMPT, theCommandList)


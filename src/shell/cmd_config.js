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
 * Get / Set the NodeId.
 *
 * @param {Array} args
 * @returns 0
 */
function doConfig(args) {
    theNode.Store.dump()
    return 0
}

function doLogLevel(args) {
    if (args.length > 1) {
        theNode.Store.LogLevel = args[1]
    }
    console.log(theNode.Store.LogLevel)
    return 0
}

function doTraceLevel(args) {
    if (args.length > 1) {
        theNode.Store.TraceLevel = args[1]
    }
    console.log(theNode.Store.TraceLevel)
    return 0
}

function doNodeId(args) {
    if (args.length > 1) {
        theNode.Store.NodeId = args[1]
    }
    console.log(theNode.Store.NodeId)
    return 0
}

/**
 * Get / Set the FabricId.
 *
 * @param {Array} args
 * @returns 0
 */
function doFabricId(args) {
    if (args.length > 1) {
        theNode.Store.FabricId = args[1]
    }
    console.log(theNode.Store.FabricId)
    return 0
}

/**
 * Get / Set the EncryptionKey.
 *
 * @param {Array} args
 * @returns 0
 */
 function doEncryptionKey(args) {
    if (args.length > 1) {
        theNode.Store.EncryptionKey = args[1]
    }
    console.log(theNode.Store.EncryptionKey)
    return 0
}

function doNodeNum(args) {
    if (args.length > 1) {
        theNode.Store.NodeNum = args[1]
    }
    console.log(theNode.Store.NodeNum)
    return 0
}

function doIpPort(args) {
    if (args.length > 1) {
        theNode.Store.IpPort = args[1]
    }
    console.log(theNode.Store.IpPort)
    return 0
}

function doDaPrivateKey(args) {
    if (args.length > 1) {
        theNode.Store.DaPrivateKey = args[1]
    }
    console.log(theNode.Store.DaPrivateKey)
    return 0
}

function doDaPublicKey(args) {
    console.log(theNode.Store.DaPublicKey)
    return 0
}

function doDaCertificate(args) {
    console.log(theNode.Store.DaCertificate)
    return 0
}

module.exports = {
    doConfig,
    doLogLevel,
    doTraceLevel,
    doNodeId,
    doFabricId,
    doEncryptionKey,
    doNodeNum,
    doIpPort,
    doDaPrivateKey,
    doDaPublicKey,
    doDaCertificate,
}
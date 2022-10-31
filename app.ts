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

const theNode = require('./src/Node')
const cli = require('./src/shell/cli')

/**
 * @file Top level application for Matter Node.
 */
async function main() {
    var myArgs = process.argv.slice(2);

    var nodenum = (myArgs.length > 0) ? Number(myArgs[0]) : 0

    console.log("Started Node #" + nodenum)

    await theNode.init(nodenum)

    if (myArgs.length > 0) {
        theNode.Store.NodeNum = nodenum
        console.log("nodenum: " + nodenum)
    }

    theNode.Store.dump()
    theNode.start()
}

process.on("message", function (message) {
    console.log(`Message to app.js: ${message}`)

    switch(message) {
        case "exit": process.exit()
    }
})

main()
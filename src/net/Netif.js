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
const logger = require('../util/Logger')

/**
 * Class to manage a network interface.
 */
class Netif {

    static nodeVersion() {
        const m = process.version.match(/(\d+)\.(\d+)\.(\d+)/)
        const [major, minor, patch] = m.slice(1).map(_ => parseInt(_))
        return major
    }

    /**
     * Query active IP interfaces.
     * 
     * @returns array of interface objects
     */
    static getInterfaces() {
        var netifs = os.networkInterfaces()
        var interfaces = Object.keys(netifs)
        return interfaces
    }

    /**
     * Check if given interface is IPv6 capable.
     * 
     * @param {*} iface 
     * @returns IPv6 address of given interface
     */
    static getIpv6(iface) {
        var netifs = os.networkInterfaces()

        for(var index in netifs[iface]) {
            //logger.trace('Netif.getIpv6: '+iface+' = '+netifs[iface][index])

            var i = netifs[iface][index]
            if(i.family === 'IPv6' || i.family === 6) {
                return netifs[iface][index].address;
            }
        }
    }

}

module.exports = Netif

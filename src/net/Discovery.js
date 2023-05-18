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

const Netif = require('./Netif')

const logger = require('../util/Logger')
const tracer = require('../util/Tracer')

/**
 * Class to manage mDNS discovery operations.
 */
class Discovery {

    static MDNS_TTL_TIMEOUT = 120                               // DNS-SD entry TTL in seconds
    static MDNS_DOMAIN_OPERATIONAL = '_matter._tcp.local'       // Operational Discovery
    static MDNS_DOMAIN_COMMISSIONABLE = '_matterc._udp.local'   // Commissionable Discovery
    static MDNS_DOMAIN_COMMISSIONER = '_matterd._udp.local'     // Commissioner Discovery
    //static MDNS_DOMAIN_OPERATIONAL = '_http._tcp.local'

    constructor() {
        this.mdnsTarget = "null"
        this.update()
    }

    get IpPort() {
        return theNode.Store.IpPort
    }

    set IpPort(v) {
        this._ipPort = v
    }

    update() {
      var interfaces = Netif.getInterfaces()
      logger.debug('Network interfaces:', interfaces)

      this.mdnsInterfaces = []

      interfaces.forEach(iface => {
          var ipAddr = Netif.getIpv6(iface)
          var mdns = this.initListener(`::%${iface}`, ipAddr)
          if (mdns) {
              logger.info('MDNS: initialize interface: ' + ipAddr + '%' + iface)
              this.mdnsInterfaces.push(mdns)
              this.initServer(mdns, ipAddr)
          }
      })
    }

    destroy() {
      this.mdnsInterfaces.forEach(mdns => {
          mdns.destroy()
      })
    }

    initListener(iface, ipAddr) {
        var self = this
        var loopback

        if (process.platform == 'darwin')
        {
          loopback = false
          if (iface.match(/%lo/)) loopback = true
        }
        else
        {
          loopback = true
          if (iface.match(/%lo/)) return
        }

        logger.debug("Adding interface:  " + ipAddr + iface)

        var mdns = require('multicast-dns')({
            loopback: loopback,
            type: 'udp6',
            ip: 'ff02::fb',
            interface: iface
        })
        mdns.iface = iface

        mdns.on('warning', (err) => {
            logger.warn(err.stack)
        })

        mdns.on('response', (response) => self.onResponse(response, mdns))

        return mdns
    }

    onResponse(response, mdns)
    {
        // ================================================
        // DEBUG
        // ================================================
        // logger.debug("RESPONSE:")
        // logger.debug(response)

        var node
        var ip = []
        var port
        var txt
        var service = 'matter'

        response['answers'].forEach(function (entry) {
            if (entry['name'] == Discovery.MDNS_DOMAIN_OPERATIONAL) {
                node = entry['data']
            }
            if (entry['name'] == Discovery.MDNS_DOMAIN_COMMISSIONABLE) {
              service = 'matterc'
              node = entry['data']
            }
            if (entry['type'] == "A") {
              ip.push(entry['data'])
            }
            if (entry['type'] == "AAAA") {
              ip.push(entry['data'])
            }
            if (entry['type'] == "SRV") {
              port = entry['data']['port']
            }
        })

        // Support legacy devices with AAAA record in additionals.
        response['additionals'].forEach(function (entry) {
          if (entry['type'] == "A") {
            ip.push(entry['data'])
          }
          if (entry['type'] == "AAAA") {
            ip.push(entry['data'])
          }
          if (entry['type'] == "SRV") {
            port = entry['data']['port']
          }
          if (entry['type'] == "TXT") {
            txt = entry['data'].map(x => x.toString())
          }
        })

        if (node != undefined) {
          // Use console rather than logger to show in shell app.
          // TODO: move to shell via delegate hook.
          console.log("mdns response: " + node + " @ [" + ip.join(", ") + "]:" + port + "  " + mdns.iface + "  service=" + service)
      }
    }

    /**
     * Responds to a DNS-SD query for Commissionable Nodes.
     * @param {*} query 
     * @param {*} ip6Addr 
     */
    onCommissionableDiscovery(query, ip6Addr, mdns)
    {
        var self = this
        var instanceName = "914CE95294D70845"   // random 64-bit number
        var serviceName = Discovery.MDNS_DOMAIN_COMMISSIONABLE
        var servicesName = "_services._dns-sd._udp.local"
        var vendorID = 65521
        var discriminator = 0
        var txt = [
          'VP='+vendorID+'+32769',    ///< VID/PID (Vender ID / Product ID)
          'SII=5000',                 ///< Sleepy Idle Interval
          'SAI=300',                  ///< Sleepy Active Interval
          'T=1',
          'D='+discriminator,         ///< Discriminator
          'CM=1',
          'PH=33',
          'PI='
        ]

        mdns.respond({
          answers: [{
            name: servicesName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: serviceName,
          },
          {
            name: servicesName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: '_V'+vendorID+'._sub.'+serviceName,
          },
          {
            name: servicesName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: '_S'+discriminator+'._sub.'+serviceName,
          },
          {
            name: servicesName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: '_L'+discriminator+'._sub.'+serviceName,
          },
          {
            name: servicesName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: '_CM._sub.'+serviceName,
          },
          {
            name: '_V'+vendorID+'._sub.'+serviceName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: instanceName+'.'+serviceName
          },
          {
            name: '_S'+discriminator+'._sub.'+serviceName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: instanceName+'.'+serviceName
          },
          {
            name: '_L'+discriminator+'._sub.'+serviceName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: instanceName+'.'+serviceName
          },
          {
            name: '_CM._sub.'+serviceName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: instanceName+'.'+serviceName
          },
          { // Generic entry for 'matterc' service.
            // TODO: Is this to spec?
            name: serviceName,
            type: 'PTR',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: instanceName+'.'+serviceName
          }
          ],
          additionals: [{
            name: instanceName+'.'+serviceName,
            type: 'SRV',
            ttl: Discovery.MDNS_TTL_TIMEOUT,
            class: 'IN',
            flush: false,
            data: {
              port: self.IpPort,
              weight: 0,
              priority: 0,
              target: instanceName+'.local'
            }
          },{
              name: instanceName+'.local',
              type: 'AAAA',
              ttl: Discovery.MDNS_TTL_TIMEOUT,
              class: 'IN',
              flush: false,
              data: ip6Addr
          },{
            name: instanceName+'._matterc._udp.local',
            type: 'TXT',
            ttl: 4500,
            class: 'IN',
            flush: false,
            data: txt
          }]
        })
    }


    /**
     * Responds to 
     * @param {*} query 
     * @param {*} ip6Addr 
     */
    onOperationalDiscovery(query, ip6Addr, mdns)
    {
        var self = this

        // TODO: parse query for COMPRESSED_FABRIC_ID.NODE_ID... format.
        const fabricId = theNode.Store.FabricId
        const nodeId = theNode.Store.NodeId
        const instanceName = fabricId + "." + nodeId
        logger.trace('Discovery: Check for :'+instanceName)

        logger.trace('Discovery: Match! Sending _matter_ response:')

        // send an PTR-record response for queries to MDNS_DOMAIN_OPERATIONAL
        mdns.respond({
            answers: [{
                name: self.mdnsTarget + '.' + Discovery.MDNS_DOMAIN_OPERATIONAL,
                type: 'TXT',
                ttl: Discovery.MDNS_TTL_TIMEOUT,
                class: 'IN',
                flush: true,
                data: 'test'
            }, {
                name: self.mdnsTarget + '.' + Discovery.MDNS_DOMAIN_OPERATIONAL,
                type: 'SRV',
                flush: true,
                ttl: Discovery.MDNS_TTL_TIMEOUT,
                data: {
                    port: self.IpPort,
                    weight: 0,
                    priority: 0,
                    target: self.mdnsTarget
                }
            }, {
                name: self.mdnsTarget + '.local',
                type: 'AAAA',
                ttl: Discovery.MDNS_TTL_TIMEOUT,
                class: 'IN',
                flush: true,
                data: ip6Addr   // 'fe80::da49:2fff:fe49:d589'
            }, {
                name: Discovery.MDNS_DOMAIN_OPERATIONAL,
                type: 'PTR',
                class: 'IN',
                ttl: Discovery.MDNS_TTL_TIMEOUT,
                data: self.mdnsTarget + '.' + Discovery.MDNS_DOMAIN_OPERATIONAL
            }]
        })
    }

    /**
     * Enables responses for mdns queries.
     */
    initServer(mdns, ip6Addr) {
        var self = this
        mdns.on('query', (query) => self.onQuery(query, ip6Addr, mdns))
    }

    onQuery(query, ip6Addr, mdns)
    {
        // ================================================
        // DEBUG
        // ================================================
        //logger.debug("QUERY:")
        //logger.debug(query)
        var self = this

        // iterate over all questions to check if we should respond
        query.questions.forEach(function (q) {
            logger.trace("Discovery.onQuery: " + q.name + " " + q.type)

            if (q.type === 'PTR' || q.type === 'ANY') 
            {
              if (q.name.includes(Discovery.MDNS_DOMAIN_OPERATIONAL))
              {
                self.onOperationalDiscovery(q, ip6Addr, mdns)
              }
              else if (q.name === Discovery.MDNS_DOMAIN_COMMISSIONABLE)
              {
                self.onCommissionableDiscovery(q, ip6Addr, mdns)
              }
            }
        })
    }

    setTarget(mdnsTarget) {
        this.mdnsTarget = mdnsTarget
    }

    /**
     * Query for all visible Matter Nodes on all interfaces.
     */
    queryAll(serviceName = Discovery.MDNS_DOMAIN_OPERATIONAL, queryType = 'PTR') {
        this.mdnsInterfaces.forEach(entry =>
            entry.query({
                questions: [{
                    name: serviceName,
                    type: queryType
                }]
            })
        ) 
    }

    /**
     * Send mdns response on all interfaces.
     */
    respondAll(responseJson) {
        this.mdnsInterfaces.forEach(mdns => {
            mdns.respond(responseJson)
        })
    }
}

module.exports = Discovery

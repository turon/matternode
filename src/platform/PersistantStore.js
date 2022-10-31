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
 * @file Persistant Store Module
 * 
 * Usage:
 ```
    const PersistantStore = require("./platform/PersistantStore")

    var store = new PersistantStore()
    await store.init()
 ```
 */

const SRC = '../'
const crypto = require('crypto')
const logger = require(SRC+'util/Logger')
const tracer = require(SRC+'util/Tracer')
const Crypto = require(SRC+'crypto/Crypto')
const ExampleCerts = require(SRC+'crypto/ExampleCerts')
const { LocalStorage } = require('node-localstorage');
const MsgCodec = require(SRC+'message/MsgCodec');

/**
 * Class to manage persistant storage of parameters.
 */
class PersistantStore {
    constructor() {
    }

    /// Initializes the PersistantStore.
    init(nodenum=0) {
        this._storageDir = './.node'+nodenum
        this._storage = new LocalStorage(this._storageDir)

        this._nodeid = this._storage.getItem('nodeid')
        this._fabricid = this._storage.getItem('fabricid')
        this._encryptionKey = this._storage.getItem('encryptionKey')

        this._nodenum = this._storage.getItem('nodenum')
        this._ipPort = this._storage.getItem('udpPort')
        this._logLevel = this._storage.getItem('logLevel')
        this._traceLevel = this._storage.getItem('traceLevel')

        this._daPrivateKey = this._storage.getItem('daPrivateKey')
        this._daPublicKey = this._storage.getItem('daPublicKey')
        this._daCertificat = this._storage.getItem('daCertificate')

        this.setDefaults();
    }

    /// Sets initial values for the PersistantStore on first load.
    setDefaults() {
        if (!this._nodeid) {
            // Set initial value.
            this.NodeId = crypto.randomBytes(8).toString('hex')
        }

        if (!this._fabricid) {
            // Set initial value.
            this.FabricId = '0000000000000000'
        }

        if (!this._encryptionKey) {
            // Set initial value.
            this.EncryptionKey = '5eded244e5532b3cdc23409dbad052d2' // 'a9e011b1737c6d4b70e4c0a2fe660476' //'00112233445566778899aabbccddeeff'
        }

        if (!this._nodenum) {
            this.NodeNum = 0
        }

        if (!this._ipPort) {
            this.IpPort = MsgCodec.DEFAULT_PORT + Number(this.NodeNum)
        }

        if (!this._logLevel) {
            this.LogLevel = 'info'
        } else {
            this.LogLevel = this._logLevel // Set saved log level.
        }

        if (!this._traceLevel) {
            this.TraceLevel = 0
        } else {
            this.TraceLevel = this._traceLevel // Set saved log level.
        }

        if (!this._daPrivateKey) {
            this.DaPrivateKey = ExampleCerts.TEST_DAC_PRIVKEY.toString('hex')
        }

        if (!this._daCertificate) {
            this._daCertificate = ExampleCerts.TEST_DAC_CERTIFICATE.toString('hex')
        }
    }

    dump() {
        console.log('store: encryptionKey = '+this._encryptionKey)
        console.log('store: fabricid = '+this._fabricid)
        console.log('store: loglevel = '+this._logLevel)
        console.log('store: nodeid = '+this._nodeid)
        console.log('store: nodenum = '+this._nodenum)
        console.log('store: ipPort = '+this._ipPort)
    }

    /// Prepend zero pads given hex string to desired length.
    formatHex(hex, len) {
        var padded = hex.toString(len);
        while (padded.length < len) {
          padded = '0' + padded;
        }
        return padded;
    }

    get NodeId() { return this._nodeid }
    set NodeId(v) {
        v = this.formatHex(v, 16)
        this._nodeid = v
        //theNode.Discovery.update()
        this._storage.setItem('nodeid', v)
    }

    get FabricId() { return this._fabricid }
    set FabricId(v) {
        v = this.formatHex(v, 16)
        this._fabricid = v
        //theNode.Discovery.update()
        this._storage.setItem('fabricid', v)
    }

    get EncryptionKey() { return this._encryptionKey }
    set EncryptionKey(v) {
        v = this.formatHex(v, 32)
        this._encryptionKey = v
        this._storage.setItem('encryptionKey', v)
    }

    get NodeNum() { return this._nodenum }
    set NodeNum(v) {
        this._nodenum = Number(v)
        this.IpPort = MsgCodec.DEFAULT_PORT + this._nodenum
        this._storage.setItem('nodenum', v)
    }

    get IpPort() { return this._ipPort }
    set IpPort(v) {
        this._ipPort = Number(v)
        this._storage.setItem('ipPort', v)
    }

    get LogLevel() { return this._logLevel }
    set LogLevel(v) {
        try {
            logger.level = v
        } catch (err) {
            console.log("ERROR: invalid log level != debug|info|warn|error|fatal")
        }
        v = logger.level
        this._logLevel = v
        this._storage.setItem('logLevel', v)
    }

    get TraceLevel() { return this._traceLevel }
    set TraceLevel(v) {
        try {
            tracer.level = v
        } catch (err) {
            console.log("ERROR: invalid trace level != 0|1")
        }
        v = tracer.level
        this._traceLevel = v
        this._storage.setItem('traceLevel', v)
    }

    set DaPrivateKey(v) {
        this._daPrivateKey = v
        this._daPublicKey = Crypto.PublicFromPrivate(Buffer.from(v, 'hex')).toString('hex')
    }
    get DaPrivateKey() { return this._daPrivateKey }
    get DaPublicKey() { return this._daPublicKey }
    get DaCertificate() { return this._daCertificate }

    get mdnsTarget() { return this._fabricid + '-' + this._nodeid }

}

module.exports = PersistantStore

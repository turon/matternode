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

const assert = require('assert')

const SRC_ROOT = '../../src/'
const MsgCodec = require(SRC_ROOT+'message/MsgCodec')

const theTestMsgCryptoVector = [
    {
        key: "5eded244e5532b3cdc23409dbad052d2",
        plain:  "00b80b00393000000564ee0e207d",
        cipher: "00b80b00393000005a989ae42e8d847f535c3007e6150cd65867f2b817db",
    },    
]


function testMsgEncrypt(testEntry) {
    it("MsgCodec.encrypt", () => {
        var key = Buffer.from(testEntry['key'], "hex")
        var msg = Buffer.from(testEntry['plain'], "hex")
        var expect = Buffer.from(testEntry['cipher'], "hex")
        var result = MsgCodec.encrypt(msg, key)
        assert.equal(result.toString('hex'), expect.toString('hex'));
    });
}

describe('Test MsgCodec encrypt', () => {
    theTestMsgCryptoVector.forEach(testEntry => testMsgEncrypt(testEntry));
});


function testMsgDecrypt(testEntry) {
    it("MsgCodec.decrypt", () => {
        var key = Buffer.from(testEntry['key'], "hex")
        var enc = Buffer.from(testEntry['cipher'], "hex")
        var expect = Buffer.from(testEntry['plain'], "hex")
        var result = MsgCodec.decrypt(enc, key)
        assert.equal(result.toString('hex'), expect.toString('hex'));
    });
}

describe('Test MsgCodec decrypt', () => {
    theTestMsgCryptoVector.forEach(testEntry => testMsgDecrypt(testEntry));
});


const theTestMsgCodecVector = [
    {
        dsiz: 0, sFlag: 0,
        pFlag: 0, cFlag: 0,
        sessionType: 0,
        sessionId: 0x4455,
        counter: 0x12345678,
        src: 0x0000000000000001n,
        dst: 0x0000000000000002n,
        iFlag: 0, aFlag: 0, rFlag: 0,
        exchangeId: 0x1122,
        protocolId: 0x2334,
        opcode: 0x77,

        // expect
        messageFlags: 0,
        securityFlags: 0,
        exchangeFlags: 0,
        protocolHeader: "007722113423",
    },    
    {
        dsiz: 1, sFlag: 1,
        pFlag: 1, cFlag: 1,
        sessionType: 1,
        sessionId: 0x5566,
        counter: 0x23456789,
        src: 0x0000000400000004n,
        dst: 0x0000000500000005n,
        iFlag: 1, aFlag: 1, rFlag: 1,
        exchangeId: 0x8899,
        protocolId: 0x2334,
        opcode: 0x77,

        // expect
        messageFlags: 0x05,
        securityFlags: 0xC1,
        exchangeFlags: 0x07,
        protocolHeader: "077799883423",
    },    
]


function testMsgEncode(testEntry) {
    it("MsgCodec.encode", () => {
        var expect, result

        var messageFlags = MsgCodec.encodeMessageFlags(testEntry.dsiz, testEntry.sFlag)
        var securityFlags = MsgCodec.encodeSecurityFlags(testEntry.sessionType, testEntry.cFlag, testEntry.pFlag)
        var messageHeader = MsgCodec.encodeHeader(messageFlags, 
            testEntry.securityFlags, testEntry.sessionId,
            testEntry.counter, testEntry.src, testEntry.dst)

        var exchangeFlags = MsgCodec.encodeExchangeFlags(testEntry.iFlag, testEntry.aFlag, testEntry.rFlag)

        var protocolHeader = MsgCodec.encodeProtocolHeader(exchangeFlags, testEntry.exchangeId, 
                testEntry.opcode, testEntry.protocolId, null, null)

        assert.equal(messageFlags, testEntry.messageFlags, "MsgCodec.encodeMessageFlags")
        assert.equal(securityFlags, testEntry.securityFlags, "MsgCodec.encodeSecurityFlags")
        assert.equal(exchangeFlags, testEntry.exchangeFlags, "MsgCodec.encodeExchangeFlags")
        assert.equal(protocolHeader.toString('hex'), testEntry.protocolHeader)
    })
}


describe('Test MsgCodec encode', () => {
    theTestMsgCodecVector.forEach(testEntry => testMsgEncode(testEntry));
});

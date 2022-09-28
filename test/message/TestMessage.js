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
const Message = require(SRC_ROOT+'message/Message')
const MsgCodec = require(SRC_ROOT+'message/MsgCodec')


// =============================================================================================
//                      Test Message encode / decode
// =============================================================================================

const theTestMessageVector = [
    {
        plain: "00000000ab000000040005030300",

        MessageFlags: 0x00,
        SecurityFlags: 0x00,
        SessionId: 0x0000,
        SessionType: 0,
        Version: 0,

        MessageCounter: 0x000000ab,
        Sflag: 0,
        Dsiz: 0,
        Pflag: 0,
        Cflag: 0,
        Mxflag: 0,

        SourceNodeId: MsgCodec.NODE_ID_ANY,
        DestinationNodeId: MsgCodec.NODE_ID_ANY,

        Payload: "040005030300",
        ExchangeFlags: 0x04,
        ProtocolOpcode: 0,
        ExchangeId: 0x0305,
        ProtocolId: 0x0003,
        AppPayload: "",

        Iflag: 0,
        Aflag: 0,
        Rflag: 1,
        Sxflag: 0,
        Vflag: 0,
    },
    {
        plain: "f5eeddff7856341201000000000000000200000000000000040005030300112233445566778899",

        MessageFlags: 0xF5,
        SecurityFlags: 0xFF,
        SessionId: 0xDDEE,
        SessionType: 3,
        Version: 0xF,

        MessageCounter: 0x12345678,
        Sflag: 1,
        Dsiz: 1,
        Pflag: 1,
        Cflag: 1,
        Mxflag: 1,

        SourceNodeId: 1,
        DestinationNodeId: 2,

        Payload: "040005030300112233445566778899",
        ExchangeFlags: 0x04,
        ProtocolOpcode: 0,
        ExchangeId: 0x0305,
        ProtocolId: 0x0003,
        AppPayload: "112233445566778899",

        Iflag: 0,
        Aflag: 0,
        Rflag: 1,
        Sxflag: 0,
        Vflag: 0,
    },    
]


function testMessageDecode(testEntry) {
    var buf = Buffer.from(testEntry.plain, "hex")
    var msg = new Message(buf)

    it("Message.MessageFlags", () => {
        assert.equal(msg.MessageFlags, testEntry.MessageFlags);
    });

    it("Message.Version", () => {
        assert.equal(msg.Version, testEntry.Version);
    });

    it("Message.SecurityFlags", () => {
        assert.equal(msg.SecurityFlags, testEntry.SecurityFlags);
    });

    it("Message.SessionId", () => {
        assert.equal(msg.SessionId, testEntry.SessionId);
    });

    it("Message.SessionType", () => {
        assert.equal(msg.SessionType, testEntry.SessionType);
    });

    it("Message.MessageCounter", () => {
        assert.equal(msg.MessageCounter, testEntry.MessageCounter);
    });

    it("Message.Sflag", () => {
        assert.equal(msg.Sflag, testEntry.Sflag);
    });

    it("Message.Pflag", () => {
        assert.equal(msg.Pflag, testEntry.Pflag);
    });

    it("Message.Cflag", () => {
        assert.equal(msg.Cflag, testEntry.Cflag);
    });

    it("Message.Mxflag", () => {
        assert.equal(msg.Mxflag, testEntry.Mxflag);
    });

    it("Message.SourceNodeId", () => {
        assert.equal(msg.SourceNodeId, testEntry.SourceNodeId);
    });

    it("Message.DestinationNodeId", () => {
        assert.equal(msg.DestinationNodeId, testEntry.DestinationNodeId);
    });

    it("Message.Payload", () => {
        assert.equal(msg.Payload.toString("hex"), testEntry.Payload);
    });

    it("Message.ExchangeFlags", () => {
        assert.equal(msg.ExchangeFlags, testEntry.ExchangeFlags);
    });

    it("Message.ProtocolOpcode", () => {
        assert.equal(msg.ProtocolOpcode, testEntry.ProtocolOpcode);
    });

    it("Message.ExchangeId", () => {
        assert.equal(msg.ExchangeId, testEntry.ExchangeId);
    });

    it("Message.ProtocolId", () => {
        assert.equal(msg.ProtocolId, testEntry.ProtocolId);
    });

    it("Message.Iflag", () => {
        assert.equal(msg.Iflag, testEntry.Iflag);
    });

    it("Message.Aflag", () => {
        assert.equal(msg.Aflag, testEntry.Aflag);
    });

    it("Message.Rflag", () => {
        assert.equal(msg.Rflag, testEntry.Rflag);
    });

    it("Message.Sxflag", () => {
        assert.equal(msg.Sxflag, testEntry.Sxflag);
    });

    it("Message.Vflag", () => {
        assert.equal(msg.Vflag, testEntry.Vflag);
    });

    it("Message.AppPayload", () => {
        assert.equal(msg.AppPayload.toString("hex"), testEntry.AppPayload);
    });
}

describe('Test Message decode', () => {
    theTestMessageVector.forEach(testEntry => testMessageDecode(testEntry));
});

function testMessageEncode(testEntry) {
    var buf = Buffer.from(testEntry.plain, "hex")
    var msg = new Message()

    msg.MessageFlags = testEntry.MessageFlags
    msg.SecurityFlags = testEntry.SecurityFlags
    msg.SessionId = testEntry.SessionId
    msg.MessageCounter = testEntry.MessageCounter

    msg.SourceNodeId = testEntry.SourceNodeId
    msg.DestinationNodeId = testEntry.DestinationNodeId

    msg.ExchangeFlags = testEntry.ExchangeFlags
    msg.ExchangeId = testEntry.ExchangeId
    msg.ProtocolOpcode = testEntry.ProtocolOpcode
    msg.ProtocolId = testEntry.ProtocolId

    msg.AppPayload = Buffer.from(testEntry.AppPayload, "hex")

    assert.equal(msg.Decrypted.toString('hex'), testEntry.plain);
}

describe('Test Message encode', () => {
    theTestMessageVector.forEach(testEntry => testMessageEncode(testEntry));
});

// =============================================================================================
//                      Test Message crypto
// =============================================================================================

const theTestMessageCryptoVector = [
    {
        name: "basic pase message (no payload)",
        plain: "00b80b00393000000564ee0e207d",
        encrypted: "00b80b00393000005a989ae42e8d847f535c3007e6150cd65867f2b817db",
        privacy: "00b80b00393000005a989ae42e8d847f535c3007e6150cd65867f2b817db",

        encryptKey: "5eded244e5532b3cdc23409dbad052d2",
        privacyKey: "5eded244e5532b3cdc23409dbad052d2",
        privacyNonce: "0bb807e6150cd65867f2b817db",
        nonce: "00393000000000000000000000",
    },
    {
        name: "basic pase message (short payload)",
        plain: "00b80b00393000000564ee0e207d1122334455",
        encrypted: "00b80b00393000005a989ae42e8d0f7f885dfb2faa8949cf730a5728e0354610a0c4a7",
        privacy: "00b80b00393000005a989ae42e8d0f7f885dfb2faa8949cf730a5728e0354610a0c4a7",

        encryptKey: "5eded244e5532b3cdc23409dbad052d2",
        privacyKey: "5eded244e5532b3cdc23409dbad052d2",
        privacyNonce: "0bb8730a5728e0354610a0c4a7",
        nonce: "00393000000000000000000000",
    },
    {
        name: "basic pase message (short payload w/ privacy enabled)",
        plain: "00b80b80393000000564ee0e207d1122334455",
        encrypted: "00b80b8039300000aa26a0f901efce9f9a67c8137917d15b81d15d313308319758ea3f",
        privacy: "00b80b8087beef06aa26a0f901efce9f9a67c8137917d15b81d15d313308319758ea3f",

        encryptKey: "5eded244e5532b3cdc23409dbad052d2",
        privacyKey: "5eded244e5532b3cdc23409dbad052d2",
        privacyNonce: "0bb881d15d313308319758ea3f",
        nonce: "80393000000000000000000000",
    },
    {
        name: "secure group message",
        plain: "067ddb0178563412010000000000000002000164ee0e207d",
        encrypted: "067ddb01785634120100000000000000020065c767bc6cda0106c9801323900e9b3ce6d4bb0327d6",
        privacy:   "067ddb01785634120100000000000000020065c767bc6cda0106c9801323900e9b3ce6d4bb0327d6",

        encryptKey: "ca92d7a0942d1a511a0e26ad074f4c2f",
        privacyKey: "bfe9da016a765365f2dd97a9f939e425",
        privacyNonce: "db7d23900e9b3ce6d4bb0327d6",
        nonce: "01785634120100000000000000",

        // Extra fields for deriving the privacy key
        compressedFabricId: "2906c908d115d362",
        epochKey: "b0b1b2b3b4b5b6b7b8b9babbbcbdbebf",
        sessionId: 0xdb7d, // 56157
    },
    {
        name: "private group message",
        plain: "067ddb8179563412010000000000000002000164ee0e207d",
        encrypted: "067ddb8179563412010000000000000002002b2f915a66c9596290ebe4408217b3c0c921a2fca4e1",
        privacy:   "067ddb81d926afce24c8a0981bdd44f4e7302b2f915a66c9596290ebe4408217b3c0c921a2fca4e1",

        encryptKey: "ca92d7a0942d1a511a0e26ad074f4c2f",
        privacyKey: "bfe9da016a765365f2dd97a9f939e425",
        privacyNonce: "db7d408217b3c0c921a2fca4e1",
        nonce: "81795634120100000000000000",

        // Extra fields for deriving the privacy key
        compressedFabricId: "2906c908d115d362",
        epochKey: "b0b1b2b3b4b5b6b7b8b9babbbcbdbebf",
        sessionId: 0xdb7d, // 56157
    },
    {
        name: "private group message (retry)",
        plain: "067ddb8178563412010000000000000002000164ee0e207d",
        encrypted: "067ddb8178563412010000000000000002005b458675d42d2486dad6944fca22328e6b1e44dc0468",
        privacy:   "067ddb8131457fc65ec2edafaf0166a065425b458675d42d2486dad6944fca22328e6b1e44dc0468",

        encryptKey: "ca92d7a0942d1a511a0e26ad074f4c2f",
        privacyKey: "bfe9da016a765365f2dd97a9f939e425",
        privacyNonce: "db7d4fca22328e6b1e44dc0468",
        nonce: "81785634120100000000000000",

        // Extra fields for deriving the privacy key
        compressedFabricId: "2906c908d115d362",
        epochKey: "b0b1b2b3b4b5b6b7b8b9babbbcbdbebf",
        sessionId: 0xdb7d, // 56157
    },
]

function testMessageEncrypt(testEntry) {
    const key = Buffer.from(testEntry.encryptKey, "hex")
    const privacyKey = Buffer.from(testEntry.privacyKey, "hex")
    var buf = Buffer.from(testEntry.plain, "hex")
    var msg = new Message(buf)

    it("Message.encrypt: "+testEntry.name, () => {
        assert.equal(msg.encrypt(key).toString("hex"), testEntry.encrypted);
        assert.equal(msg.Encrypted.toString("hex"), testEntry.encrypted);
    });

    it("Message.privacyNonce: "+testEntry.name, () => {
        assert.equal(msg.PrivacyNonce.toString("hex"), testEntry.privacyNonce);
    });

    it("Message.Nonce: "+testEntry.name, () => {
        assert.equal(msg.Nonce.toString("hex"), testEntry.nonce);
    });

    it("Message.privacyEncrypt: "+testEntry.name, () => {
        assert.equal(msg.privacyEncrypt(privacyKey).toString("hex"), testEntry.privacy);
        assert.equal(msg.Encrypted.toString("hex"), testEntry.privacy);
    });
}

describe('Test Message encrypt', () => {
    theTestMessageCryptoVector.forEach(testEntry => testMessageEncrypt(testEntry));
});


function testMessageDecrypt(testEntry) {
    const key = Buffer.from(testEntry.encryptKey, "hex")
    const privacyKey = Buffer.from(testEntry.privacyKey, "hex")
    var buf = Buffer.from(testEntry.encrypted, "hex")
    var msg = new Message(buf, buf) // TODO: add peerInfo
    buf = Buffer.from(testEntry.privacy, "hex")
    var privateMsg = new Message(buf, buf) // TODO: add peerInfo

    it("Message.encrypt: "+testEntry.name, () => {
        assert.equal(msg.decrypt(key).toString("hex"), testEntry.plain);
        assert.equal(msg.Decrypted.toString("hex"), testEntry.plain);
    });

    it("Message.privacyNonce: "+testEntry.name, () => {
        assert.equal(privateMsg.PrivacyNonce.toString("hex"), testEntry.privacyNonce);
    });

    it("Message.privacyDecrypt: "+testEntry.name, () => {
        assert.equal(privateMsg.privacyDecrypt(privacyKey).toString("hex"), testEntry.encrypted);
        assert.equal(privateMsg.Encrypted.toString("hex"), testEntry.encrypted);
        assert.equal(privateMsg.Nonce.toString("hex"), testEntry.nonce);
    });
}

describe('Test Message decrypt', () => {
    theTestMessageCryptoVector.forEach(testEntry => testMessageDecrypt(testEntry));
});
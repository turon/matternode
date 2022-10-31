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

const assert = require('assert');

const SRC_ROOT = '../../src/'
const { TlvCodec } = require(SRC_ROOT+'tlv/TlvCodec');
const { TlvWriter } = require(SRC_ROOT+'tlv/TlvWriter');


const theTestTlvVector = [
    {
        type: "uint8",
        tag: undefined,
        value: 0,
        tlv: "0400",
    },
    {
        type: "uint8",
        tag: undefined,
        value: 1,
        tlv: "0401",
    },
    {
        type: "uint16",
        tag: undefined,
        value: 0x0123,
        tlv: "052301",
    },
    {
        type: "uint32",
        tag: undefined,
        value: 0x01234567,
        tlv: "0667452301",
    },
    {
        type: "uint64",
        tag: undefined,
        value: 0x0011223344556677n,
        tlv: "077766554433221100",
    },
    {   // Test uint64 max value
        type: "uint64",
        tag: undefined,
        value: 0xFFFFFFFFFFFFFFFFn,
        tlv: "07FFFFFFFFFFFFFFFF",
    },
    {
        type: "int8",
        tag: undefined,
        value: -1,
        tlv: "00FF",
    },
    {
        type: "int16",
        tag: undefined,
        value: -1000,
        tlv: "0118FC",
    },
    {
        type: "int32",
        tag: undefined,
        value: -100000,
        tlv: "026079FEFF",
    },
    {
        type: "int64",
        tag: undefined,
        value: -1000000000000,
        tlv: "0300F05A2B17FFFFFF",
    },
    {
        type: "double",
        tag: undefined,
        value: 1.2,
        tlv: "0B333333333333f33f",
    },
    {
        type: "boolean",
        tag: undefined,
        value: false,
        tlv: "08",
    },
    {
        type: "boolean",
        tag: undefined,
        value: true,
        tlv: "09",
    },
    {
        type: "null",
        tag: undefined,
        value: undefined,
        tlv: "14",
    },
    {
        type: "string",
        tag: undefined,
        value: "hi",
        tlv: "0c026869",
    },
    {
        type: "Buffer",
        tag: undefined,
        value: Buffer.from("01020304","hex"),
        tlv: "100401020304",
    },
    {
        // Context-specific 1 byte tag
        type: "null",
        tag: 0x01,
        value: undefined,
        tlv: "3401",
    },
    {
        // Common profile 2 byte tag
        type: "null",
        tag: 0x1234,
        profile: 0,
        value: undefined,
        tlv: "543412",
    },
    {
        // Common profile 4 byte tag
        type: "null",
        tag: 0x12345678,
        profile: 0,
        value: undefined,
        tlv: "7478563412",
    },
    {
        // Implicit profile 2 byte tag
        type: "null",
        tag: 0x1234,
        profile: -1,
        value: undefined,
        tlv: "943412",
    },
    {
        // Implicit profile 4 byte tag
        type: "null",
        tag: 0x12345678,
        profile: -1,
        value: undefined,
        tlv: "B478563412",
    },
    {
        // Fully-qualified profile 2 byte tag
        type: "null",
        tag: 0x1234,
        profile: 0xAABBCCDD,
        value: undefined,
        tlv: "D4DDCCBBAA3412",
    },
    {
        // Fully-qualified profile 4 byte tag
        type: "null",
        tag: 0x12345678,
        profile: 0xAABBCCDD,
        value: undefined,
        tlv: "F4DDCCBBAA78563412",
    },
]

describe('Test TlvCodec encode', () => {
  it('TLVCodec.encode 0 as uint8', () => {
      var result = TlvCodec.encodeUnsignedInt(0)
      var expect = Buffer.from("00", "hex")
      assert.equal(result.toString('hex'), expect.toString('hex'));
  });
  it('TLVCodec.encode 1 as uint8', () => {
    var result = TlvCodec.encodeUnsignedInt(1)
    var expect = Buffer.from("01", "hex")
    assert.equal(result.toString('hex'), expect.toString('hex'));
  });
  it('TLVCodec.encode 0x0123 as uint16', () => {
    var result = TlvCodec.encodeUnsignedInt(0x0123)
    var expect = Buffer.from("2301", "hex")
    assert.equal(result.toString('hex'), expect.toString('hex'));
  });
  it('TLVCodec.encode 0x01234567 as uint32', () => {
    var result = TlvCodec.encodeUnsignedInt(0x01234567)
    var expect = Buffer.from("67452301", "hex")
    assert.equal(result.toString('hex'), expect.toString('hex'));
  });

  it('TLVCodec.encode 0x0011223344556677 as uint64_t', () => {
    var result = TlvCodec.encodeUnsignedInt(0x0011223344556677)
    var expect = Buffer.from("7766554433221100", "hex")
    assert.equal(result.toString('hex'), expect.toString('hex'));
  });

  it('TLVCodec.encode -1 as int8', () => {
    var result = TlvCodec.encodeSignedInt(-1)
    var expect = Buffer.from("FF", "hex")
    assert.equal(result.toString('hex'), expect.toString('hex'));
  });
  it('TLVCodec.encode -1000 as int16', () => {
    var result = TlvCodec.encodeSignedInt(-1000)
    var expect = Buffer.from("18FC", "hex")
    assert.equal(result.toString('hex'), expect.toString('hex'));
  });
  it('TLVCodec.encode -100,000 as int32', () => {
    var result = TlvCodec.encodeSignedInt(-100000)
    var expect = Buffer.from("6079FEFF", "hex")
    assert.equal(result.toString('hex'), expect.toString('hex'));
  });

  it('TLVCodec.encode -1,000,000,000,000 as uint64_t', () => {
    var result = TlvCodec.encodeSignedInt(-1000000000000)
    var expect = Buffer.from("00F05A2B17FFFFFF", "hex")
    assert.equal(result.toString('hex'), expect.toString('hex'));
  });
});


function testTagTypeName(testEntry)
{
    var tagType = ""
    if (testEntry['tag'] == undefined)
    {
        tagType = "anonymous tag"
    }
    else if (testEntry['profile'] == undefined)
    {
        tagType = "context tag"
    }
    else if (testEntry['profile'] == 0)
    {
        tagType = "common profile tag"
    }
    else if (testEntry['profile'] == -1)
    {
        tagType = "implicit profile tag"
    }
    else
    {
        tagType = "fully qualified tag"
    }
    return tagType
}

function testTlvCodecDecode(testEntry) {
    var tagType = testTagTypeName(testEntry)
    var testTitle = "TlvCodec.decode " + tagType + ": " + testEntry['type'] + " " + testEntry['value']
    it(testTitle, () => {
        var tlv = Buffer.from(testEntry['tlv'], 'hex')
        var type = TlvCodec.decodeControlByte(tlv)['typeNum']
        var {value, length} = TlvCodec.decodeValueAndLength(tlv.subarray(1), type)

        if (testEntry['type'] == 'Buffer')
        {
            assert.equal(value.toString('hex'), testEntry['value'].toString('hex'));
        } else {
            assert.equal(value, testEntry['value']);
        }
    });
}

describe('Test TlvCodec decode', () => {
    theTestTlvVector.forEach(testEntry => testTlvCodecDecode(testEntry));
});


function testTlvWriter(testEntry) {
    var tagType = testTagTypeName(testEntry)

    var testTitle = "TlvWriter.put " + tagType + ": " + testEntry['type'] + " " + testEntry['value']

    it(testTitle, () => {
        var writer = new TlvWriter()
        writer.put(testEntry['value'],testEntry['tag'],testEntry['profile'])
        var result = writer.Buffer
        var expect = Buffer.from(testEntry['tlv'], 'hex')

        assert.equal(result.toString('hex'), expect.toString('hex'));
    });
}

describe('Test TlvWriter encode', () => {
    theTestTlvVector.forEach(testEntry => testTlvWriter(testEntry));
});
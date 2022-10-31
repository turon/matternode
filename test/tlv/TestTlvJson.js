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
const TlvCodec = require(SRC_ROOT+'tlv/TlvCodec')
const { TlvReader } = require(SRC_ROOT+'tlv/TlvReader')
const { TlvWriter } = require(SRC_ROOT+'tlv/TlvWriter')
const { TlvParser } = require(SRC_ROOT+'tlv/TlvParser')

const TestProfile_1 = 0xCCDDAABB
const TestProfile_2 = 0x33441122


const theTestTlvJsonVector = [
    {
        tlv: 
        "D5BBAADDCC0100C9BBAADDCC02008802"+
        "003600002A00EF02F067FDFF0700902F"+
        "5009000000151817D4BBAADDCC1100B4"+
        "A0BB0D0014B500286BEE6D701101000E"+
        "0153544152542E2E2E21313233343536"+
        "37383941424344454640313233343536"+
        "37383941424344454623313233343536"+
        "37383941424344454624313233343536"+
        "37383941424344454625313233343536"+
        "3738394142434445465E313233343536"+
        "37383941424344454626313233343536"+
        "3738394142434445462A313233343536"+
        "37383941424344454630313233343536"+
        "37283941424344454630313233343536"+
        "37293941424344454630313233343536"+
        "372D3941424344454630313233343536"+
        "373D3941424344454630313233343536"+
        "375B3941424344454630313233343536"+
        "375D3941424344454630313233343536"+
        "373B3941424344454630313233343536"+
        "3727394142434445462E2E2E454E4418"+
        "1818CCBBAADDCC05000E546869732069"+
        "73206120746573748AFFFF33338F41AB"+
        "000001006666666666E6314018",

        decoded: 
        [
            { profile: TestProfile_1, tag: 1, type: "struct", value: [
                { profile: TestProfile_1, tag: 2, type: "boolean", value: true },
                { profile: -1, tag: 2, type: "boolean", value: false },
                { tag: 0, type: "array", value: [
                    { type: "int8", value: 42 },
                    { type: "int8", value: -17 },
                    { type: "int32", value: -170000 },
                    { type: "uint64", value: 40000000000n },
                    { type: "struct", value: [] },
                    { type: "list", value: [
                        { profile: TestProfile_1, tag: 17, type: "null" },
                        { profile: -1, tag: 900000, type: "null" },
                        { type: "null", value: undefined },
                        { profile: -1, tag: 4000000000, type: "struct", value: [
                            { 
                                profile: 0, tag: 70000, type: "string uint16 len", value:
                                "START..."+
                                "!123456789ABCDEF@"+
                                "123456789ABCDEF#1"+
                                "23456789ABCDEF$12"+
                                "3456789ABCDEF%123"+
                                "456789ABCDEF^1234"+
                                "56789ABCDEF&12345"+
                                "6789ABCDEF*123456"+
                                "789ABCDEF"+
                                "01234567(9ABCDEF0"+
                                "1234567)9ABCDEF01"+
                                "234567-9ABCDEF012"+
                                "34567=9ABCDEF0123"+
                                "4567[9ABCDEF01234"+
                                "567]9ABCDEF012345"+
                                "67;9ABCDEF0123456"+
                                "7'9ABCDEF"+
                                "...END"
                            }
                        ]}
                    ]},
                ]},
                { profile: TestProfile_1, tag: 5, type: "string uint8 len", value: "This is a test" },
                { profile: -1, tag: 65535, type: "float", value: 17.899999618530273 },
                { profile: -1, tag: 65536, type: "double", value: 17.9 },
            ]},
        ],           
    },

       /* ^^^^^^^^^^^^^^^^
            {
                CHIP_TLV_STRUCTURE(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 1)),
                    CHIP_TLV_BOOL(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 2), true),
                    CHIP_TLV_BOOL(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(2), false),
                    CHIP_TLV_ARRAY(CHIP_TLV_TAG_CONTEXT_SPECIFIC(0)),
                        CHIP_TLV_INT8(CHIP_TLV_TAG_ANONYMOUS, 42),
                        CHIP_TLV_INT8(CHIP_TLV_TAG_ANONYMOUS, -17),
                        CHIP_TLV_INT32(CHIP_TLV_TAG_ANONYMOUS, -170000),
                        CHIP_TLV_UINT64(CHIP_TLV_TAG_ANONYMOUS, 40000000000ULL),
                        CHIP_TLV_STRUCTURE(CHIP_TLV_TAG_ANONYMOUS), CHIP_TLV_END_OF_CONTAINER,
                        CHIP_TLV_LIST(CHIP_TLV_TAG_ANONYMOUS),
                            CHIP_TLV_NULL(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 17)),
                            CHIP_TLV_NULL(CHIP_TLV_TAG_IMPLICIT_PROFILE_4Bytes(900000)),
                            CHIP_TLV_NULL(CHIP_TLV_TAG_ANONYMOUS),
                            CHIP_TLV_STRUCTURE(CHIP_TLV_TAG_IMPLICIT_PROFILE_4Bytes(4000000000ULL)),
                                CHIP_TLV_UTF8_STRING_2ByteLength(CHIP_TLV_TAG_COMMON_PROFILE_4Bytes(70000), sizeof(sLargeString) - 1,
                                'S', 'T', 'A', 'R', 'T', '.', '.', '.',
                                '!', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '@',
                                '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '#', '1',
                                '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '$', '1', '2',
                                '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '%', '1', '2', '3',
                                '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '^', '1', '2', '3', '4',
                                '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '&', '1', '2', '3', '4', '5',
                                '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '*', '1', '2', '3', '4', '5', '6',
                                '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
                                '0', '1', '2', '3', '4', '5', '6', '7', '(', '9', 'A', 'B', 'C', 'D', 'E', 'F', '0',
                                '1', '2', '3', '4', '5', '6', '7', ')', '9', 'A', 'B', 'C', 'D', 'E', 'F', '0', '1',
                                '2', '3', '4', '5', '6', '7', '-', '9', 'A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2',
                                '3', '4', '5', '6', '7', '=', '9', 'A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3',
                                '4', '5', '6', '7', '[', '9', 'A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4',
                                '5', '6', '7', ']', '9', 'A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5',
                                '6', '7', ';', '9', 'A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6',
                                '7', '\'', '9', 'A', 'B', 'C', 'D', 'E', 'F',
                                '.', '.', '.', 'E', 'N', 'D'),
                            CHIP_TLV_END_OF_CONTAINER,
                        CHIP_TLV_END_OF_CONTAINER,
                    CHIP_TLV_END_OF_CONTAINER,
                    CHIP_TLV_UTF8_STRING_1ByteLength(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 5), sizeof("This is a test") - 1,
                        'T', 'h', 'i', 's', ' ', 'i', 's', ' ', 'a', ' ', 't', 'e', 's', 't'),
                    CHIP_TLV_FLOAT32(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(65535),
                        0x33, 0x33, 0x8f, 0x41), // (float)17.9
                    CHIP_TLV_FLOAT64(CHIP_TLV_TAG_IMPLICIT_PROFILE_4Bytes(65536),
                        0x66, 0x66, 0x66, 0x66, 0x66, 0xE6, 0x31, 0x40), // (double)17.9
                CHIP_TLV_END_OF_CONTAINER
            };
        */


    {
        tlv: 
        // Container 1
        "D5BBAADDCC0100"+
            "C9BBAADDCC0200"+
            "880200"+
            "C8BBAADDCC0200"+
            "890200"+
            "D5BBAADDCC0100"+
                "C9BBAADDCC0200"+
                "880200"+
            "18"+
            "950100"+
                "880200"+
                "C9BBAADDCC0200"+
            "18"+
        "18"+
        // Container 2
        "950100"+
            "880200"+
            "C9BBAADDCC0200"+
        "18",

        decoded:
        [
            { profile: TestProfile_1, tag: 1, type: "struct", value: [
                { profile: TestProfile_1, tag: 2, type: "boolean", value: true },
                { profile: -1, tag: 2, type: "boolean", value: false },
                { profile: TestProfile_1, tag: 2, type: "boolean", value: false },
                { profile: -1, tag: 2, type: "boolean", value: true },

                { profile: TestProfile_1, tag: 1, type: "struct", value:[
                    { profile: TestProfile_1, tag: 2, type: "boolean", value: true },
                    { profile: -1, tag: 2, type: "boolean", value: false },
                ]},

                { profile: -1, tag: 1, type: "struct", value:[
                    { profile: -1, tag: 2, type: "boolean", value: false },
                    { profile: TestProfile_1, tag: 2, type: "boolean", value: true },
                ]},
            ]},
            { profile: -1, tag: 1, type: "struct", value: [
                { profile: -1, tag: 2, type: "boolean", value: false },
                { profile: TestProfile_1, tag: 2, type: "boolean", value: true },
            ]}
        ]
    },

    /* ^^^^^^^^^^^^^^^^TestProfile_2
    CHIP_TLV_STRUCTURE(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 1)),
        CHIP_TLV_BOOL(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 2), true),
        CHIP_TLV_BOOL(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(2), false),
        CHIP_TLV_BOOL(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 2), false),
        CHIP_TLV_BOOL(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(2), true),

        CHIP_TLV_STRUCTURE(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 1)),
            CHIP_TLV_BOOL(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 2), true),
            CHIP_TLV_BOOL(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(2), false),
        CHIP_TLV_END_OF_CONTAINER,

        CHIP_TLV_STRUCTURE(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(1)),
            CHIP_TLV_BOOL(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(2), false),
            CHIP_TLV_BOOL(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 2), true),
        CHIP_TLV_END_OF_CONTAINER,
    CHIP_TLV_END_OF_CONTAINER,

    CHIP_TLV_STRUCTURE(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(1)),
        CHIP_TLV_BOOL(CHIP_TLV_TAG_IMPLICIT_PROFILE_2Bytes(2), false),
        CHIP_TLV_BOOL(CHIP_TLV_TAG_FULLY_QUALIFIED_6Bytes(TestProfile_1, 2), true),
    CHIP_TLV_END_OF_CONTAINER,

    */
]


function testTlvReader(testEntry) {
    var testTitle = "TlvReader.decode"
    it(testTitle, () => {
        var expect = testEntry['decoded']
        var tlv = Buffer.from(testEntry['tlv'], "hex")
        var reader = new TlvReader()

        reader.decode(tlv)
        var result = reader.Json

        assert.equal(TlvParser.JsonStringify(result), TlvParser.JsonStringify(expect));
    });
}

describe('Test TlvReader to JSON', () => {
    theTestTlvJsonVector.forEach(testEntry => testTlvReader(testEntry));
});


function testTlvWriter(testEntry) {
    var testTitle = "TlvWriter.encode"
    it(testTitle, () => {
        var expect = Buffer.from(testEntry['tlv'], "hex")
        var json = testEntry['decoded']
        var writer = new TlvWriter()

        writer.encode(json)
        var result = writer.Buffer

        assert.equal(result.toString('hex'), expect.toString('hex'));
    });
}

describe('Test TlvWriter from JSON', () => {
    theTestTlvJsonVector.forEach(testEntry => testTlvWriter(testEntry));
});
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
const { TlvReader } = require(SRC_ROOT+'tlv/TlvReader')
const { TlvWriter } = require(SRC_ROOT+'tlv/TlvWriter')

var theTestPaseTlvVector = [
    {
        name: "PBKDF Param Request",
        tlv: "153001203a7af536dd98889d79e3d8491bbce80911d0a20ec27a294d301c253c78c12b512502010025030000280418",
        json: { type:"struct", value: [
            { tag:1, type:"Buffer", value: Buffer.from("3a7af536dd98889d79e3d8491bbce80911d0a20ec27a294d301c253c78c12b51","hex") },
            { tag:2, type:"uint16", value: 1 },
            { tag:3, type:"uint16", value: 0 },
            { tag:4, value: false },
        ]}
    },
    {
        name: "PBKDF Param Response", // 631c74e7
        tlv: "153001203a7af536dd98889d79e3d8491bbce80911d0a20ec27a294d301c253c78c12b5130022042e47b136fdb8695064dd2d670e34115103a2ad54c5bf0869dd8a97da89c18f02503000035042601640000003002105350414b453250204b65792053616c741818",
    },
    {
        name: "PAKE1", // fe6f70dc
        tlv: "1530014104b801dd6fd81698f8c42d5361661df59c0ba2144430c90f73fb18e8571128925f44f0998adfbc09f2a430d9202048b358457169d32762437c4c1ab13f27eb3c2618",
    },
    {
        name: "PAKE2", // 641c74e7
        tlv: "15300141048709d2758348dd8498f1e71ac0a0ee3819d2a57349a5a45ef26e525741ac8013c5d14df2cff6ebda3988c99a14a53ad01eb0f61ae5310a075d82277092f03ea9300220cd4884cf0e9682d1d3e84c5e922ee50ba2faaacbcfba534babc44c193831b31218",
    },
    {
        name: "PAKE3", // ff6f70dc
        tlv: "153001208d3855c889727cff7b460e541b1f571f47d373831f3cff7e4fadb0c6c4b5a47818",
    },
]


function testPaseTlvReader(testEntry)
{
    var testTitle = "TlvReader.decode"
    it(testTitle, () => {
        var tlv = Buffer.from(testEntry['tlv'], "hex")
        var reader = new TlvReader()
        reader.decode(tlv)
        var result = reader.Json
        //console.log(testEntry['name'])
        //console.log(JSON.stringify(result, null, 2))

        //assert.equal(JSON.stringify(result), JSON.stringify(expect));
        //assert.deepEqual(result, expect);
    });

}

describe('Test TlvReader PASE', () => {
    theTestPaseTlvVector.forEach(testEntry => testPaseTlvReader(testEntry));
})

function testPaseTlvWriter(testEntry)
{
    var localRandom = Buffer.from("3a7af536dd98889d79e3d8491bbce80911d0a20ec27a294d301c253c78c12b51","hex")
    var json = [
        { type:"struct", value: [
            { tag:1, type:"Buffer", value: localRandom },
            { tag:2, type:"uint16", value: 1 },
            { tag:3, type:"uint16", value: 0 },
            { tag:4, value: false },
        ]}
    ]
    //var writer = new TlvWriter()
    //var result = writer.put(json)
    //console.log(result.toString('hex'))
}
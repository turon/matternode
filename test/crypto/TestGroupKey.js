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

const SRC_ROOT = '../../src/'

const assert = require('assert')
const GroupKey = require(SRC_ROOT+'crypto/GroupKey')


const kFabricId1 = "2906c908d115d362"
const kCompressedFabricIdBuffer1 = "87e1b004e235a130"

const kFabricId2 = "5e1c0f1b2c813c7a"
const kCompressedFabricIdBuffer2 = "3faae29093d5af45"

const theTestGroupKdfVector = [
    // ========================================================================
    //  From <connectedhomeip>/src/credentials/tests/TestGroupDataProvider.cpp
    // ========================================================================
    {   // 0
        epochKey: "00000000000000000000000000000000",
        fabricId: kFabricId1,
        compressedFabricId: kCompressedFabricIdBuffer1,

        operationalKey: "c5f2690187115150c356ad93b385bb0f",
        privacyKey: "f5ce81881d1118c5c891c9060bc77009",
        groupSessionId: "479e",
    },
    {   // 1
        epochKey: "101112131415161718191a1b1c1d1e1f",
        fabricId: kFabricId1,
        compressedFabricId: kCompressedFabricIdBuffer1,

        operationalKey: "aed95695f375d2ce78556a41730c3f43",
        privacyKey: "dc90db2e61765a42607fafaf1637400a",
        groupSessionId: "a512",
    },
    {   // 2
        epochKey: "202122232425262728292a2b2c2d2e2f",
        fabricId: kFabricId1,
        compressedFabricId: kCompressedFabricIdBuffer1,

        operationalKey: "35ca346e5e24bbbe889cf4d35c5e820a",
        privacyKey: "b1fb3e79a2ff27f3704d2be9192db607",
        groupSessionId: "d800",
    },
    {   // 3
        epochKey: "303132333435363738393a3b3c3d3e3f",
        fabricId: kFabricId1,
        compressedFabricId: kCompressedFabricIdBuffer1,

        operationalKey: "66448177369fc19d250e040dd627c6c9",
        privacyKey: "d9e93de692f923bfee90ae1bb8f2f562",
        groupSessionId: "beb7",
    },
    {   // 4
        epochKey: "404142434445464748494a4b4c4d4e4f",
        fabricId: kFabricId1,
        compressedFabricId: kCompressedFabricIdBuffer1,

        operationalKey: "a2f47c18c31c80127ccc695a46c1d7fc",
        privacyKey: "622d6aab4dffbd87d6a05a4ddc24e966",
        groupSessionId: "7d34",
    },
    {   // 5
        epochKey: "505152535455565758595a5b5c5d5e5f",
        fabricId: kFabricId1,
        compressedFabricId: kCompressedFabricIdBuffer1,

        operationalKey: "ed1b3011436acd21c78d017dcf646288",
        privacyKey: "e7634b4976e1ce01ffdc4b5641cff61d",
        groupSessionId: "1c4f",
    },
    {   // 6
        epochKey: "a0a1a2a3a4a5a6a7a8a9aaabacadaeaf",
        fabricId: kFabricId2,
        compressedFabricId: kCompressedFabricIdBuffer2,

        operationalKey: "de0c18689efaa7689121745b68f44da5",
        privacyKey: "b56063598079248cf0cf6cbe94d01860",
        groupSessionId: "aeaf",
    },
    {   // 7
        epochKey: "b0b1b2b3b4b5b6b7b8b9babbbcbdbebf",
        fabricId: kFabricId2,
        compressedFabricId: kCompressedFabricIdBuffer2,

        operationalKey: "29d074c5ee8767c9ae13042920a1b3b8",
        privacyKey: "b5a98204743503a103af205253414f82",
        groupSessionId: "2068",
    },
    {   // 8
        epochKey: "c0c1c2c3c4c5c6c7c8c9cacbcccdcecf",
        fabricId: kFabricId2,
        compressedFabricId: kCompressedFabricIdBuffer2,

        operationalKey: "7e62e333d44696b2793822c60754a747",
        privacyKey: "dd890c6bc4551b11cb4375f573bebb36",
        groupSessionId: "ecf4",
    },
    {   // 9
        epochKey: "d0d1d2d3d4d5d6d7d8d9dadbdcdddedf",
        fabricId: kFabricId2,
        compressedFabricId: kCompressedFabricIdBuffer2,

        operationalKey: "b044a6f70e6816662185fbaf1f2b7c6e",
        privacyKey: "75a09de9f86a1dd36027b215b254737a",
        groupSessionId: "7a2c",
    },
    {   // 10
        epochKey: "e0e1e2e3e4e5e6e7e8e9eaebecedeeef",
        fabricId: kFabricId2,
        compressedFabricId: kCompressedFabricIdBuffer2,

        operationalKey: "f3e88e05a0e1bc085c88c77b0a413319",
        privacyKey: "f9aea001242bf5161a349026086e9e19",
        groupSessionId: "8e58",
    },
    {   // 11
        epochKey: "f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff",
        fabricId: kFabricId2,
        compressedFabricId: kCompressedFabricIdBuffer2,

        operationalKey: "9bc12c972e0a43df2e5a9e8f94265c81",
        privacyKey: "49c85971d1669fc526491757faf0b5d2",
        groupSessionId: "4ddd",
    },
    // ===============================================================
    //  From <connectedhomeip>/src/crypto/tests/CHIPCryptoPALTest.cpp
    // ===============================================================
    {   // 12
        epochKey: "a0a1a2a3a4a5a6a7a8a9aaabacadaeaf",
        compressedFabricId: "2906c908d115d362",

        operationalKey: "1f19ed3cef8a211baf306faeeee7aac6",
        privacyKey: "b8279f89621ed327a9c39f6a27247358",
        groupSessionId: "6c80",
    },
    {   // 13
        epochKey: "b0b1b2b3b4b5b6b7b8b9babbbcbdbebf",
        compressedFabricId: "2906c908d115d362",

        operationalKey: "aa979a48bd8cdf293a0709b9c1eb1930",
        privacyKey: "f72570c3c089a0fe28758357afffb8d2",
        groupSessionId: "0c48",
    },
    {   // 14
        epochKey: "235bf7e62823d358dca4ba50b1535f4b",
        compressedFabricId: "87e1b004e235a130",

        operationalKey: "a6f5306baf6d050af23ba4bd6b9dd960",
        privacyKey: "01f8d1927126f194082572d49b1fdc73",
        groupSessionId: "b9f7",
    },
]

function testGroupKdf(testEntry, testIndex)
{
    const epochKey = Buffer.from(testEntry.epochKey, 'hex')
    const privacyKey = Buffer.from(testEntry.privacyKey, 'hex')
    const operationalKey = Buffer.from(testEntry.operationalKey, 'hex')
    const compressedFabricId = Buffer.from(testEntry.compressedFabricId, 'hex')

    it("["+testIndex+"] Test GroupKey.DeriveGroupKey: fabricId="+testEntry.fabricId, async function () {
        const outKey = await GroupKey.DeriveGroupKey(epochKey, compressedFabricId)
        assert.equal(outKey.toString('hex'), testEntry.operationalKey)
    })

    it("["+testIndex+"] Test GroupKey.DeriveGroupPrivacyKey: compFabricId="+testEntry.compressedFabricId, async function () {
        const outKey = await GroupKey.DerivePrivacyKey(operationalKey)
        assert.equal(outKey.toString('hex'), testEntry.privacyKey)
    })

    it("["+testIndex+"] Test GroupKey.DeriveGroupKeyHash", async function () {
        const keyHash = await GroupKey.DeriveGroupKeyHash(operationalKey)
        assert.equal(keyHash.toString('hex'), testEntry.groupSessionId)
    })
}

describe('Test Group Key KDF', () => {
    theTestGroupKdfVector.forEach((testEntry, testIndex) => testGroupKdf(testEntry, testIndex))
})

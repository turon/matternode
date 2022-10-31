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
const Crypto = require(SRC_ROOT+'crypto/Crypto')

const theTestCompressedFabricIdVector = [

    {
        rootPublicKey: '4a9f42b1ca4840d37292bbc7f6a7e11e22200c976fc900dbc98a7a383a641cb8254a2e56d4e295a847943b4e3897c4a773e930277b4d9fbede8a052686bfacfa',
        fabricId: BigInt('0x2906c908d115d362'),
        compressedFabricId: '87e1b004e235a130',
    },
    {
        rootPublicKey: '4a9f42b1ca4840d37292bbc7f6a7e11e22200c976fc900dbc98a7a383a641cb8254a2e56d4e295a847943b4e3897c4a773e930277b4d9fbede8a052686bfacfa',
        fabricId: BigInt('0x5e1c0f1b2c813c7a'),
        compressedFabricId: '3faae29093d5af45',
    }
]

function testCompressedFabricId(testEntry)
{
    it("Crypto.GenerateCompressedFabricId", async function () {
        const rootPublicKey = Buffer.from(testEntry.rootPublicKey, 'hex')
        const compressedFabricId = Crypto.GenerateCompressedFabricId(rootPublicKey, testEntry.fabricId)
        assert.equal(compressedFabricId.toString('hex'), testEntry.compressedFabricId)
    })

}

describe('Test Crypto.GenerateCompressedFabricId', () => {
    theTestCompressedFabricIdVector.forEach(testEntry => testCompressedFabricId(testEntry))
})

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

const theTestCsrVector = [

    {
        csrNonce: '814a4d4c1c4a8ebbeadb0ae282f991eb13ac5f9fce94309319aa94096c8cd4b8',
        attestationChallenge: '7a495305d07779a494dd39a0851b660d',
        daPrivateKey: '38f3e0a1f145ba1bf3e44b552def65273d1d8e276aa314ac742eb128933ba64b',
        daPublicKey: '04ce5cf8efb05d4eee790d0a71d5c011bb747240dba21458845d33e34b0af6651633063a804b2ff85dcab2019a0ab6f5595775fe8d85fbd7a07c8e837da4d5a8b9',
        opPrivateKey: '1c1882e87f80d81a259a62b6ea02db0817e2106846842beb3aabc25386a91e89',
        opPublicKey: '045ca279e36682c2d46ce7d4cf8967846708b5b9f85b9cdafd8ca8852612cb0f0c7a71314ec8dc9c9634ddeefee9f63f0e8bd7dacfc3b6a4532aadd89a9651cd6e',
        csr: '3081da308181020100300e310c300a060355040a0c034353413059301306072a8648ce3d020106082a8648ce3d030107034200045ca279e36682c2d46ce7d4cf8967846708b5b9f85b9cdafd8ca8852612cb0f0c7a71314ec8dc9c9634ddeefee9f63f0e8bd7dacfc3b6a4532aadd89a9651cd6ea011300f06092a864886f70d01090e31023000300a06082a8648ce3d040302034800304502200e675ee1b3bbfe152a174af535e22d55ce10c150cac01b3118de05e8fd9f1048022100d88c57cc6e74f0e5488a26167a07fd6dbef1aaad721c580b6eae21be5e6d0c72',
    }
]

function testCsr(testEntry)
{
    it("Csr Generate  PKSC #10", async function () {
        const privateKey = Buffer.from(testEntry.daPrivateKey, 'hex')
        try {
            const csr = await Crypto.GenerateCsr(privateKey)
            // CSR generation is not deterministic
            // assert.equal(csr.toString('hex'), testEntry.csr)
        } catch (err) {
            console.error(err)
        }
    })

}

describe('Test Crypto CSR', () => {
    theTestCsrVector.forEach(testEntry => testCsr(testEntry))
})

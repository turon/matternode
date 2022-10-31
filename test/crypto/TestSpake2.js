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
const spake2js = require('spake2')
const crypto = require('crypto')
const BN = require('bn.js')


describe('Test Crypto Curve P-256', () => {
    it("curve p256 decompress points M and N", async function () {
        const EC = require('elliptic').ec
        const p256 = new EC('p256')
        const ec = p256.curve

        const Mcompressed = '02886e2f97ace46e55ba9dd7242579f2993b64e16ef3dcab95afd497333d8fa12f'
        const Ncompressed = '03d8bbd6c639c62937b04d997f38c3770719c629d7014d49a24b4f98baa1292b49'

        // Decompress points
        const M = ec.decodePoint(Mcompressed, 'hex').encode('hex')
        const N = ec.decodePoint(Ncompressed, 'hex').encode('hex')

        const Mexpect = '04886e2f97ace46e55ba9dd7242579f2993b64e16ef3dcab95afd497333d8fa12f5ff355163e43ce224e0b0e65ff02ac8e5c7be09419c785e0ca547d55a12e2d20'
        const Nexpect = '04d8bbd6c639c62937b04d997f38c3770719c629d7014d49a24b4f98baa1292b4907d60aa6bfade45008a636337f5168c64d9bd36034808cd564490b1e656edbe7'

        assert.equal(M.toString('hex'), Mexpect.toString('hex'));
        assert.equal(N.toString('hex'), Nexpect.toString('hex'));
    });
});

const theTestCryptoPbkdf2Vector = [
    {
        passcode: 34567890,
        salt: "SPAKE2P Key Salt",
        i: 100,
        keyLen: 80,

        A: "",  // identity A
        B: "",  // identity B

        w0s: "4707c94e0fd8e223fb264d87606194ff8acf38b551477e7147132d031d8b8c72d352d5c1dc1db1bf",
        w1s: "7e5facf837347db6b7d8cf6817921b3ab16b7d394f71b321ea132d6d1d9fb6612fda7f34cc53fdaf",
        w0: "0aff2fab0980e98d9d6d33a17ac2f15886cd87f6cdcb34200a072f5f6129f8ad",
        w1: "ef0d4d1d61fdf08cd28ae176d02b1344ebbd38f4df9500a222f51c1924fd56a1",
        L: "04eae21d4b206f567bf357e91df2da29d1a2b75a9e07519cab893b97e29a4bf43d999022374f3b11ecc4a1d725c43f8194d9871381ef8acf4472af453d1389ff71",
        Lcoded: "03eae21d4b206f567bf357e91df2da29d1a2b75a9e07519cab893b97e29a4bf43d",

        X: "0457B3413E28C68046145D6F60B20584CF9AB620D266023466533E4AA8436CD9"+
           "2167120F848E8879F656B6449655DA2CCF03D6148F0F8185DED6EB84F986107014", // pA
        Y: "0476DCC76F6F61CB6CD1CA044F3271A59201A3C5091E8E03AF6767D98FEAD5FC"+
           "11AB0580CE498201FB020DDD626943BF72AD94BCAD00B671E4F9A47A970DF49712", // pB
        cA: "9C2E0A812609D89AD822ECFA8F3B3BCA5275CD6B49D2027848E032F6BAE9F809",  // cA
        cB: "95B0127B272223989EE4FF2550DB74BACA20B88265345EBE77DDFF3BAEB19EAB"   // cB
    },
]

function testCryptoPbkdf2(testEntry) {
    const keyLen = testEntry.keyLen
    var passcode = Buffer.alloc(4)
    passcode.writeUInt32LE(testEntry.passcode, 0)

    var w0sw1s = crypto.pbkdf2Sync(passcode, testEntry.salt, testEntry.i, keyLen, 'sha256');

    it("pbkdf2 w0w1", () => {
        var w0sResult = w0sw1s.subarray(0, keyLen/2)
        var w1sResult = w0sw1s.subarray(keyLen/2, keyLen)
        var w0sExpect = testEntry.w0s
        var w1sExpect = testEntry.w1s

        assert.equal(w0sResult.toString('hex'), w0sExpect.toString('hex'));
        assert.equal(w1sResult.toString('hex'), w1sExpect.toString('hex'));
    });
}

describe('Test Crypto PBKDF2', () => {
    theTestCryptoPbkdf2Vector.forEach(testEntry => testCryptoPbkdf2(testEntry));
});


/**
 * The IETF test vectors do not cover hashing w0 and w1, only calculating L from provided w0 and w1.
 */
const theTestCryptoIetfSpake2Vector = [
    {
        Context: "SPAKE2+-P256-SHA256-HKDF draft-01",
        A: "client",
        B: "server",
        w0: "e6887cf9bdfb7579c69bf47928a84514b5e355ac034863f7ffaf4390e67d798c",
        w1: "24b5ae4abda868ec9336ffc3b78ee31c5755bef1759227ef5372ca139b94e512",
        L: "0495645cfb74df6e58f9748bb83a86620bab7c82e107f57d6870da8cbcb2ff"+
           "9f7063a14b6402c62f99afcb9706a4d1a143273259fe76f1c605a3639745a92154b9",

        x: "8b0f3f383905cf3a3bb955ef8fb62e24849dd349a05ca79aafb18041d30cbdb6",
        X: "04af09987a593d3bac8694b123839422c3cc87e37d6b41c1d630f000dd6498"+
        "0e537ae704bcede04ea3bec9b7475b32fa2ca3b684be14d11645e38ea6609eb39e7e",
        y: "2e0895b0e763d6d5a9564433e64ac3cac74ff897f6c3445247ba1bab40082a91",
        Y: "04417592620aebf9fd203616bbb9f121b730c258b286f890c5f19fea833a9c"+
        "900cbe9057bc549a3e19975be9927f0e7614f08d1f0a108eede5fd7eb5624584a4f4",
        Z: "0471a35282d2026f36bf3ceb38fcf87e3112a4452f46e9f7b47fd769cfb570"+
        "145b62589c76b7aa1eb6080a832e5332c36898426912e29c40ef9e9c742eee82bf30",
        V: "046718981bf15bc4db538fc1f1c1d058cb0eececf1dbe1b1ea08a4e25275d3"+
        "82e82b348c8131d8ed669d169c2e03a858db7cf6ca2853a4071251a39fbe8cfc39bc",
        TT: "21000000000000005350414b45322b2d503235362d5348413235362d484b4"+
        "4462064726166742d30310600000000000000636c69656e740600000000000000736"+
        "572766572410000000000000004886e2f97ace46e55ba9dd7242579f2993b64e16ef"+
        "3dcab95afd497333d8fa12f5ff355163e43ce224e0b0e65ff02ac8e5c7be09419c78"+
        "5e0ca547d55a12e2d20410000000000000004d8bbd6c639c62937b04d997f38c3770"+
        "719c629d7014d49a24b4f98baa1292b4907d60aa6bfade45008a636337f5168c64d9"+
        "bd36034808cd564490b1e656edbe7410000000000000004af09987a593d3bac8694b"+
        "123839422c3cc87e37d6b41c1d630f000dd64980e537ae704bcede04ea3bec9b7475"+
        "b32fa2ca3b684be14d11645e38ea6609eb39e7e410000000000000004417592620ae"+
        "bf9fd203616bbb9f121b730c258b286f890c5f19fea833a9c900cbe9057bc549a3e1"+
        "9975be9927f0e7614f08d1f0a108eede5fd7eb5624584a4f44100000000000000047"+
        "1a35282d2026f36bf3ceb38fcf87e3112a4452f46e9f7b47fd769cfb570145b62589"+
        "c76b7aa1eb6080a832e5332c36898426912e29c40ef9e9c742eee82bf30410000000"+
        "0000000046718981bf15bc4db538fc1f1c1d058cb0eececf1dbe1b1ea08a4e25275d"+
        "382e82b348c8131d8ed669d169c2e03a858db7cf6ca2853a4071251a39fbe8cfc39b"+
        "c2000000000000000e6887cf9bdfb7579c69bf47928a84514b5e355ac034863f7ffa"+
        "f4390e67d798c",
        Ka: "f9cab9adcc0ed8e5a4db11a8505914b2",
        Ke: "801db297654816eb4f02868129b9dc89",
        KcA: "0d248d7d19234f1486b2efba5179c52d",
        KcB: "556291df26d705a2caedd6474dd0079b",
        HMAC_KcA_Y: "d4376f2da9c72226dd151b77c2919071155fc22a2068d90b5faa6c78c11e77dd",
        HMAC_KcB_X: "0660a680663e8c5695956fb22dff298b1d07a526cf3cc591adfecd1f6ef6e02e",
        CMAC_KcA_Y: "ad04419077d806572fd7c8ab6d78656a",
        CMAC_KcB_X: "aa076038a84938018a276e673ee7583e",
    },
    {
        Context: "SPAKE2+-P256-SHA256-HKDF draft-01",
        A: "client",
        B: "",
        w0: "e6887cf9bdfb7579c69bf47928a84514b5e355ac034863f7ffaf4390e67d798c",
        w1: "24b5ae4abda868ec9336ffc3b78ee31c5755bef1759227ef5372ca139b94e512",
        L: "0495645cfb74df6e58f9748bb83a86620bab7c82e107f57d6870da8cbcb2ff"+
        "9f7063a14b6402c62f99afcb9706a4d1a143273259fe76f1c605a3639745a92154b9",

        x: "ec82d9258337f61239c9cd68e8e532a3a6b83d12d2b1ca5d543f44def17dfb8d",
        X: "04230779960824076d3666a7418e4d433e2fa15b06176eabdd572f43a32ecc"+
        "79a192b243d2624310a7356273b86e5fd9bd627d3ade762baeff1a320d4ad7a4e47f",
        y: "eac3f7de4b198d5fe25c443c0cd4963807add767815dd02a6f0133b4bc2c9eb0",
        Y: "044558642e71b616b248c9583bd6d7aa1b3952c6df6a9f7492a06035ca5d92"+
        "522d84443de7aa20a59380fa4de6b7438d925dbfb7f1cfe60d79acf961ee33988c7d",
        Z: "04b4e8770f19f58ddf83f9220c3a9305792665e0c60989e6ee9d7fa449c775"+
        "d6395f6f25f307e3903ac045a013fbb5a676e872a6abfcf4d7bb5aac69efd6140eed",
        V: "04141db83bc7d96f41b636622e7a5c552ad83211ff55319ac25ed0a09f0818"+
        "bd942e8150319bfbfa686183806dc61911183f6a0f5956156023d96e0f93d275bf50",
        TT: "21000000000000005350414b45322b2d503235362d5348413235362d484b4"+
        "4462064726166742d30310600000000000000636c69656e740000000000000000410"+
        "000000000000004886e2f97ace46e55ba9dd7242579f2993b64e16ef3dcab95afd49"+
        "7333d8fa12f5ff355163e43ce224e0b0e65ff02ac8e5c7be09419c785e0ca547d55a"+
        "12e2d20410000000000000004d8bbd6c639c62937b04d997f38c3770719c629d7014"+
        "d49a24b4f98baa1292b4907d60aa6bfade45008a636337f5168c64d9bd36034808cd"+
        "564490b1e656edbe7410000000000000004230779960824076d3666a7418e4d433e2"+
        "fa15b06176eabdd572f43a32ecc79a192b243d2624310a7356273b86e5fd9bd627d3"+
        "ade762baeff1a320d4ad7a4e47f4100000000000000044558642e71b616b248c9583"+
        "bd6d7aa1b3952c6df6a9f7492a06035ca5d92522d84443de7aa20a59380fa4de6b74"+
        "38d925dbfb7f1cfe60d79acf961ee33988c7d410000000000000004b4e8770f19f58"+
        "ddf83f9220c3a9305792665e0c60989e6ee9d7fa449c775d6395f6f25f307e3903ac"+
        "045a013fbb5a676e872a6abfcf4d7bb5aac69efd6140eed410000000000000004141"+
        "db83bc7d96f41b636622e7a5c552ad83211ff55319ac25ed0a09f0818bd942e81503"+
        "19bfbfa686183806dc61911183f6a0f5956156023d96e0f93d275bf5020000000000"+
        "00000e6887cf9bdfb7579c69bf47928a84514b5e355ac034863f7ffaf4390e67d798"+
        "c",
        Ka: "e2cbee3ae19a4dbe9f146be6bee9bfa1",
        Ke: "6989d8f9177ef7df67da437987f07255",
        KcA: "2f9e0bb669d2c22645bce34da04ac16a",
        KcB: "eb7a35168759dd8e9ce44e4dc51277ce",
        HMAC_KcA_Y: "e1b9258807ba4750dae1d7f3c3c294f13dc4fa60cde346d5de7d200e2f8fd3fc",
        HMAC_KcB_X: "b9c39dfa49c47757de778d9bedeaca2448b905be19a43b94ee24b770208135e3",
        CMAC_KcA_Y: "f545e7af21e334de7389ddcf2174e822",
        CMAC_KcB_X: "3fb3055e16b619fd3de0e1b2bd7a9383",
    },
    {
        Context: "SPAKE2+-P256-SHA256-HKDF draft-01",
        A: "",
        B: "server",
        w0: "e6887cf9bdfb7579c69bf47928a84514b5e355ac034863f7ffaf4390e67d798c",
        w1: "24b5ae4abda868ec9336ffc3b78ee31c5755bef1759227ef5372ca139b94e512",
        L: "0495645cfb74df6e58f9748bb83a86620bab7c82e107f57d6870da8cbcb2ff"+
        "9f7063a14b6402c62f99afcb9706a4d1a143273259fe76f1c605a3639745a92154b9",

        x: "ba0f0f5b78ef23fd07868e46aeca63b51fda519a3420501acbe23d53c2918748",
        X: "04c14d28f4370fea20745106cea58bcfb60f2949fa4e131b9aff5ea13fd5aa"+
        "79d507ae1d229e447e000f15eb78a9a32c2b88652e3411642043c1b2b7992cf2d4de",
        y: "39397fbe6db47e9fbd1a263d79f5d0aaa44df26ce755f78e092644b434533a42",
        Y: "04d1bee3120fd87e86fe189cb952dc688823080e62524dd2c08dffe3d22a0a"+
        "8986aa64c9fe0191033cafbc9bcaefc8e2ba8ba860cd127af9efdd7f1c3a41920fe8",
        Z: "04aac71cf4c8df8181b867c9ecbee9d0963caf51f1534a823429c26fe52483"+
        "13ffc5c5e44ea8162161ab6b3d73b87704a45889bf6343d96fa96cd1641efa71607c",
        V: "04c7c9505365f7ce57293c92a37f1bbdc68e0322901e61edef59fee7876b17"+
        "b063e0fa4a126eae0a671b37f1464cf1ccad591c33ae944e3b1f318d76e36fea9966",
        TT: "21000000000000005350414b45322b2d503235362d5348413235362d484b4"+
        "4462064726166742d303100000000000000000600000000000000736572766572410"+
        "000000000000004886e2f97ace46e55ba9dd7242579f2993b64e16ef3dcab95afd49"+
        "7333d8fa12f5ff355163e43ce224e0b0e65ff02ac8e5c7be09419c785e0ca547d55a"+
        "12e2d20410000000000000004d8bbd6c639c62937b04d997f38c3770719c629d7014"+
        "d49a24b4f98baa1292b4907d60aa6bfade45008a636337f5168c64d9bd36034808cd"+
        "564490b1e656edbe7410000000000000004c14d28f4370fea20745106cea58bcfb60"+
        "f2949fa4e131b9aff5ea13fd5aa79d507ae1d229e447e000f15eb78a9a32c2b88652"+
        "e3411642043c1b2b7992cf2d4de410000000000000004d1bee3120fd87e86fe189cb"+
        "952dc688823080e62524dd2c08dffe3d22a0a8986aa64c9fe0191033cafbc9bcaefc"+
        "8e2ba8ba860cd127af9efdd7f1c3a41920fe8410000000000000004aac71cf4c8df8"+
        "181b867c9ecbee9d0963caf51f1534a823429c26fe5248313ffc5c5e44ea8162161a"+
        "b6b3d73b87704a45889bf6343d96fa96cd1641efa71607c410000000000000004c7c"+
        "9505365f7ce57293c92a37f1bbdc68e0322901e61edef59fee7876b17b063e0fa4a1"+
        "26eae0a671b37f1464cf1ccad591c33ae944e3b1f318d76e36fea996620000000000"+
        "00000e6887cf9bdfb7579c69bf47928a84514b5e355ac034863f7ffaf4390e67d798"+
        "c",
        Ka: "ec8d19b807ffb1d1eea81a93ba35cdfe",
        Ke: "2ea40e4badfa5452b5744dc5983e99ba",
        KcA: "66de534d9bf1e44e96a53a4b48d6b353",
        KcB: "4945c38bb476cb0f347f3222be9b64a2",
        HMAC_KcA_Y: "e564c93b3015efb946dc16d642bbe7d1c8da5be164ed9fc3bae4e0ff86e1bd3c",
        HMAC_KcB_X: "072a94d9a54edc201d8891534c2317cadf3ea3792827f479e873f93e90f21552",
        CMAC_KcA_Y: "94aacd28128dc2ce1d7f5684119d553c",
        CMAC_KcB_X: "bc6615eb68af10d329b2acb2d4545d97",   
    },
    {
        Context: "SPAKE2+-P256-SHA256-HKDF draft-01",
        A: "",
        B: "",
        w0: "e6887cf9bdfb7579c69bf47928a84514b5e355ac034863f7ffaf4390e67d798c",
        w1: "24b5ae4abda868ec9336ffc3b78ee31c5755bef1759227ef5372ca139b94e512",
        L: "0495645cfb74df6e58f9748bb83a86620bab7c82e107f57d6870da8cbcb2ff"+
        "9f7063a14b6402c62f99afcb9706a4d1a143273259fe76f1c605a3639745a92154b9",

        x: "5b478619804f4938d361fbba3a20648725222f0a54cc4c876139efe7d9a21786",
        X: "04a6db23d001723fb01fcfc9d08746c3c2a0a3feff8635d29cad2853e73586"+
        "23425cf39712e928054561ba71e2dc11f300f1760e71eb177021a8f85e78689071cd",
        y: "766770dad8c8eecba936823c0aed044b8c3c4f7655e8beec44a15dcbcaf78e5e",
        Y: "04390d29bf185c3abf99f150ae7c13388c82b6be0c07b1b8d90d26853e8437"+
        "4bbdc82becdb978ca3792f472424106a2578012752c11938fcf60a41df75ff7cf947",
        Z: "040a150d9a62f514c9a1fedd782a0240a342721046cefb1111c3adb3be893c"+
        "e9fcd2ffa137922fcf8a588d0f76ba9c55c85da2af3f1c789ca17976810387fb1d7e",
        V: "04f8e247cc263a1846272f5a3b61b68aa60a5a2665d10cd22c89cd6bad05dc"+
        "0e5e650f21ff017186cc92651a4cd7e66ce88f529299f340ea80fb90a9bad094e1a6",
        TT: "21000000000000005350414b45322b2d503235362d5348413235362d484b4"+
        "4462064726166742d303100000000000000000000000000000000410000000000000"+
        "004886e2f97ace46e55ba9dd7242579f2993b64e16ef3dcab95afd497333d8fa12f5"+
        "ff355163e43ce224e0b0e65ff02ac8e5c7be09419c785e0ca547d55a12e2d2041000"+
        "0000000000004d8bbd6c639c62937b04d997f38c3770719c629d7014d49a24b4f98b"+
        "aa1292b4907d60aa6bfade45008a636337f5168c64d9bd36034808cd564490b1e656"+
        "edbe7410000000000000004a6db23d001723fb01fcfc9d08746c3c2a0a3feff8635d"+
        "29cad2853e7358623425cf39712e928054561ba71e2dc11f300f1760e71eb177021a"+
        "8f85e78689071cd410000000000000004390d29bf185c3abf99f150ae7c13388c82b"+
        "6be0c07b1b8d90d26853e84374bbdc82becdb978ca3792f472424106a2578012752c"+
        "11938fcf60a41df75ff7cf9474100000000000000040a150d9a62f514c9a1fedd782"+
        "a0240a342721046cefb1111c3adb3be893ce9fcd2ffa137922fcf8a588d0f76ba9c5"+
        "5c85da2af3f1c789ca17976810387fb1d7e410000000000000004f8e247cc263a184"+
        "6272f5a3b61b68aa60a5a2665d10cd22c89cd6bad05dc0e5e650f21ff017186cc926"+
        "51a4cd7e66ce88f529299f340ea80fb90a9bad094e1a62000000000000000e6887cf"+
        "9bdfb7579c69bf47928a84514b5e355ac034863f7ffaf4390e67d798c",
        Ka: "5929a3ce9822c81401bf0f764f69af08",
        Ke: "ea3276d68334576097e04b19ee5a3a8b",
        KcA: "7f84b939d600117256b0c8a6d40cf181",
        KcB: "f7d7547ced93f681e8df4c258c4516fd",
        HMAC_KcA_Y: "71d9412779b6c45a2c615c9df3f1fd93dc0aaf63104da8ece4aa1b5a3a415fea",
        HMAC_KcB_X: "095dc0400355cc233fde7437811815b3c1524aae80fd4e6810cf531cf11d20e3",
        CMAC_KcA_Y: "d66386ee8033bf56387db3543691064e",
        CMAC_KcB_X: "391070acb88ecc74dfe079cd0b8b52dc",   
    }
]



const spake2 = spake2js.spake2Plus({
    suite: 'P256-SHA256-HKDF-HMAC',
})
  
/**
 * Creates a password verifier of a given password-salt pair for the server to authenticate
 * via the [SPAKE2+ protocol](https://tools.ietf.org/html/draft-irtf-cfrg-spake2-08).
 * 
 * @param {string} password The username of a user.
 * @param {string} salt The salt to use for PBKDF.
 * @returns {Promise<object>} A password verifier for the username-password pair.
 * @property {string} w0 Part of the verifier, encoded in base64.
 * @property {string} L Part of the verifier, encoded in base64.
 */
async function createVerifier (password, salt) {
    const verifier = await spake2.computeVerifier(password, salt, '', '')
    return verifier
}

function testCryptoSpake2(testEntry) {
    it("spake2 createVerifier w0,w1,L,Lcoded", async function () {
        var passcode = Buffer.alloc(4)
        passcode.writeUInt32LE(testEntry.passcode, 0)

        var verifier = await createVerifier(passcode, testEntry.salt)
        var w0sresult = verifier.w0s
        var w0sexpect = testEntry.w0s
        var w1sresult = verifier.w1s
        var w1sexpect = testEntry.w1s
        var w0result = verifier.w0
        var w0expect = testEntry.w0
        var w1result = verifier.w1
        var w1expect = testEntry.w1
        var Lresult = verifier.L
        var Lexpect = testEntry.L
        var LcodedResult = verifier.Lcoded
        var LcodedExpect = testEntry.Lcoded

        assert.equal(w0sresult.toString('hex'), w0sexpect.toString('hex'), "w0s");
        assert.equal(w1sresult.toString('hex'), w1sexpect.toString('hex'), "w1s");
        assert.equal(w0result.toString('hex'), w0expect.toString('hex'), "w0");
        assert.equal(w1result.toString('hex'), w1expect.toString('hex'), "w1");
        assert.equal(Lresult.toString('hex'), Lexpect.toString('hex'), "L");
        assert.equal(LcodedResult.toString('hex'), LcodedExpect.toString('hex'), "Lcoded");
    });
}

describe('Test Crypto SPAKE2+ PBKDF2', () => {
    theTestCryptoPbkdf2Vector.forEach(testEntry => testCryptoSpake2(testEntry));
});


function testCryptoIetfSpake2(testEntry) {
    it("spake2 createVerifierRaw L calc", async function () {
        const w0 = new BN(testEntry.w0, 16)
        const w1 = new BN(testEntry.w1, 16)

        var verifier = await spake2.computeVerifierRaw(w0, w1, testEntry.A, testEntry.B)
        var Lresult = verifier.L
        var Lexpect = testEntry.L

        assert.equal(Lresult.toString('hex'), Lexpect.toString('hex'), "L");
        //console.log("L = "+Lresult.toString('hex'))

        // Use API
        var client = await spake2.startClient(verifier)
        var server = await spake2.startServer(verifier)
        var pA = client.getMessage()
        var pB = server.getMessage()
        var cB = server.finish(pA)
        var cA = client.finish(pB)

        // Always random -- x,y not controlled
        /*
        console.log("pA = "+pA.toString('hex'))
        console.log("pB = "+pB.toString('hex'))
        console.log("cB = "+cB.getConfirmation().toString('hex'))
        console.log("cA = "+cA.getConfirmation().toString('hex'))
        console.log("A's TT = "+cA.transcript.toString('hex'))
        console.log("B's TT = "+cB.transcript.toString('hex'))
        */

        /*
        // Test server with known inputs
        var server = await spake2.startServer(verifier)

        const EC = require('elliptic').ec
        const p256 = new EC('p256')
        const ec = p256.curve
        // Decompress points
        const X = ec.decodePoint(testEntry.X, 'hex').encode('hex')

        //var pA = X
        //var pB = server.getMessage()
        //var cB = server.finish(pA)
        */
    })

    it("spake2 ServerSPAKE2PlusState Y, Z, V, TT", async function () {

        var serverState = spake2js.ServerSPAKE2PlusState.load({
            options: { 
                suite: 'P256-SHA256-HKDF-HMAC', 
                context: testEntry.Context 
            },
            y: testEntry.y, 
            w0: testEntry.w0, 
            L: testEntry.L, 
            clientIdentity: testEntry.A,
            serverIdentity: testEntry.B,
        })

        var pB = serverState.getMessage()
        var Y = serverState.S
        var Yhex = Y.encode('hex').toString('hex')

        var pA = testEntry.X
        var serverSecret = serverState.finish(pA)

        assert.equal(Yhex, testEntry.Y, "Y");
        assert.equal(serverState.V.encode('hex').toString('hex'), testEntry.V, "V");
        assert.equal(serverState.Z.encode('hex').toString('hex'), testEntry.Z, "Z");
        assert.equal(serverState.TT.toString('hex'), testEntry.TT, "TT");

        assert.equal(serverSecret.Ka.toString('hex'), testEntry.Ka, "Ka");
        assert.equal(serverSecret.Ke.toString('hex'), testEntry.Ke, "Ke");
        assert.equal(serverSecret.KcA.toString('hex'), testEntry.KcA, "KcA");
        assert.equal(serverSecret.KcB.toString('hex'), testEntry.KcB, "KcB");

        // cB := CRYPTO_HMAC(KcB,pA)
        const cB = serverState.cipherSuite.mac(Buffer.from(pA,"hex"), serverSecret.KcB).toString('hex')
        assert.equal(cB, testEntry.HMAC_KcB_X, "cB = HMAC(KcB,X)")
    })

    it("spake2 ClientSPAKE2PlusState Y, Z, V, TT", async function () {

        var clientState = spake2js.ClientSPAKE2PlusState.load({
            options: { 
                suite: 'P256-SHA256-HKDF-HMAC',
                context: testEntry.Context
            },
            x: testEntry.x,
            w0: testEntry.w0,
            w1: testEntry.w1,
            clientIdentity: testEntry.A,
            serverIdentity: testEntry.B,
        })

        var pA = clientState.getMessage()
        var X = clientState.T
        var Xhex = X.encode('hex').toString('hex')

        var pB = testEntry.Y
        var clientSecret = clientState.finish(pB)

        assert.equal(Xhex, testEntry.X, "X");
        assert.equal(clientState.V.encode('hex').toString('hex'), testEntry.V, "V");
        assert.equal(clientState.Z.encode('hex').toString('hex'), testEntry.Z, "Z");
        assert.equal(clientState.TT.toString('hex'), testEntry.TT, "TT");

        assert.equal(clientSecret.Ka.toString('hex'), testEntry.Ka, "Ka");
        assert.equal(clientSecret.Ke.toString('hex'), testEntry.Ke, "Ke");
        assert.equal(clientSecret.KcA.toString('hex'), testEntry.KcA, "KcA");
        assert.equal(clientSecret.KcB.toString('hex'), testEntry.KcB, "KcB");

        // cA := CRYPTO_HMAC(KcA,pB)
        const cA = clientState.cipherSuite.mac(Buffer.from(pB,"hex"), clientSecret.KcA).toString('hex')
        assert.equal(cA, testEntry.HMAC_KcA_Y, "cA = HMAC(KcA,Y)")
    })
}

describe('Test Crypto Ietf SPAKE2+', () => {
    theTestCryptoIetfSpake2Vector.forEach(testEntry => testCryptoIetfSpake2(testEntry));
});
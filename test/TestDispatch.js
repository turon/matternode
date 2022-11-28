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

const TestManager = require('./TestManager')

// ======================================
//           TLV Tests
// ======================================
require('./tlv/TestTlvCodec')
require('./tlv/TestTlvJson')
require('./tlv/TestTlvPase')
require('./tlv/TestTlvSchema')

// ======================================
//           Message Tests
// ======================================
require('./message/TestMsgCodec')
require('./message/TestMessage')

// ======================================
//           Crypto Tests
// ======================================
require('./message/TestCryptoContext')
require('./crypto/TestCryptoAes')
require('./crypto/TestSpake2')
require('./crypto/TestSignatureEcdsa')
require('./crypto/TestHash')
require('./crypto/TestHmac')
require('./crypto/TestKdf')
require('./crypto/TestCompressedFabricId')
require('./crypto/TestGroupKey')
require('./crypto/TestCsr')
require('./crypto/TestCertificate')
require('./crypto/TestCertificateTlv')

// ======================================
//       Expect Framework Tests
// ======================================
require('./expect/TestAsyncQueue')
require('./expect/TestExpectProcess')
require('./expect/TestExpectNode')

// ======================================
//            Shell Tests
// ======================================
require('./shell/TestShellConfig')
require('./shell/TestShellLog')
require('./shell/TestShellTlv')
require('./shell/TestShellMdns')
require('./shell/TestShellMsg')
require('./shell/TestShellPase')
//require('./shell/TestShellMisc')

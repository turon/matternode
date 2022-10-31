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

const Const = require("../../Const")

class SessionProtocolConst 
{
    static PROTOCOL_ID = Const.Protocols.SECURE_CHANNEL // 0x0000

    static Command = {
        MsgCounterSyncReq:  0x00,
        MsgCounterSyncRsp:  0x01,
        MrpStandaloneAck:   0x10,
        StatusReport:       0x40,
    }

    static PaseCommand = {
        ParamRequest:   0x20,
        ParamResponse:  0x21,
        Pake1:          0x22,
        Pake2:          0x23,
        Pake3:          0x24,
        PakeError:      0x2F,
    }

    static CaseCommand = {
        Sigma1:         0x30,
        Sigma2:         0x31,
        Sigma3:         0x32,
        Sigma2_Resume:  0x33,
    }


    static ProtocolStatusReport = {
        SESSION_ESTABLISHMENT_SUCCESS:  0x0000,
        NO_SHARED_TRUST_ROOTS:          0x0001,
        INVALID_PARAMETER:              0x0002,
        CLOSE_SESSION:                  0x0003,
        BUSY:                           0x0004,
        SESSION_NOT_FOUND:              0x0005
    }
}

module.exports = SessionProtocolConst
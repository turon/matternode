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

const SRC = '../../'

const logger = require(SRC+'util/Logger')

const Message = require(SRC+'message/Message')
const { TlvReader } = require(SRC+'tlv/TlvReader')
const { TlvWriter } = require(SRC+'tlv/TlvWriter')

const ImConst = require('./ImConst')
const AttributePath = require('./AttributePath')

const Endpoints = require('../../../zzz_generated/Endpoints.json')


class ImSubscribeMixin
{
    onSubscribeRequest(msg) {
        logger.debug("IM: onSubscribeRequest")
    }

    onSubscribeResponse(msg) {
        logger.debug("IM: onSubscribeResponse")
    }
}

module.exports = ImSubscribeMixin
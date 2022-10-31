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

const pino = require('pino')
const pretty = require('pino-pretty')
var logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
  },
  pretty({
    colorize: true,
    translateTime: true,      // Use UTC format
    ignore: 'pid,hostname',   // Display only timestamp, level and message
}))

module.exports = logger
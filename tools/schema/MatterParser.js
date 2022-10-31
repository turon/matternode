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

const {get_parser} = require('./matter_grammar.js')

let transformer = {
    integer: ([n])  => parseInt(n.value),
    string: ([s])  => s.value.slice(1, -1),
    array:  Array.from,
    pair:   Array.from,
    object: Object.fromEntries,

    null: () => null,
    true: () => true,
    false: () => false,
}

const MatterParser = get_parser({transformer})


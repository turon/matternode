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

import { TlvObject, TlvField, TlvUInt16, TlvBoolean, TlvString } from '@project-chip/matter.js'
import { strict as assert } from 'assert'

var theTestTlvVector = [
    {
        name: "TlvObject: TlvUInt16 and TlvBoolean fields",
        schema: TlvObject({
            field2: TlvField(2, TlvUInt16),
            field3: TlvField(3, TlvUInt16),
            field4: TlvField(4, TlvBoolean),
        }),
        tlv: "15240201240300280418",
        jsObj: { field2: 1, field3: 0, field4: false },
    },
    {
        name: "TlvObject: TlvString field",
        schema: TlvObject({
            field1: TlvField(1, TlvString),
        }),
        tlv: "152c010568656c6c6f18",
        jsObj: { field1: "hello" },
    },
]

function testTlvSchemaEncode(testEntry)
{
    const { name, schema, tlv, jsObj } = testEntry
    const testName = "TlvSchema.encode " + name

    it(testName, () => {
        const tlvBuffer = schema.encode(jsObj)
        const tlvHex = Buffer.from(tlvBuffer).toString("hex")
        assert.equal(tlvHex, tlv)
    })

}

function testTlvSchemaDecode(testEntry)
{
    const { name, schema, tlv, jsObj } = testEntry
    const testName = "TlvSchema.decode " + name

    it(testName, () => {
        const tlvBuffer = Buffer.from(tlv, "hex")
        const decoded = schema.decode(tlvBuffer)
        assert.deepEqual(decoded, jsObj)
    })
}

describe("Test TlvSchema", () => {
    theTestTlvVector.forEach(testEntry => {
        testTlvSchemaEncode(testEntry)
        testTlvSchemaDecode(testEntry)
    })
})

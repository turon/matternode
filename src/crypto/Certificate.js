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

const SRC = '../'

const logger = require(SRC+'util/Logger')

const x509 = require('@peculiar/x509')
const webcrypto = require('@peculiar/webcrypto')
const webcryptoProvider = new webcrypto.Crypto()
const SubtleCrypto = webcryptoProvider.subtle
x509.cryptoProvider.set(webcryptoProvider)

/**
 * Certificate
 */
class Certificate
{
    static Algorithm = {
        name: "ECDSA",
        hash: "SHA-256",
        namedCurve: "P-256",
    }

    static get WebCrypto() {
        return webcryptoProvider
    }

    static epochSec(tSec) {
        //const epoch = new Date('2000-01-00T00:00:00Z')
        const epoch = new Date(Date.UTC(2000)) 
        const epochMs = epoch.getTime()
        const timeMs = tSec*1000
        return new Date(epochMs + timeMs)
    }

    static DerToPem(der) {
        var prefix = "-----BEGIN CERTIFICATE-----\n"
        var postfix = "-----END CERTIFICATE-----"
        logger.trace("der", der.toString('hex'))
        var b64encoded = der.toString('base64')
        var pemText = prefix + b64encoded.match(/.{0,64}/g).join("\n") + postfix
        return pemText
    }

    static async GenerateKeyPair() {
        const caKeys = await SubtleCrypto.generateKey(
            Certificate.Algorithm,
            true,   // extractable? 
            [ "sign", "verify"]
        )
        return caKeys
    }

    static async GeneratePAA(caKeys, 
                             entityName="CN=Matter Test PAA",
                             lifetime = 10)
    {
        const year = 24 * 60 * 60 * 1000 * 365
        var notBefore = new Date()
        var notAfter = new Date(notBefore.getTime() + lifetime * year)
        const caCert = await x509.X509CertificateGenerator.createSelfSigned(
            {
                version: 2,
                serialNumber: "01",
                keys: caKeys,
                name: entityName,
                notBefore: notBefore,
                notAfter: notAfter,
                signingAlgorithm: Certificate.Algorithm
            },
            webcryptoProvider
        )
        return caCert
    }


    static async GeneratePAI(leafKeys, caCert, caKeys, 
                             entityName="CN=Matter Test PAI", 
                             lifetime = 10)
    {
        const year = 24 * 60 * 60 * 1000 * 365
        var notBefore = new Date()
        var notAfter = new Date(notBefore.getTime() + lifetime * year)
        const leafCert = await x509.X509CertificateGenerator.create(
            {
              subject: entityName,
              issuer: caCert.subject,
              signingKey: caKeys.privateKey,
              publicKey: leafKeys.publicKey,
              notBefore: notBefore,
              notAfter: notAfter,
              serialNumber: "02",
              signingAlgorithm: Certificate.Algorithm
            },
            webcryptoProvider
          )
        return leafCert
    }

    static async GenerateDAC(leafKeys, caCert, caKeys, 
                             entityName="CN=Matter Test DAC",
                             lifetime = 10)
    {
        const year = 24 * 60 * 60 * 1000 * 365
        var notBefore = new Date()
        var notAfter = new Date(notBefore.getTime() +  lifetime * year)
        const leafCert = await x509.X509CertificateGenerator.create(
            {
              subject: entityName,
              issuer: caCert.subject,
              signingKey: caKeys.privateKey,
              publicKey: leafKeys.publicKey,
              notBefore: notBefore,
              notAfter: notAfter,
              serialNumber: "02",
              signingAlgorithm: Certificate.Algorithm
            },
            webcryptoProvider
          )
        return leafCert
    }

    /**
     * Load the given PEM as an X509Certificate
     * @param {string} pem 
     * @returns {x509.X509Certificate}
     */
    static fromPem(pem) {
        return new x509.X509Certificate(pem)
    }
}

module.exports = Certificate
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
const Certificate = require(SRC+'crypto/Certificate')
const { TlvReader } = require(SRC+'tlv/TlvReader')
const { TlvParser } = require(SRC+'tlv/TlvParser')
const { TlvType } = require(SRC+'tlv/TlvType')

const webcrypto = require('@peculiar/webcrypto')
const webcryptoProvider = new webcrypto.Crypto()
const SubtleCrypto = webcryptoProvider.subtle

const asn1X509 = require("@peculiar/asn1-x509")
const x509 = require('@peculiar/x509')
x509.cryptoProvider.set(webcryptoProvider)


/**
 * CertificateTlv
 * 
 */
class CertificateTlv
{
    constructor(tlv) {
        this._tlv = tlv
    }

    get Tlv() { return this._tlv }
    get Certificate() { return this._cert }

    static MapTagStructure = new Map([
        [1, 'SerialNumber'],
        [2, 'SignatureAlgorithm'],
        [3, 'Issuer'],
        [4, 'NotBefore'],
        [5, 'NotAfter'],
        [6, 'Subject'],
        [7, 'PublicKeyAlgorithm'],
        [8, 'EllipticCurveId'],
        [9, 'PublicKey'],
        [10, 'Extensions'],
        [11, 'Signature'],
    ])

    static MapTagExtensions = new Map([
        [1, 'BasicConstraints'],
        [2, 'KeyUsage'],
        [3, 'ExtendedKeyUsage'],
        [4, 'SubjectKeyId'],
        [5, 'AuthorityKeyId'],
        [6, 'FutureExtension'],
    ])

    static MapTagBasicConstraints = new Map([
        [1, 'IsCa'],
        [2, 'PathLength'],
    ])

    static MapTagDn = new Map([
        [1, 'CommonName'],
        [2, 'Surname'],
        [3, 'SerialNumber'],
        [4, 'CountryName'],
        [5, 'LocalityName'],
        [6, 'StateOrProvinceName'],
        [7, 'OrgName'],
        [8, 'OrgUnitName'],
        [9, 'Title'],
        [10, 'Name'],
        [11, 'GivenName'],
        [12, 'Initials'],
        [13, 'GenQualifier'],
        [14, 'DnQualifier'],
        [15, 'Pseudonym'],
        [16, 'DomainComponent'],
        [17, 'NodeId'],
        [18, 'FirmwareSigningId'],
        [19, 'IcacId'],
        [20, 'RcacId'],
        [21, 'FabricId'],
        [22, 'NocCat'],
    ])

    static MapTagDnToOid = {
        'NodeId':            '1.3.6.1.4.1.37244.1.1',    ///< [17] matter-node-id
        'FirmwareSigningId': '1.3.6.1.4.1.37244.1.2',    ///< [18] matter-firmware-signing-id
        'IcacId':            '1.3.6.1.4.1.37244.1.3',    ///< [19] matter-icac-id
        'RcacId':            '1.3.6.1.4.1.37244.1.4',    ///< [20] matter-rcac-id
        'FabricId':          '1.3.6.1.4.1.37244.1.5',    ///< [21] matter-fabric-id
        'NocCat':            '1.3.6.1.4.1.37244.1.6',    ///< [22] matter-noc-cat
    }

    static MapTagExtendedKeyUsage = {
        1:            '1.3.6.1.5.5.7.3.1',    ///< serverAuth
        2:            '1.3.6.1.5.5.7.3.2',    ///< clientAuth
        3:            '1.3.6.1.5.5.7.3.3',    ///< codeSigning
        4:            '1.3.6.1.5.5.7.3.4',    ///< emailProtection
        5:            '1.3.6.1.5.5.7.3.5',    ///< timeStamping
        6:            '1.3.6.1.5.5.7.3.6',    ///< ocspSigning
    }

    /**
     * Parse given TLV certificate and generate corresponding ASN1 certificate.
     * @see SDK C++ reference implementation -- `DecodeConvertCert`
     * https://github.com/project-chip/connectedhomeip/blob/master/src/credentials/CHIPCertToX509.cpp
     */
    async decode()
    {
        var reader = new TlvReader()
        var tlv = reader.decode(this._tlv).Json
        var fields = tlv[0].value
        TlvParser.mapFields(fields, CertificateTlv.MapTagStructure)

        //logger.trace('CertificateTlv.decode: '+JSON.stringify(tlv, null, 2))

        var serialNumber = TlvParser.get(fields, 'SerialNumber')
        //var serialNumberHex = serialNumber.toString(16).toUpperCase()
        var signatureAlgorithm = TlvParser.get(fields, 'SignatureAlgorithm')

        // @see x509.Name example at https://github.com/PeculiarVentures/x509/blob/master/src/name.ts#L97
        var subject = TlvParser.get(fields, 'Subject')
        TlvParser.mapFields(subject, CertificateTlv.MapTagDn)

        // TODO: iterate over MapTagDnToOid keys and build subjectJsonName with mapping Oid to Values

        var nodeId = TlvParser.get(subject, 'NodeId')
        var nodeIdHex = nodeId.toString(16).toUpperCase()
        var fabricId = TlvParser.get(subject, 'FabricId')
        var fabricIdHex = fabricId.toString(16).toUpperCase()
        const subjectJsonName = [
            { '1.3.6.1.4.1.37244.1.1': [{utf8String: nodeIdHex}] },
            { '1.3.6.1.4.1.37244.1.5': [{utf8String: fabricIdHex}] },
        ]
        //var subjectStr = "NodeId="+nodeIdHex
        //subjectStr += ", FabricId="+fabricIdHex
        //var subjectAsnName = new x509.Name(subjectStr.toString('utf-8'), CertificateTlv.MapTagDnToOid)

        var issuer = TlvParser.get(fields, 'Issuer')
        TlvParser.mapFields(issuer, CertificateTlv.MapTagDn)
        var icacId = TlvParser.get(issuer, 'IcacId')
        var icacIdHex = icacId.toString(16).toUpperCase()
        const issuerJsonName = [
            { '1.3.6.1.4.1.37244.1.3': [{utf8String: icacIdHex}] },
        ]
        //var issuerStr = "IcacId="+icacIdHex
        //var issuerAsnName = new x509.Name(issuerStr.toString('utf-8'), CertificateTlv.MapTagDnToOid)

        var notAfter = TlvParser.get(fields, 'NotAfter')
        var notBefore = TlvParser.get(fields, 'NotBefore')
        var signature = TlvParser.get(fields, 'Signature')
        var publicKeyRaw = TlvParser.get(fields, 'PublicKey')
        var publicKeyAlgorithm = TlvParser.get(fields, 'PublicKeyAlgorithm')
        var ellipticCurveId = TlvParser.get(fields, 'EllipticCurveId')
        var extensions = TlvParser.get(fields, 'Extensions')

        // Verify signatureAlgorithm is 1 as expected.
        if (signatureAlgorithm !== 1) {
            throw(`ERROR: SignatureAlgorithm is not 1`)
        }

        var extensions = this.decodeExtensions(fields)

        // Public Key
        var extractable = true
        var publicKey = await SubtleCrypto.importKey(
            "raw",
            publicKeyRaw,
            Certificate.Algorithm,
            extractable,
            ["verify"] 
        )
        var publicKeySpki = await SubtleCrypto.exportKey('spki', publicKey)

        const cert = await x509.X509CertificateGenerator.create ({
            version: asn1X509.Version.v3,
            serialNumber: serialNumber.toString('hex'),
            subject: subjectJsonName,
            issuer: issuerJsonName,
            notBefore: Certificate.epochSec(notBefore), // new Date(epoch).setSeconds(notBefore),
            notAfter: Certificate.epochSec(notAfter), //new Date(epoch).setSeconds(notAfter),
            signingAlgorithm: Certificate.Algorithm,
            extensions: extensions,
            publicKey: publicKey,
            signature: signature,
        })

        this._cert = cert
        return cert
    }

    /**
     * Given the top-level, pre-mapped fields TLV, parse the Extensions tag field, 
     * and generate an array of x509 extensions fields. 
     * @param {Array<TlvType.DeterministicJson>} fieldsTlv 
     * @returns {Array<x509.Extension>}
     */
     decodeExtensions(fieldsTlv) {
        var extensionsTlv = TlvParser.get(fieldsTlv, 'Extensions')
        TlvParser.mapFields(extensionsTlv, CertificateTlv.MapTagExtensions)

        var basicConstraints = TlvParser.get(extensionsTlv, 'BasicConstraints')
        TlvParser.mapFields(basicConstraints, CertificateTlv.MapTagBasicConstraints)
        var basicConstraintsIsCa = TlvParser.get(basicConstraints, 'IsCa')
        var basicConstraintsPathLength = TlvParser.get(basicConstraints, 'PathLength')

        var keyUsage = TlvParser.get(extensionsTlv, 'KeyUsage')      
        var extendedKeyUsage = TlvParser.get(extensionsTlv, 'ExtendedKeyUsage')
        var extendedKeyUsageArray = Object.keys(extendedKeyUsage).map((k) => {
            return CertificateTlv.MapTagExtendedKeyUsage[extendedKeyUsage[k].value]
        })
        var subjectKeyId = TlvParser.get(extensionsTlv, 'SubjectKeyId')
        var authorityKeyId = TlvParser.get(extensionsTlv, 'AuthorityKeyId')

        // Extensions
        const isCritical = true
        var extensions = [
            new x509.BasicConstraintsExtension(basicConstraintsIsCa, basicConstraintsPathLength, isCritical),
            new x509.KeyUsagesExtension(keyUsage, isCritical),
            new x509.ExtendedKeyUsageExtension(extendedKeyUsageArray, isCritical),
            new x509.SubjectKeyIdentifierExtension(subjectKeyId.toString('hex')),
            new x509.AuthorityKeyIdentifierExtension(authorityKeyId.toString('hex')),
        ]

        return extensions
    }
}

module.exports = CertificateTlv
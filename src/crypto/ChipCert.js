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

class ChipCert
{
    // As per specifications (6.3.5. Node Operational Credentials Certificates)
    static kMaxCHIPCertLength = 400
    static kMaxDERCertLength  = 600

    /// Data Element Tags for the CHIP Certificate
    static TlvTagStructure = {
        // ---- Context-specific Tags for ChipCertificate Structure ----
        SerialNumber: 1,        ///< [ byte string ] Certificate serial number, in BER integer encoding.
        SignatureAlgorithm: 2,  ///< [ unsigned int ] Enumerated value identifying the certificate signature algorithm.
        Issuer: 3,              ///< [ list ] The issuer distinguished name of the certificate.
        NotBefore: 4,           ///< [ unsigned int ] Certificate validity period start (certificate date format).
        NotAfter: 5,            ///< [ unsigned int ] Certificate validity period end (certificate date format).
        Subject: 6,             ///< [ list ] The subject distinguished name of the certificate.
        PublicKeyAlgorithm: 7,  ///< [ unsigned int ] Identifies the algorithm with which the public key can be used.
        EllipticCurveId: 8,     ///< [ unsigned int ] For EC certs, identifies the elliptic curve used.
        PublicKey: 9,           ///< [ byte string ] The elliptic curve public key, in X9.62 encoded format.
        Extensions: 10,         ///< [ list ] Certificate extensions.
        Signature: 11,          ///< [ byte string ] The ECDSA signature for the certificate.
    }

    static TlvTagExtensions = {
        // ---- Context-specific Tags for certificate extensions ----
        BasicConstraints: 1,    ///< [ structure ] Identifies whether the subject of the certificate is a CA.
        KeyUsage: 2,            ///< [ unsigned int ] Bits identifying key usage, per RFC5280.
        ExtendedKeyUsage: 3,    ///< [ array ] Enumerated values giving the purposes for which the public key can be used.
        SubjectKeyId: 4,        ///< [ byte string ] Identifier of the certificate's public key.
        AuthorityKeyId: 5,      ///< [ byte string ] Identifier of the public key used to sign the certificate.
        FutureExtension: 6,     ///< [ byte string ] Arbitrary extension. DER encoded SEQUENCE as in X.509 form.
    }

    static TlvTagDn = {
            // Standard and Matter-specific DN attributes.
            // Of these, all are encoded as UTF8String except domain-component,
            // which is encoded as IA5String in X.509 form.
            CommonName: 1,
            Surname: 2,
            SerialNumber: 3,
            CountryName: 4,
            LocalityName: 5,
            StateOrProvinceName: 6,
            OrgName: 7,
            OrgUnitName: 8,
            Title: 9,
            Name: 10,
            GivenName: 11,
            Initials: 12,
            GenQualifier: 13,
            DnQualifier: 14,
            Pseudonym: 15,
            DomainComponent: 16,
            MatterNodeId: 17,
            MatterFirmwareSigningId: 18,
            MatterIcacId: 19,
            MatterRcacId: 20,
            MatterFabricId: 21,
            MatterNocCat: 22,
            
            // Standard DN attributes when encoded as PrintableString in X.509 form
            // NOTE: The tags for these SHALL be the base tags + 0x80.
            CommonNamePs: 129,
            SurnamePs: 130,
            SerialNumPs: 131,
            CountryNamePs: 132,
            LocalityNamePs: 133,
            StateOrProvinceNamePs: 134,
            OrgNamePs: 135,
            OrgUnitNamePs:136,
            TitlePs: 137,
            NamePs: 138,
            GivenNamePs: 139,
            InitialsPs: 140,
            GenQualifierPs: 141,
            DnQualifierPs: 143,
            PseudonymOs: 144,
    }

    static TlvTagBasicConstraints = {
    // ---- Context-specific Tags for BasicConstraints Structure ----
        kTag_BasicConstraints_IsCA: 1,              ///< [ boolean ] True if the certificate can be used to verify certificate signatures.
        kTag_BasicConstraints_PathLenConstraint: 2, ///< [ unsigned int ] Maximum number of subordinate intermediate certificates.
    }

/** Identifies the purpose or application of certificate
 *
 * A certificate type is a label that describes a certificate's purpose or application.
 * Certificate types are not carried as attributes of the corresponding certificates, but
 * rather are derived from the certificate's structure and/or the context in which it is used.
 * The certificate type enumeration includes a set of pre-defined values describing commonly
 * used certificate applications.
 *
 * Certificate types are primarily used in the implementation of access control policies,
 * where access to application features is influenced by the type of certificate presented
 * by a requester.
 *
 * @note Cert type is an API data type only; it should never be sent over-the-wire.
 */
    static CertType =
    {
        kCertType_NotSpecified: 0x00, ///< The certificate's type has not been specified. */
        kCertType_Root: 0x01, ///< A CHIP Root certificate. */
        kCertType_ICA : 0x02, ///< A CHIP Intermediate CA certificate. */
        kCertType_Node : 0x03, ///< A CHIP node certificate. */
        kCertType_FirmwareSigning: 0x04, /**< A CHIP firmware signing certificate. Note that CHIP doesn't
                                           specify how firmware images are signed and implementation of
                                           firmware image signing is manufacturer-specific. The CHIP
                                           certificate format supports encoding of firmware signing
                                           certificates if chosen by the manufacturer to use them. */
    };

/** X.509 Certificate Key Purpose Flags
 *
 *    The flags order must match the enumeration order of corresponding kOID_KeyPurpose values.
 */
static KeyPurposeFlags =
{
    kServerAuth: 0x01, ///< Extended key usage is server authentication.
    kClientAuth: 0x02, ///< Extended key usage is client authentication.
    kCodeSigning: 0x04, ///< Extended key usage is code signing.
    kEmailProtection: 0x08, ///< Extended key usage is email protection.
    kTimeStamping: 0x10, ///< Extended key usage is time stamping.
    kOCSPSigning: 0x20, ///< Extended key usage is OCSP signing.
};

/** X.509 Certificate Key Usage Flags
 */
static KeyUsageFlags =
{
    kDigitalSignature: 0x0001, ///< Key usage is digital signature.
    kNonRepudiation: 0x0002, ///< Key usage is non-repudiation.
    kKeyEncipherment: 0x0004, ///< Key usage is key encipherment.
    kDataEncipherment: 0x0008, ///< Key usage is data encipherment.
    kKeyAgreement: 0x0010, ///< Key usage is key agreement.
    kKeyCertSign: 0x0020, ///< Key usage is key cert signing. 
    kCRLSign: 0x0040, ///< Key usage is CRL signing.
    kEncipherOnly: 0x0080, ///< Key usage is encipher only.
    kDecipherOnly: 0x0100, ///< Key usage is decipher only.
};

/** CHIP Certificate Flags
 *
 * Contains information about a certificate that has been loaded into a ChipCertificateData object.
 */
static CertFlags =
{
    kExtPresent_BasicConstraints: 0x0001, ///< Basic constraints extension is present in the certificate.
    kExtPresent_KeyUsage: 0x0002, ///< Key usage extension is present in the certificate.
    kExtPresent_ExtendedKeyUsage: 0x0004, ///< Extended key usage extension is present in the certificate.
    kExtPresent_SubjectKeyId: 0x0008, ///< Subject key identifier extension is present in the certificate.
    kExtPresent_AuthKeyId: 0x0010, ///< Authority key identifier extension is present in the certificate.
    kExtPresent_FutureIsCritical: 0x0020, ///< Future extension marked as critical is present in the certificate.
    kPathLenConstraintPresent: 0x0040, ///< Path length constraint is present in the certificate.
    kIsCA: 0x0080, ///< Indicates that certificate is a CA certificate.
    kIsTrustAnchor: 0x0100, ///< Indicates that certificate is a trust anchor.
    kTBSHashPresent: 0x0200, ///< Indicates that TBS hash of the certificate was generated and stored.
};

/** CHIP Certificate Decode Flags
 *
 * Contains information specifying how a certificate should be decoded.
 */
static CertDecodeFlags =
{
    kGenerateTBSHash: 0x01, /**< Indicates that to-be-signed (TBS) hash of the certificate should be calculated when certificate is
                                loaded. The TBS hash is then used to validate certificate signature. Normally, all certificates
                                (except trust anchor) in the certificate validation chain require TBS hash. */
    kIsTrustAnchor: 0x02,   ///< Indicates that the corresponding certificate is trust anchor.
};

    static  kNullCertTime = 0
}

module.exports = ChipCert
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

class CaseSession {
  #secret

  /**
   * CASE Session Key KDF
   * 
   * byte RSEKeys_Info[] = "SessionResumptionKeys" =
   *      { 0x53, 0x65, 0x73, 0x73, 0x69, 0x6f, 0x6e, 0x52,
   *        0x65, 0x73, 0x75, 0x6d, 0x70, 0x74, 0x69, 0x6f,
   *        0x6e, 0x4b, 0x65, 0x79, 0x73 }
   *
   * I2RKey || R2IKey || AttestationChallenge = Crypto_KDF(
   *      inputKey = SharedSecret,
   *      salt = Sigma1.initiatorRandom || ResumptionID,
   *      info = RSEKeys_Info,
   *      len = 3 * CRYPTO_SYMMETRIC_KEY_LENGTH_BITS
   * )
   *
   * @param {*} keyPair 
   * @param {*} remotePublicKey 
   * @param {*} salt 
   * @param {*} isResumption 
   * @param {*} role 
   */
  initCaseSession(session, remotePublicKey, isResumption, role)
  {
      var secret = this.#secret
      var salt = Buffer.alloc(0)
      var info = Buffer.from("SessionResumptionKeys", "utf8")
      session.initFromSecret(secret, salt, info)
  }

  /**
   * CASE Resumption Key KDF
   * 
   * byte RSEKeys_Info[] = "SessionResumptionKeys" =
   * {0x53, 0x65, 0x73, 0x73, 0x69, 0x6f, 0x6e, 0x52,
   *  0x65, 0x73, 0x75, 0x6d, 0x70, 0x74, 0x69, 0x6f,
   *  0x6e, 0x4b, 0x65, 0x79, 0x73}
   *
   * I2RKey || R2IKey || AttestationChallenge = Crypto_KDF(
   *    inputKey = SharedSecret,
   *    salt = Sigma1.initiatorRandom || ResumptionID,
   *    info = RSEKeys_Info,
   *    len = 3 * CRYPTO_SYMMETRIC_KEY_LENGTH_BITS
   * )
   *
   * @param {*} keyPair 
   * @param {*} remotePublicKey 
   * @param {*} salt 
   * @param {*} isResumption 
   * @param {*} role 
   */
  resumeCaseSession(session, remotePublicKey, isResumption, role)
  {
      var secret = this.#secret
      var salt = Buffer.alloc(0)
      var info = Buffer.from("SessionResumptionKeys", "utf8")
      session.initFromSecret(secret, salt, info)
  }
}
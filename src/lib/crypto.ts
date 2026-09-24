/**
 * EmojLock Cryptography Engine
 *
 * Implements 100% client-side zero-knowledge encryption with universal support:
 * - Native Web Crypto API (PBKDF2-SHA-256 + AES-256-GCM) in Secure Contexts (HTTPS/localhost)
 * - Audited Pure-JS Cryptography Fallback (@noble/ciphers + @noble/hashes) in Insecure Contexts (HTTP IP previews)
 * - PBKDF2-SHA-256 key derivation with 100,000 iterations
 * - AES-256-GCM authenticated encryption (256-bit key, 96-bit IV, 128-bit authentication tag)
 * - Cryptographically secure random salt & IV generation
 */

import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/hashes/utils.js';

export const PBKDF2_ITERATIONS = 100000;
export const KEY_LENGTH_BITS = 256;
export const DEFAULT_NO_PASSWORD_DOMAIN_KEY = "EmojLock::DefaultDomainKey::v1";

export type EmojLockKey = CryptoKey | Uint8Array;

/**
 * Checks if the Web Crypto subtle API is available in the current context.
 */
function hasWebCryptoSubtle(): boolean {
  return typeof globalThis !== 'undefined' &&
    Boolean(globalThis.crypto && globalThis.crypto.subtle && typeof globalThis.crypto.subtle.importKey === 'function');
}

/**
 * Generates cryptographically secure random bytes of specified length.
 */
export function getRandomBytes(length: number): Uint8Array {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }
  return randomBytes(length);
}

/**
 * Derives a 256-bit AES-GCM Key from a user password or default domain key using PBKDF2-SHA-256.
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<EmojLockKey> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password || DEFAULT_NO_PASSWORD_DOMAIN_KEY);

  if (hasWebCryptoSubtle()) {
    try {
      const passwordKeyMaterial = await globalThis.crypto.subtle.importKey(
        'raw',
        passwordBytes,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      return await globalThis.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt as BufferSource,
          iterations,
          hash: 'SHA-256'
        },
        passwordKeyMaterial,
        { name: 'AES-GCM', length: KEY_LENGTH_BITS },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      console.warn('WebCrypto deriveKey failed, falling back to noble crypto engine:', e);
    }
  }

  // Fallback: Pure JS audited PBKDF2-SHA-256 derivation
  return pbkdf2(sha256, passwordBytes, salt, { c: iterations, dkLen: 32 });
}

/**
 * Encrypts plaintext bytes using AES-256-GCM.
 * Returns the raw ciphertext with the 16-byte authentication tag appended.
 */
export async function encryptBytes(
  plaintextBytes: Uint8Array,
  key: EmojLockKey,
  iv: Uint8Array,
  additionalData?: Uint8Array
): Promise<Uint8Array> {
  if (key instanceof Uint8Array) {
    const cipher = gcm(key, iv, additionalData);
    return cipher.encrypt(plaintextBytes);
  }

  if (hasWebCryptoSubtle()) {
    const params: AesGcmParams = {
      name: 'AES-GCM',
      iv: iv as BufferSource,
      tagLength: 128
    };

    if (additionalData && additionalData.length > 0) {
      params.additionalData = additionalData as BufferSource;
    }

    const ciphertextBuffer = await globalThis.crypto.subtle.encrypt(
      params,
      key,
      plaintextBytes as BufferSource
    );

    return new Uint8Array(ciphertextBuffer);
  }

  throw new Error('No cryptographic encryption engine available.');
}

/**
 * Decrypts AES-256-GCM ciphertext bytes.
 * Throws a cryptographic exception if authentication tag fails or key/IV is incorrect.
 */
export async function decryptBytes(
  ciphertextBytes: Uint8Array,
  key: EmojLockKey,
  iv: Uint8Array,
  additionalData?: Uint8Array
): Promise<Uint8Array> {
  if (key instanceof Uint8Array) {
    const cipher = gcm(key, iv, additionalData);
    return cipher.decrypt(ciphertextBytes);
  }

  if (hasWebCryptoSubtle()) {
    const params: AesGcmParams = {
      name: 'AES-GCM',
      iv: iv as BufferSource,
      tagLength: 128
    };

    if (additionalData && additionalData.length > 0) {
      params.additionalData = additionalData as BufferSource;
    }

    const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
      params,
      key,
      ciphertextBytes as BufferSource
    );

    return new Uint8Array(decryptedBuffer);
  }

  throw new Error('No cryptographic decryption engine available.');
}

/**
 * Computes a SHA-256 digest of arbitrary bytes.
 */
export async function sha256Digest(data: Uint8Array): Promise<Uint8Array> {
  if (hasWebCryptoSubtle()) {
    try {
      const digestBuffer = await globalThis.crypto.subtle.digest('SHA-256', data as BufferSource);
      return new Uint8Array(digestBuffer);
    } catch {
      // Fallback below
    }
  }

  return sha256(data);
}

/**
 * EmojLock Secret Fingerprint Generator
 *
 * Computes a cryptographically robust SHA-256 digest of the payload
 * and formats the initial bytes into a readable fingerprint (e.g. 7F-A2-91-C4).
 */

import { sha256Digest } from './crypto';

/**
 * Computes a formatted fingerprint (e.g., "7F-A2-91-C4") from binary bytes.
 */
export async function generateFingerprintFromBytes(payloadBytes: Uint8Array): Promise<string> {
  const hash = await sha256Digest(payloadBytes);
  // Take first 4 bytes (32 bits of cryptographic hash)
  const segments: string[] = [];
  for (let i = 0; i < 4; i++) {
    segments.push(hash[i].toString(16).padStart(2, '0').toUpperCase());
  }
  return segments.join('-');
}

/**
 * Validates whether two fingerprints match identically.
 */
export function verifyFingerprint(fpA: string, fpB: string): boolean {
  if (!fpA || !fpB) return false;
  return fpA.trim().toUpperCase() === fpB.trim().toUpperCase();
}

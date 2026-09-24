/**
 * Compatibility Tester Module
 *
 * Verifies whether an emoji string copied from/to a messaging platform has survived unaltered.
 */

import { decodeEmojiToBytes, validateEmojiPayload } from './emojiCodec';
import { extractAndUnpackPayload } from './payload';
import { generateFingerprintFromBytes, verifyFingerprint } from './fingerprint';
import { CompatibilityCheckResult } from '../types';

export async function checkPayloadCompatibility(
  pastedEmojiString: string,
  expectedFingerprint?: string
): Promise<CompatibilityCheckResult> {
  if (!pastedEmojiString || pastedEmojiString.trim().length === 0) {
    return {
      passed: false,
      preserved: false,
      sequenceValid: false,
      integrityPassed: false,
      details: 'No emoji text provided to test.'
    };
  }

  // Step 1: Emoji Sequence & Unicode Segmentation Validation
  const validation = validateEmojiPayload(pastedEmojiString);
  const sequenceValid = validation.validEmojiCount > 0;

  if (!sequenceValid) {
    return {
      passed: false,
      preserved: false,
      sequenceValid: false,
      integrityPassed: false,
      details: 'No valid EmojLock emojis detected in the input.'
    };
  }

  // Step 2: Binary Payload Extraction & Unpacking
  let payloadBytes: Uint8Array;
  try {
    payloadBytes = decodeEmojiToBytes(pastedEmojiString);
  } catch (err: any) {
    return {
      passed: false,
      preserved: false,
      sequenceValid: true,
      integrityPassed: false,
      details: `Failed to parse emoji sequence: ${err.message || 'Corrupted data'}`
    };
  }

  let cleanBytes: Uint8Array;
  try {
    const { cleanPayloadBytes } = extractAndUnpackPayload(payloadBytes);
    cleanBytes = cleanPayloadBytes;
  } catch (err: any) {
    return {
      passed: false,
      preserved: false,
      sequenceValid: true,
      integrityPassed: false,
      details: err.message || 'Payload header is corrupted or incomplete.'
    };
  }

  // Step 3: Fingerprint & Integrity Check
  const pastedFingerprint = await generateFingerprintFromBytes(cleanBytes);

  let integrityPassed = true;
  let preserved = true;
  let details = 'Emoji sequence is valid and payload structure is intact.';

  if (expectedFingerprint) {
    const matches = verifyFingerprint(pastedFingerprint, expectedFingerprint);
    if (!matches) {
      integrityPassed = false;
      preserved = false;
      details = 'Payload changed during transit or copy/paste. The fingerprint does not match the original secret.';
    } else {
      details = 'Payload perfectly preserved! All emojis and binary headers survived copy/paste unaltered.';
    }
  }

  return {
    passed: sequenceValid && integrityPassed,
    preserved,
    sequenceValid,
    integrityPassed,
    details,
    originalFingerprint: expectedFingerprint,
    pastedFingerprint
  };
}

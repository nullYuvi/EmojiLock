export interface EncodeOptions {
  message: string;
  password?: string;
  decoyMode?: boolean;
  viewOnce?: boolean;
}

export interface EncodeResult {
  emojiString: string;
  fingerprint: string;
  payloadLength: number;
  emojiCount: number;
  hasPassword: boolean;
  viewOnce: boolean;
  decoyMode: boolean;
}

export interface DecodeOptions {
  emojiString: string;
  password?: string;
}

export interface PayloadHeader {
  version: number;
  hasPassword: boolean;
  viewOnce: boolean;
  decoyMode: boolean;
  salt: Uint8Array;
  nonce: Uint8Array;
  ciphertext: Uint8Array;
}

export interface DecodeResult {
  plaintext: string;
  fingerprint: string;
  version: number;
  hasPassword: boolean;
  viewOnce: boolean;
  decoyMode: boolean;
  verified: boolean;
}

export type DecodeErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_FORMAT'
  | 'UNSUPPORTED_VERSION'
  | 'PASSWORD_REQUIRED'
  | 'WRONG_PASSWORD_OR_CORRUPT'
  | 'CORRUPT_PAYLOAD'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNKNOWN_ERROR';

export interface DecodeError {
  code: DecodeErrorCode;
  message: string;
  details?: string;
}

export interface CompatibilityCheckResult {
  passed: boolean;
  preserved: boolean;
  sequenceValid: boolean;
  integrityPassed: boolean;
  details: string;
  originalFingerprint?: string;
  pastedFingerprint?: string;
}

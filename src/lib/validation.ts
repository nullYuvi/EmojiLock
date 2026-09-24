/**
 * Validation and Safety Thresholds
 */

export const MAX_MESSAGE_CHARACTERS = 10000;
export const LARGE_MESSAGE_WARNING_THRESHOLD = 1500;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  byteLength: number;
}

/**
 * Validates plaintext message input before encryption.
 */
export function validatePlaintextInput(message: string): ValidationResult {
  if (!message || message.trim().length === 0) {
    return {
      isValid: false,
      error: 'Please enter a message to encode.',
      byteLength: 0
    };
  }

  const byteLength = new TextEncoder().encode(message).length;

  if (message.length > MAX_MESSAGE_CHARACTERS) {
    return {
      isValid: false,
      error: `Message exceeds the maximum limit of ${MAX_MESSAGE_CHARACTERS.toLocaleString()} characters.`,
      byteLength
    };
  }

  let warning: string | undefined;
  if (message.length > LARGE_MESSAGE_WARNING_THRESHOLD) {
    warning = 'Large secrets generate long emoji strings that may be inconvenient to copy through some messaging apps.';
  }

  return {
    isValid: true,
    warning,
    byteLength
  };
}

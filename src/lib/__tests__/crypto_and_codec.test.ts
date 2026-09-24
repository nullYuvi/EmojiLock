import { describe, it, expect } from 'vitest';
import {
  EMOJI_ALPHABET_V1,
  encodeBytesToEmoji,
  decodeEmojiToBytes,
  segmentEmojis,
  normalizeEmojiChar,
  estimateEmojiCount,
  validateEmojiPayload
} from '../emojiCodec';
import {
  encodeSecret,
  decodeSecret,
  encodeMessage,
  decodeMessage,
  packPayload,
  extractAndUnpackPayload,
  MAGIC_BYTES,
  CURRENT_VERSION
} from '../payload';
import { generateFingerprintFromBytes, verifyFingerprint } from '../fingerprint';
import { checkPayloadCompatibility } from '../compatibility';
import { validatePlaintextInput, MAX_MESSAGE_CHARACTERS } from '../validation';
import { copyToClipboard } from '../clipboard';

describe('1. Emoji Codec & Alphabet V1 Purity', () => {
  it('has exactly 256 unique emojis', () => {
    expect(EMOJI_ALPHABET_V1.length).toBe(256);
    const uniqueSet = new Set(EMOJI_ALPHABET_V1);
    expect(uniqueSet.size).toBe(256);
  });

  it('contains strictly single-codepoint emojis without ZWJ, skin tones, or variation selectors', () => {
    for (const emoji of EMOJI_ALPHABET_V1) {
      expect(emoji.includes('\u200D')).toBe(false); // No ZWJ
      expect(emoji.includes('\uFE0F')).toBe(false); // No VS-16
      expect(emoji.includes('\uFE0E')).toBe(false); // No VS-15
      
      const graphemes = Array.from(emoji);
      expect(graphemes.length).toBe(1);
    }
  });

  it('round-trips all byte values from 0x00 through 0xFF losslessly', () => {
    // Test every single byte individually 0..255: byte -> emoji -> byte
    for (let b = 0; b < 256; b++) {
      const singleByte = new Uint8Array([b]);
      const emoji = encodeBytesToEmoji(singleByte);
      const recovered = decodeEmojiToBytes(emoji);
      expect(recovered.length).toBe(1);
      expect(recovered[0]).toBe(b);
    }

    const allBytes = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      allBytes[i] = i;
    }

    const emojiStr = encodeBytesToEmoji(allBytes);
    const decodedBytes = decodeEmojiToBytes(emojiStr);

    expect(decodedBytes.length).toBe(256);
    for (let i = 0; i < 256; i++) {
      expect(decodedBytes[i]).toBe(i);
    }
  });

  it('round-trips Uint8Array([0,1,2,10,50,100,128,200,254,255]) accurately', () => {
    const sampleBytes = new Uint8Array([0, 1, 2, 10, 50, 100, 128, 200, 254, 255]);
    const encoded = encodeBytesToEmoji(sampleBytes);
    const decoded = decodeEmojiToBytes(encoded);
    expect(decoded).toEqual(sampleBytes);
  });

  it('normalizes variation selectors, zero-width joiners, and zero-width spaces gracefully', () => {
    const rawEmoji = '😀';
    const withVariation = rawEmoji + '\uFE0F\u200B\uFEFF\u200D';
    const normalized = normalizeEmojiChar(withVariation);
    expect(normalized).toBe(rawEmoji);
  });

  it('validates emoji payloads and detects unrecognized characters', () => {
    const validString = '😀😁😂😃';
    const resValid = validateEmojiPayload(validString);
    expect(resValid.valid).toBe(true);
    expect(resValid.validEmojiCount).toBe(4);

    const mixedString = '😀 Hello 😁';
    const resMixed = validateEmojiPayload(mixedString);
    expect(resMixed.valid).toBe(false);
    expect(resMixed.unrecognized.length).toBeGreaterThan(0);
  });

  it('packs and unpacks raw binary payloads accurately', () => {
    const salt = new Uint8Array(16).fill(0x11);
    const nonce = new Uint8Array(12).fill(0x22);
    const ciphertext = new Uint8Array(20).fill(0x33);
    const flags = 0x01;

    const packed = packPayload(CURRENT_VERSION, flags, salt, nonce, ciphertext);
    expect(packed.slice(0, 4)).toEqual(MAGIC_BYTES);

    const { header } = extractAndUnpackPayload(packed);
    expect(header.version).toBe(CURRENT_VERSION);
    expect(header.hasPassword).toBe(true);
    expect(header.salt).toEqual(salt);
    expect(header.nonce).toEqual(nonce);
    expect(header.ciphertext).toEqual(ciphertext);
  });
});

describe('2. Plaintext Multilingual & Unicode Support', () => {
  it('roundtrips a standard English message', async () => {
    const message = 'Meet me tomorrow at 7 PM';
    const encoded = await encodeSecret({ message });
    const decoded = await decodeSecret({ emojiString: encoded.emojiString });
    expect(decoded.plaintext).toBe(message);
    expect(decoded.verified).toBe(true);
  });

  it('roundtrips Hindi messages losslessly', async () => {
    const hindi1 = 'नमस्ते दुनिया, यह एक अत्यंत गोपनीय संदेश है।';
    const hindi2 = 'Hello भाई 👋 कैसे हो सब ठीक?';

    const enc1 = await encodeSecret({ message: hindi1 });
    const dec1 = await decodeSecret({ emojiString: enc1.emojiString });
    expect(dec1.plaintext).toBe(hindi1);

    const enc2 = await encodeSecret({ message: hindi2, password: 'गुप्त-पासवर्ड' });
    const dec2 = await decodeSecret({ emojiString: enc2.emojiString, password: 'गुप्त-पासवर्ड' });
    expect(dec2.plaintext).toBe(hindi2);
  });

  it('roundtrips Japanese, Chinese, and Arabic multilingual messages', async () => {
    const ja = '秘密メッセージ 🐱💻 安全な暗号化';
    const zh = '这是一个端到端加密的机密信息 🚀';
    const ar = 'مرحبا بالعالم - هذا نص سري مشفر بالكامل';

    const encJa = await encodeSecret({ message: ja });
    const decJa = await decodeSecret({ emojiString: encJa.emojiString });
    expect(decJa.plaintext).toBe(ja);

    const encZh = await encodeSecret({ message: zh });
    const decZh = await decodeSecret({ emojiString: encZh.emojiString });
    expect(decZh.plaintext).toBe(zh);

    const encAr = await encodeSecret({ message: ar });
    const decAr = await decodeSecret({ emojiString: encAr.emojiString });
    expect(decAr.plaintext).toBe(ar);
  });

  it('preserves emojis and complex emoji sequences INSIDE the original plaintext message', async () => {
    const emojiInside = 'Secret coordinates: 📍 40.7128° N, 74.0060° W 🗽🍕🛸🚀🔥✨';
    const encoded = await encodeSecret({ message: emojiInside });
    const decoded = await decodeSecret({ emojiString: encoded.emojiString });
    expect(decoded.plaintext).toBe(emojiInside);
  });

  it('handles multiline messages with various newlines and tabs', async () => {
    const multiline = "Header Line\r\n\tIndented Level 1\n\t\tIndented Level 2\r\nEnd of file.";
    const encoded = await encodeSecret({ message: multiline });
    const decoded = await decodeSecret({ emojiString: encoded.emojiString });
    expect(decoded.plaintext).toBe(multiline);
  });

  it('handles special characters, symbols, code snippets, and injection vectors', async () => {
    const dangerous = `<script>alert("xss")</script><img src=x onerror=alert(1)/> \${process.env} ' " ; DROP TABLE secrets; --`;
    const encoded = await encodeSecret({ message: dangerous });
    const decoded = await decodeSecret({ emojiString: encoded.emojiString });
    expect(decoded.plaintext).toBe(dangerous);
  });

  it('roundtrips all required Step 7 benchmark messages losslessly', async () => {
    const benchmarkMessages = [
      "Hello",
      "Hello World",
      "Hello भाई",
      "नमस्ते",
      "नमस्ते भाई 👋",
      "😀🚀🔥",
      "Hello\nWorld",
      "Special: !@#$%^&*()",
      "Japanese: こんにちは",
      "Chinese: 你好",
      "Arabic: مرحبا"
    ];

    for (const msg of benchmarkMessages) {
      // Test passwordless
      const encNoPass = await encodeMessage(msg);
      const decNoPass = await decodeMessage(encNoPass);
      expect(decNoPass).toBe(msg);

      // Test with password
      const encWithPass = await encodeMessage(msg, "test123");
      const decWithPass = await decodeMessage(encWithPass, "test123");
      expect(decWithPass).toBe(msg);
    }
  });
});

describe('3. Password Protection & Cryptographic Authentication', () => {
  it('passes the exact Step 10 automated test requirement', async () => {
    const original = "Hello भाई 👋";
    const encoded = await encodeMessage(original, "test123");
    const decoded = await decodeMessage(encoded, "test123");
    expect(decoded).toBe(original);

    // Wrong password test
    await expect(decodeMessage(encoded, "wrong-password")).rejects.toThrow();
  });

  it('encrypts and decrypts with password protection (PBKDF2-SHA-256 + AES-256-GCM)', async () => {
    const message = 'Confidential financial report 2026';
    const password = 'my-ultra-strong-passphrase-8899';

    const encoded = await encodeSecret({ message, password });
    expect(encoded.hasPassword).toBe(true);

    // Missing password fails with PASSWORD_REQUIRED
    await expect(decodeSecret({ emojiString: encoded.emojiString })).rejects.toMatchObject({
      code: 'PASSWORD_REQUIRED'
    });

    // Correct password succeeds
    const decoded = await decodeSecret({ emojiString: encoded.emojiString, password });
    expect(decoded.plaintext).toBe(message);
    expect(decoded.hasPassword).toBe(true);
  });

  it('rejects wrong password with a safe authentication error', async () => {
    const message = 'Protected intelligence document';
    const encoded = await encodeSecret({ message, password: 'correct-password' });

    await expect(
      decodeSecret({ emojiString: encoded.emojiString, password: 'incorrect-password' })
    ).rejects.toMatchObject({
      code: 'WRONG_PASSWORD_OR_CORRUPT'
    });
  });

  it('generates unique salt and IV for repeated encryptions of the same plaintext', async () => {
    const message = 'Same plaintext repeated';
    const enc1 = await encodeSecret({ message });
    const enc2 = await encodeSecret({ message });

    // Ciphertext and emoji output must differ due to random IV & salt
    expect(enc1.emojiString).not.toBe(enc2.emojiString);
    expect(enc1.fingerprint).not.toBe(enc2.fingerprint);

    // Both decode to the same plaintext
    const dec1 = await decodeSecret({ emojiString: enc1.emojiString });
    const dec2 = await decodeSecret({ emojiString: enc2.emojiString });
    expect(dec1.plaintext).toBe(message);
    expect(dec2.plaintext).toBe(message);
  });

  it('operates in passwordless open obfuscation mode reliably', async () => {
    const message = 'Public secret announcement';
    const encoded = await encodeSecret({ message });
    expect(encoded.hasPassword).toBe(false);

    const decoded = await decodeSecret({ emojiString: encoded.emojiString });
    expect(decoded.plaintext).toBe(message);
  });
});

describe('4. Tampering & Malformed Payload Handling', () => {
  it('fails safely when any single emoji in the ciphertext is modified', async () => {
    const message = 'Integrity verification test';
    const encoded = await encodeSecret({ message });

    const emojis = segmentEmojis(encoded.emojiString);
    // Tamper with middle emoji
    const midIdx = Math.floor(emojis.length / 2);
    emojis[midIdx] = emojis[midIdx] === '😀' ? '😁' : '😀';
    const tamperedEmojiString = emojis.join('');

    await expect(
      decodeSecret({ emojiString: tamperedEmojiString })
    ).rejects.toMatchObject({
      code: 'CORRUPT_PAYLOAD'
    });
  });

  it('fails safely when payload is truncated or incomplete', async () => {
    const message = 'Truncation boundary check';
    const encoded = await encodeSecret({ message });

    const emojis = segmentEmojis(encoded.emojiString);
    const truncated = emojis.slice(0, 15).join('');

    await expect(
      decodeSecret({ emojiString: truncated })
    ).rejects.toMatchObject({
      code: 'INVALID_FORMAT'
    });
  });

  it('fails safely when magic signature is corrupted', async () => {
    const message = 'Magic header check';
    const encoded = await encodeSecret({ message });

    const rawBytes = decodeEmojiToBytes(encoded.emojiString);
    rawBytes[0] = 0x00; // corrupt magic byte 'E'
    const corruptedEmojis = encodeBytesToEmoji(rawBytes);

    await expect(
      decodeSecret({ emojiString: corruptedEmojis })
    ).rejects.toMatchObject({
      code: 'INVALID_FORMAT'
    });
  });

  it('fails safely when version is modified/unsupported', async () => {
    const message = 'Version header check';
    const encoded = await encodeSecret({ message });

    const rawBytes = decodeEmojiToBytes(encoded.emojiString);
    rawBytes[4] = 0x99; // Set unsupported version 99
    const corruptedEmojis = encodeBytesToEmoji(rawBytes);

    await expect(
      decodeSecret({ emojiString: corruptedEmojis })
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_VERSION'
    });
  });

  it('fails safely when header flags or length are tampered (detected by AAD)', async () => {
    const message = 'Header tampering test';
    const encoded = await encodeSecret({ message });

    const rawBytes = decodeEmojiToBytes(encoded.emojiString);
    // Flip a flag bit in byte 5
    rawBytes[5] ^= 0x02;
    const corruptedEmojis = encodeBytesToEmoji(rawBytes);

    await expect(
      decodeSecret({ emojiString: corruptedEmojis })
    ).rejects.toMatchObject({
      code: 'CORRUPT_PAYLOAD'
    });
  });

  it('fails safely on completely random or garbage non-EmojLock text', async () => {
    await expect(decodeSecret({ emojiString: 'Just some random text without emojis' })).rejects.toMatchObject({
      code: 'INVALID_FORMAT'
    });

    await expect(decodeSecret({ emojiString: '' })).rejects.toMatchObject({
      code: 'EMPTY_INPUT'
    });
  });
});

describe('5. Feature Modes: Decoy Mode, View Once, & Fingerprints', () => {
  it('handles Decoy Mode properly and extracts secret amidst conversational chatter', async () => {
    const message = 'Decoy Mode active test';
    const encoded = await encodeSecret({ message, decoyMode: true });
    expect(encoded.decoyMode).toBe(true);

    const decoded = await decodeSecret({ emojiString: encoded.emojiString });
    expect(decoded.plaintext).toBe(message);
    expect(decoded.decoyMode).toBe(true);

    // Surrounding with user conversation
    const surrounded = `Hey everyone! ${encoded.emojiString} Have a wonderful evening!`;
    const decodedSurrounded = await decodeSecret({ emojiString: surrounded });
    expect(decodedSurrounded.plaintext).toBe(message);
  });

  it('flags View-Once mode in the payload correctly', async () => {
    const message = 'Single view notification';
    const encoded = await encodeSecret({ message, viewOnce: true });
    expect(encoded.viewOnce).toBe(true);

    const decoded = await decodeSecret({ emojiString: encoded.emojiString });
    expect(decoded.plaintext).toBe(message);
    expect(decoded.viewOnce).toBe(true);
  });

  it('generates deterministic fingerprints for identical binary payloads', async () => {
    const testBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const fp1 = await generateFingerprintFromBytes(testBytes);
    const fp2 = await generateFingerprintFromBytes(testBytes);
    expect(fp1).toBe(fp2);
    expect(verifyFingerprint(fp1, fp2)).toBe(true);
  });
});

describe('6. Compatibility Checker & Input Validation', () => {
  it('validates preserved payloads in Compatibility Checker', async () => {
    const encoded = await encodeSecret({ message: 'Preservation test' });
    const result = await checkPayloadCompatibility(encoded.emojiString, encoded.fingerprint);
    expect(result.passed).toBe(true);
    expect(result.sequenceValid).toBe(true);
    expect(result.preserved).toBe(true);
    expect(result.integrityPassed).toBe(true);
  });

  it('works with Decoy Mode in Compatibility Checker', async () => {
    const encoded = await encodeSecret({ message: 'Decoy preservation test', decoyMode: true });
    const result = await checkPayloadCompatibility(encoded.emojiString, encoded.fingerprint);
    expect(result.passed).toBe(true);
    expect(result.integrityPassed).toBe(true);
  });

  it('validates message boundaries and estimates emoji counts', () => {
    expect(validatePlaintextInput('').isValid).toBe(false);
    expect(validatePlaintextInput('A'.repeat(MAX_MESSAGE_CHARACTERS + 1)).isValid).toBe(false);
    expect(validatePlaintextInput('Valid message').isValid).toBe(true);

    const estimate = estimateEmojiCount(50);
    expect(estimate).toBe(38 + 16 + 50); // 104
  });

  it('handles clipboard fallback helper safely', async () => {
    const ok = await copyToClipboard('');
    expect(ok).toBe(false);
  });
});

describe('7. Step 12 End-to-End Verification Test', () => {
  it('executes full manual test scenario: encode, decode with correct pass, fail on wrong pass, fail on 1 modified emoji', async () => {
    const message = "Hello भाई 👋";
    const password = "test123";

    // 1. Encode -> emoji payload appears
    const emojiPayload = await encodeMessage(message, password);
    expect(typeof emojiPayload).toBe('string');
    expect(emojiPayload.length).toBeGreaterThan(0);

    // 2. Decode -> paste emojis with correct password -> Result: "Hello भाई 👋"
    const decoded = await decodeMessage(emojiPayload, password);
    expect(decoded).toBe(message);

    // 3. Wrong password -> Clean decryption error
    await expect(decodeMessage(emojiPayload, "wrong-password")).rejects.toThrow();

    // 4. Modify ONE emoji -> Clean corruption/authentication error
    const segments = segmentEmojis(emojiPayload);
    expect(segments.length).toBeGreaterThan(10);
    // Alter the 10th emoji
    segments[10] = segments[10] === '😀' ? '😁' : '😀';
    const tamperedPayload = segments.join('');

    await expect(decodeMessage(tamperedPayload, password)).rejects.toThrow();
  });
});

describe('8. Universal Crypto Engine & Non-Secure Context (HTTP) Fallback', () => {
  it('encodes and decodes seamlessly when globalThis.crypto.subtle is undefined (HTTP mode)', async () => {
    const originalSubtle = globalThis.crypto?.subtle;
    try {
      // Simulate non-secure context (HTTP non-localhost preview)
      Object.defineProperty(globalThis.crypto, 'subtle', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const message = "Secret message in HTTP context! 🚀🔒";
      const password = "secure-pass-123";

      const encoded = await encodeSecret({ message, password });
      expect(encoded.emojiString).toBeDefined();
      expect(encoded.fingerprint).toBeDefined();

      const decoded = await decodeSecret({
        emojiString: encoded.emojiString,
        password
      });

      expect(decoded.plaintext).toBe(message);
      expect(decoded.fingerprint).toBe(encoded.fingerprint);
      expect(decoded.verified).toBe(true);
    } finally {
      // Restore
      Object.defineProperty(globalThis.crypto, 'subtle', {
        value: originalSubtle,
        writable: true,
        configurable: true
      });
    }
  });

  it('verifies interoperability: encoded in WebCrypto, decoded in pure JS fallback and vice versa', async () => {
    const originalSubtle = globalThis.crypto?.subtle;
    const message = "Cross-mode crypto compatibility test 🌐";
    const password = "interop-password";

    // 1. Encode with WebCrypto
    const encodedWithWebCrypto = await encodeSecret({ message, password });

    // 2. Decode with pure JS (subtle = undefined)
    Object.defineProperty(globalThis.crypto, 'subtle', {
      value: undefined,
      writable: true,
      configurable: true
    });

    const decodedWithFallback = await decodeSecret({
      emojiString: encodedWithWebCrypto.emojiString,
      password
    });
    expect(decodedWithFallback.plaintext).toBe(message);

    // 3. Encode with pure JS fallback
    const encodedWithFallback = await encodeSecret({ message, password });

    // 4. Restore WebCrypto and decode
    Object.defineProperty(globalThis.crypto, 'subtle', {
      value: originalSubtle,
      writable: true,
      configurable: true
    });

    const decodedWithWebCrypto = await decodeSecret({
      emojiString: encodedWithFallback.emojiString,
      password
    });
    expect(decodedWithWebCrypto.plaintext).toBe(message);
  });
});


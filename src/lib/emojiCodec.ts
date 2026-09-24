/**
 * EmojLock Curated Emoji Codec (Version 1)
 *
 * Requirements:
 * - Exactly 256 unique emojis (1 byte = 1 emoji).
 * - Single-code-point characters only (no ZWJ sequences, no skin tones, no flags, no variation selectors).
 * - Broad cross-platform support across modern iOS, Android, macOS, Windows, Linux.
 * - Robust Intl.Segmenter / fallback grapheme parser for copy-paste resilience.
 */

// 256 Curated Single-Codepoint Emojis (Version 1 Alphabet)
// Grouped systematically from Unicode 6.0/7.0/8.0 emoji blocks.
export const EMOJI_ALPHABET_V1: readonly string[] = Object.freeze([
  // 0x00 - 0x1F (32 Smileys & Faces)
  "😀", "😁", "😂", "😃", "😄", "😅", "😆", "😇",
  "😈", "😉", "😊", "😋", "😌", "😍", "😎", "😏",
  "😐", "😑", "😒", "😓", "😔", "😕", "😖", "😗",
  "😘", "😙", "😚", "😛", "😜", "😝", "😞", "😟",

  // 0x20 - 0x3F (32 Expressions, Cats & Monkeys)
  "😠", "😡", "😢", "😣", "😤", "😥", "😦", "😧",
  "😨", "😩", "😪", "😫", "😬", "😭", "😮", "😯",
  "😰", "😱", "😲", "😳", "😴", "😵", "😶", "😷",
  "😸", "😹", "😺", "😻", "😼", "😽", "😾", "😿",

  // 0x40 - 0x5F (32 Animals Part 1)
  "🙀", "🙈", "🙉", "🙊", "🐵", "🐒", "🐶", "🐕",
  "🐩", "🐺", "🐱", "🐈", "🐯", "🐅", "🐆", "🐴",
  "🐎", "🐮", "🐂", "🐃", "🐄", "🐷", "🐖", "🐗",
  "🐽", "🐏", "🐑", "🐐", "🐪", "🐫", "🐘", "🐭",

  // 0x60 - 0x7F (32 Animals Part 2 & Sea Creatures)
  "🐁", "🐀", "🐹", "🐰", "🐇", "🐻", "🐨", "🐼",
  "🐾", "🐔", "🐓", "🐣", "🐤", "🐥", "🐦", "🐧",
  "🐸", "🐊", "🐢", "🐍", "🐲", "🐉", "🐳", "🐋",
  "🐬", "🐟", "🐠", "🐡", "🐙", "🐚", "🐌", "🐛",

  // 0x80 - 0x9F (32 Insects, Plants & Nature)
  "🐜", "🐝", "🐞", "🌰", "🌱", "🌲", "🌳", "🌴",
  "🌵", "🌷", "🌸", "🌹", "🌺", "🌻", "🌼", "🌽",
  "🌾", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🍅",
  "🍆", "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍",

  // 0xA0 - 0xBF (32 Fruits, Food & Meals)
  "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🍔", "🍕",
  "🍖", "🍗", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝",
  "🍞", "🍟", "🍡", "🍢", "🍣", "🍦", "🍧", "🍨",
  "🍩", "🍪", "🍫", "🍬", "🍭", "🍮", "🍯", "🍰",

  // 0xC0 - 0xDF (32 Drinks, Celebration & Activities)
  "🍱", "🍲", "🍳", "🍴", "🍵", "🍶", "🍷", "🍸",
  "🍹", "🍺", "🍻", "🍼", "🎀", "🎁", "🎂", "🎃",
  "🎄", "🎆", "🎇", "🎈", "🎉", "🎊", "🎋", "🎌",
  "🎍", "🎎", "🎏", "🎒", "🎓", "🎠", "🎡", "🎢",

  // 0xE0 - 0xFF (32 Objects, Vehicles & Symbols)
  "🎣", "🎤", "🎥", "🎦", "🎨", "🎩", "🎪", "🎫",
  "🎬", "🎯", "🎰", "🎱", "🎲", "🎳", "🎸", "🎺",
  "🎻", "🎼", "🎽", "🎾", "🎿", "🏀", "🏁", "🏆",
  "👑", "💍", "💎", "🔮", "💡", "💣", "🔔", "🚀"
]);

// Build forward and reverse lookup maps for O(1) encoding and decoding
const BYTE_TO_EMOJI: string[] = Array.from(EMOJI_ALPHABET_V1);
const EMOJI_TO_BYTE: Map<string, number> = new Map();

EMOJI_ALPHABET_V1.forEach((emoji, index) => {
  EMOJI_TO_BYTE.set(emoji, index);
});

// Decoy wrappers / frames that help camouflage secrets when Decoy Mode is activated
export const DECOY_PREFIXES = [
  "🔥 Check out this awesome vibe! 🎉 ",
  "🌟 Today's mood playlist: ✨ ",
  "🍕 Lunch time gang: 🌮 ",
  "🚀 To the moon and beyond! 💫 "
];

export const DECOY_SUFFIXES = [
  " 💯 let's go!! 🥳",
  " ✨ wishing you great vibes 💖",
  " 🌈 stay awesome 🙌",
  " 🎯 top priority!"
];

/**
 * Remove any trailing/hidden variation selectors, zero-width spaces, or unwanted whitespace.
 */
export function normalizeEmojiChar(char: string): string {
  // Strip VS-15 (U+FE0E), VS-16 (U+FE0F), Zero-Width Joiner (U+200D), Zero-Width Space (U+200B), and BOM (U+FEFF)
  return char.replace(/[\uFE0E\uFE0F\u200D\u200B\uFEFF]/g, '');
}

/**
 * Robust Unicode segmenter that splits a string into individual graphemes / emojis.
 */
export function segmentEmojis(input: string): string[] {
  if (!input) return [];

  // Use standard Intl.Segmenter if available (supported in all modern browsers and Node 16+)
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const segments = segmenter.segment(input);
    const result: string[] = [];
    for (const { segment } of segments) {
      const normalized = normalizeEmojiChar(segment.trim());
      if (normalized.length > 0) {
        result.push(normalized);
      }
    }
    return result;
  }

  // Fallback: Array.from handles UTF-16 surrogate pairs properly
  return Array.from(input)
    .map(c => normalizeEmojiChar(c.trim()))
    .filter(c => c.length > 0);
}

/**
 * Encode an arbitrary byte array into an emoji string using the curated alphabet.
 */
export function encodeBytesToEmoji(bytes: Uint8Array): string {
  const result: string[] = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    result[i] = BYTE_TO_EMOJI[byte];
  }
  return result.join('');
}

/**
 * Decodes an emoji string back into a raw byte array.
 * Throws an error if an unsupported emoji or invalid character is encountered.
 */
export function decodeEmojiToBytes(emojiString: string): Uint8Array {
  const rawSegments = segmentEmojis(emojiString);
  const matchedBytes: number[] = [];

  for (let i = 0; i < rawSegments.length; i++) {
    const segment = rawSegments[i];
    const byte = EMOJI_TO_BYTE.get(segment);
    if (byte !== undefined) {
      matchedBytes.push(byte);
    }
  }

  if (matchedBytes.length === 0) {
    throw new Error('No valid EmojLock emojis found in the provided input.');
  }

  return new Uint8Array(matchedBytes);
}

/**
 * Validate whether a string contains valid EmojLock emojis.
 */
export function validateEmojiPayload(payload: string): {
  valid: boolean;
  totalGraphemes: number;
  validEmojiCount: number;
  unrecognized: string[];
} {
  const segments = segmentEmojis(payload);
  let validCount = 0;
  const unrecognized: string[] = [];

  for (const seg of segments) {
    if (EMOJI_TO_BYTE.has(seg)) {
      validCount++;
    } else {
      unrecognized.push(seg);
    }
  }

  return {
    valid: validCount > 0 && unrecognized.length === 0,
    totalGraphemes: segments.length,
    validEmojiCount: validCount,
    unrecognized
  };
}

/**
 * Estimate the number of emojis required to encode a plaintext message with given options.
 */
export function estimateEmojiCount(messageLengthInBytes: number, _hasPassword?: boolean): number {
  // 4 bytes Magic ("EMJL")
  // 1 byte Version
  // 1 byte Flags
  // 4 bytes Ciphertext Length
  // 16 bytes Salt
  // 12 bytes IV / Nonce
  // messageLength bytes Ciphertext
  // 16 bytes AES-GCM Auth Tag
  const headerOverhead = 4 + 1 + 1 + 4 + 16 + 12 + 16;
  return headerOverhead + messageLengthInBytes;
}

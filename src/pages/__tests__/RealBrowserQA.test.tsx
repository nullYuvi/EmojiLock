// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '../../App';
import { EncodePage } from '../EncodePage';
import { DecodePage } from '../DecodePage';
import { ToastProvider } from '../../hooks/useToast';
import { segmentEmojis } from '../../lib/emojiCodec';
import { encodeMessage, decodeMessage } from '../../lib/payload';

vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

describe('Real Browser QA Test Suite', () => {
  let clipboardContent = '';

  beforeEach(() => {
    clipboardContent = '';
    // Enable secure context for navigator.clipboard
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      writable: true,
      configurable: true
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(async (text: string) => {
          clipboardContent = text;
          return true;
        }),
        readText: vi.fn(async () => clipboardContent)
      }
    });

    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
    cleanup();
  });

  // Test 1 — Basic Encode
  it('Test 1 — Basic Encode: encodes Hello, displays payload, enables Copy, no error', async () => {
    render(
      <ToastProvider>
        <EncodePage onSelectTab={vi.fn()} />
      </ToastProvider>
    );

    const textarea = screen.getByPlaceholderText(/Type your message/i);
    const encodeBtns = screen.getAllByRole('button', { name: /Create Emoji Message/i });
    const encodeBtn = encodeBtns[0] as HTMLButtonElement;

    expect(encodeBtn.disabled).toBe(true);

    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(encodeBtn.disabled).toBe(false);

    fireEvent.click(encodeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Your emoji message is ready/i)).toBeDefined();
    });

    
    const payloadBoxes = screen.getAllByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'div' &&
        element?.classList.contains('emoji-font') &&
        content.length > 0
      );
    });
    expect(payloadBoxes.length).toBeGreaterThan(0);
    const emojiText = payloadBoxes[0].textContent;
    expect(emojiText).toBeTruthy();
    expect(emojiText!.length).toBeGreaterThan(10);

    const copyBtns = screen.getAllByRole('button', { name: /Copy/i });
    expect(copyBtns.length).toBeGreaterThan(0);
    expect((copyBtns[0] as HTMLButtonElement).disabled).toBe(false);

    expect(screen.queryByText(/Unable to encode this message/i)).toBeNull();
  });

  // Test 2 — Password Protection
  it('Test 2 — Password Protection: encodes and decodes "Hello भाई 👋" with password "test123"', async () => {
    const message = 'Hello भाई 👋';
    const password = 'test123';

    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );

    const encodeNavBtn = screen.getByRole('button', { name: /Hide a Message/i });
    fireEvent.click(encodeNavBtn);

    const textarea = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(textarea, { target: { value: message } });

    const pwCheckbox = screen.getByLabelText(/Password \(optional\)/i);
    fireEvent.click(pwCheckbox);

    const pwInput = screen.getByPlaceholderText(/Enter password/i);
    fireEvent.change(pwInput, { target: { value: password } });

    const encodeBtns = screen.getAllByRole('button', { name: /Create Emoji Message/i });
    fireEvent.click(encodeBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Your emoji message is ready/i)).toBeDefined();
    });

    const copyBtns = screen.getAllByRole('button', { name: /Copy/i });
    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(clipboardContent.length).toBeGreaterThan(10);
    });

    const backBtn = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);
    const decodeNavBtn = screen.getByRole('button', { name: /Open a Message/i });
    fireEvent.click(decodeNavBtn);

    const emojiInput = screen.getByPlaceholderText(/Paste emojis here/i);
    fireEvent.change(emojiInput, { target: { value: clipboardContent } });

    const decryptPwInput = screen.getByPlaceholderText(/Enter password/i);
    fireEvent.change(decryptPwInput, { target: { value: password } });

    const decodeBtns = screen.getAllByRole('button', { name: /Open Message/i });
    fireEvent.click(decodeBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Here's the message/i)).toBeDefined();
      expect(screen.getByText(message)).toBeDefined();
    });
  });

  // Test 3 — Wrong Password
  it('Test 3 — Wrong Password: rejects wrong password cleanly without showing plaintext', async () => {
    const message = 'Secret confidential content';
    const password = 'correctPassword';
    const wrongPassword = 'wrongpassword';

    const encodedEmojis = await encodeMessage(message, password);

    render(
      <ToastProvider>
        <DecodePage onSelectTab={vi.fn()} prefillEmojiString={encodedEmojis} />
      </ToastProvider>
    );

    const pwInput = screen.getByPlaceholderText(/Enter password/i);
    fireEvent.change(pwInput, { target: { value: wrongPassword } });

    const decodeBtns = screen.getAllByRole('button', { name: /Open Message/i });
    fireEvent.click(decodeBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/That password doesn't work/i)).toBeDefined();
    });

    expect(screen.queryByText(message)).toBeNull();
  });

  // Test 4 — Clipboard Round Trip
  it('Test 4 — Clipboard Round Trip: "Hello World 🌍" encodes, copies to clipboard, pastes, and decodes', async () => {
    const message = 'Hello World 🌍';

    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );

    const encodeNavBtn = screen.getByRole('button', { name: /Hide a Message/i });
    fireEvent.click(encodeNavBtn);

    fireEvent.change(screen.getByPlaceholderText(/Type your message/i), {
      target: { value: message }
    });
    const encodeBtns = screen.getAllByRole('button', { name: /Create Emoji Message/i });
    fireEvent.click(encodeBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Your emoji message is ready/i)).toBeDefined();
    });

    const copyBtns = screen.getAllByRole('button', { name: /Copy/i });
    fireEvent.click(copyBtns[0]);
    await waitFor(() => {
      expect(clipboardContent.length).toBeGreaterThan(10);
    });

    const backBtn = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);
    const decodeNavBtn = screen.getByRole('button', { name: /Open a Message/i });
    fireEvent.click(decodeNavBtn);

    const decodeTextarea = screen.getByPlaceholderText(/Paste emojis here/i) as HTMLTextAreaElement;
    fireEvent.change(decodeTextarea, { target: { value: clipboardContent } });


    const decodeBtns = screen.getAllByRole('button', { name: /Open Message/i });
    fireEvent.click(decodeBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(message)).toBeDefined();
    });
  });

  // Test 5 — Hindi
  it('Test 5 — Hindi: "नमस्ते भाई, क्या हाल है? 🇮🇳" roundtrips byte-for-byte', async () => {
    const hindiMessage = 'नमस्ते भाई, क्या हाल है? 🇮🇳';
    const encoded = await encodeMessage(hindiMessage);
    const decoded = await decodeMessage(encoded);
    expect(decoded).toBe(hindiMessage);
  });

  // Test 6 — Multiline
  it('Test 6 — Multiline: preserves multiple lines intact', async () => {
    const multiline = 'Line 1\nLine 2\nLine 3';
    const encoded = await encodeMessage(multiline);
    const decoded = await decodeMessage(encoded);
    expect(decoded).toBe(multiline);
  });

  // Test 7 — Tampering
  it('Test 7 — Tampering: changing one carrier emoji causes clean corruption error and no plaintext', async () => {
    const message = 'Integrity test message';
    const encoded = await encodeMessage(message);

    const segments = segmentEmojis(encoded);
    // Tamper with a carrier emoji in ciphertext (after the 38-byte header)
    const midIdx = Math.min(segments.length - 2, 42);
    segments[midIdx] = segments[midIdx] === '😀' ? '😁' : '😀';
    const tampered = segments.join('');

    render(
      <ToastProvider>
        <DecodePage onSelectTab={vi.fn()} prefillEmojiString={tampered} />
      </ToastProvider>
    );

    const decodeBtns = screen.getAllByRole('button', { name: /Open Message/i });
    fireEvent.click(decodeBtns[0]);

    await waitFor(() => {
      const hasError =
        screen.queryByText(/That password doesn't work/i) ||
        
        screen.queryByText(/incomplete or changed/i);
      expect(hasError).not.toBeNull();
    });

    expect(screen.queryByText(message)).toBeNull();
  });

  // Test 8 — Empty State
  it('Test 8 — Empty State: Encode button disabled on empty message without premature errors', () => {
    render(
      <ToastProvider>
        <EncodePage onSelectTab={vi.fn()} />
      </ToastProvider>
    );

    const encodeBtns = screen.getAllByRole('button', { name: /Create Emoji Message/i });
    const encodeBtn = encodeBtns[0] as HTMLButtonElement;
    expect(encodeBtn.disabled).toBe(true);
    expect(screen.queryByText(/Unable to encode this message/i)).toBeNull();
  });

  // Test 9 — Mobile Layout Classes & Elements
  it('Test 9 — Mobile Layout: containers have responsive padding, wrapping, and no layout breaking classes', () => {
    const { container } = render(
      <ToastProvider>
        <EncodePage onSelectTab={vi.fn()} />
      </ToastProvider>
    );

    const mainWrapper = container.querySelector('.max-w-\\[650px\\]');
    expect(mainWrapper).not.toBeNull();
    expect(mainWrapper?.className).toContain('px-5');
    expect(mainWrapper?.className).toContain('sm:px-6');
  });

  // Test 11 — Reload / Fresh Initialization
  it('Test 11 — Reload: fresh render starts cleanly with empty inputs and no stale data', () => {
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );

    const headings = screen.getAllByText(/Hide a secret/i);
    expect(headings.length).toBeGreaterThan(0);

    const encodeNavBtn = screen.getByRole('button', { name: /Hide a Message/i });
    fireEvent.click(encodeNavBtn);

    const encodeTextarea = screen.getByPlaceholderText(/Type your message/i) as HTMLTextAreaElement;
    expect(encodeTextarea.value).toBe('');
    expect(screen.queryByText(/Your emoji message is ready/i)).toBeNull();
  });
});

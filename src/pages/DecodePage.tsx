import React, { useState, useEffect } from 'react';
import {
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  ClipboardPaste,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActiveTab } from '../components/layout/Navbar';
import { decodeSecret, inspectEmojiPayload } from '../lib/payload';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../hooks/useToast';
import { DecodeResult, DecodeError } from '../types';

interface DecodePageProps {
  onSelectTab: (tab: ActiveTab) => void;
  prefillEmojiString?: string;
  onClearPrefill?: () => void;
}

export const DecodePage: React.FC<DecodePageProps> = ({
  onSelectTab,
  prefillEmojiString = '',
  onClearPrefill
}) => {
  const toast = useToast();

  const [emojiInput, setEmojiInput] = useState(prefillEmojiString);
  const [password, setPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null);
  const [decodeError, setDecodeError] = useState<DecodeError | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  // Synchronize prefill if passed from Encode page
  useEffect(() => {
    if (prefillEmojiString) {
      setEmojiInput(prefillEmojiString);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillEmojiString, onClearPrefill]);

  // Real-time inspection of payload
  const payloadInspection = React.useMemo(() => {
    if (!emojiInput.trim()) return null;
    return inspectEmojiPayload(emojiInput);
  }, [emojiInput]);

  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setEmojiInput(text);
          setDecodeError(null);
          toast.info('Pasted text from clipboard');
        }
      } else {
        toast.warning('Clipboard read permission unavailable. Please paste manually into the box.');
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
      toast.warning('Clipboard access denied. Please paste manually.');
    }
  };

  const handleDecode = async () => {
    if (!emojiInput.trim()) {
      setDecodeError({
        code: 'EMPTY_INPUT',
        message: 'Please enter or paste an emoji secret.'
      });
      triggerShake();
      return;
    }

    setIsDecoding(true);
    setDecodeError(null);

    try {
      const result = await decodeSecret({
        emojiString: emojiInput.trim(),
        password
      });

      setDecodeResult(result);
      toast.success('Secret decrypted successfully! 🔓', 'Integrity verified');

      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#06b6d4', '#3b82f6', '#10b981']
        });
      } catch (e) {
        console.debug('Confetti skipped:', e);
      }
    } catch (err: any) {
      console.error('Decode error:', err);
      setDecodeResult(null);
      triggerShake();
      if (err.code) {
        setDecodeError(err as DecodeError);
      } else {
        setDecodeError({
          code: 'UNKNOWN_ERROR',
          message: err.message || 'Unable to decrypt this secret.'
        });
      }
    } finally {
      setIsDecoding(false);
    }
  };

  const triggerShake = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);
  };

  const handleCopyPlaintext = async () => {
    if (!decodeResult) return;
    const ok = await copyToClipboard(decodeResult.plaintext);
    if (ok) {
      setCopiedMessage(true);
      toast.success('Plaintext message copied to clipboard!');
      setTimeout(() => setCopiedMessage(false), 2500);
    } else {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleClearAndReset = () => {
    setEmojiInput('');
    setPassword('');
    setDecodeResult(null);
    setDecodeError(null);
    toast.info('Decoder state completely cleared from memory.');
  };

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-8 animate-fadeIn">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors p-1 -ml-1 rounded-lg focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Decode Mode</span>
        </div>
      </div>

      {/* Main Decode Box */}
      <div
        className={`glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6 transition-transform ${
          shouldShake ? 'animate-shake border-rose-500/40' : ''
        }`}
      >
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Unlock className="w-6 h-6 text-cyan-400" />
            Decode a Secret
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Paste an emoji string to verify cryptographic integrity and unlock the original plaintext message.
          </p>
        </div>

        {/* Emoji Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="emoji-secret-input" className="font-medium text-slate-200">
              Emoji Secret String
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium px-2 py-0.5 rounded hover:bg-cyan-500/10 transition-colors"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
              {emojiInput && (
                <button
                  type="button"
                  onClick={() => setEmojiInput('')}
                  className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded hover:bg-white/[0.05]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            id="emoji-secret-input"
            rows={4}
            value={emojiInput}
            onChange={(e) => {
              setEmojiInput(e.target.value);
              setDecodeError(null);
            }}
            placeholder="Paste your emoji secret here... (e.g. 😀🦊🌙🚀🐼🍀...)"
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm sm:text-base font-mono emoji-font tracking-wider focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-y leading-relaxed"
          />

          {/* Real-time detected properties */}
          {payloadInspection && payloadInspection.isValid && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs flex flex-wrap items-center gap-3 animate-fadeIn text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid EmojLock Structure (v{payloadInspection.version})
              </span>
              {payloadInspection.hasPassword && (
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-[11px]">
                  Requires Password
                </span>
              )}
              {payloadInspection.viewOnce && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px]">
                  View Once Flagged
                </span>
              )}
            </div>
          )}
        </div>

        {/* Password input section if secret requires password or user enters one */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] space-y-2">
          <label htmlFor="decrypt-password" className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Password (if protected)
            </span>
            {payloadInspection?.hasPassword && (
              <span className="text-[11px] text-amber-400 font-mono">Password Required</span>
            )}
          </label>

          <div className="relative">
            <input
              id="decrypt-password"
              type={showPasswordText ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setDecodeError(null);
              }}
              placeholder="Enter password (leave blank if not password protected)..."
              className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => setShowPasswordText(!showPasswordText)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showPasswordText ? 'Hide password' : 'Show password'}
            >
              {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error Feedback Display */}
        {decodeError && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm space-y-2 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-rose-300">{decodeError.message}</p>
                {decodeError.code === 'PASSWORD_REQUIRED' && (
                  <p className="text-slate-300 text-xs">
                    This payload contains encrypted data protected with a passphrase. Please input the correct password above and try again.
                  </p>
                )}
                {decodeError.code === 'WRONG_PASSWORD_OR_CORRUPT' && (
                  <p className="text-slate-300 text-xs">
                    The provided passphrase did not match, or the emoji sequence was altered during transit.
                  </p>
                )}
                {decodeError.code === 'CORRUPT_PAYLOAD' && (
                  <p className="text-slate-300 text-xs">
                    The emoji string appears to have been modified or truncated by a third-party app or copy-paste error.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Decode Action Button */}
        <button
          onClick={handleDecode}
          disabled={isDecoding || !emojiInput.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {isDecoding ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Decrypting & Authenticating...</span>
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5" />
              <span>Decode Secret</span>
            </>
          )}
        </button>
      </div>

      {/* Decoded Plaintext Result Card */}
      {decodeResult && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-950/30 space-y-6 animate-slideUp">
          {/* View-Once Warning Banner */}
          {decodeResult.viewOnce && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>View-Once Secret Active</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                This message was flagged for single-view reading. When you are done, click <strong>Close & Clear</strong> below to wipe it from memory. Note: Web applications cannot prevent users from taking device screenshots or copying text.
              </p>
            </div>
          )}

          {/* Verification Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Decrypted Message</span>
                  <span className="text-xs font-mono font-normal text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    ✓ Valid Secret
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Fingerprint: <strong className="text-emerald-400">{decodeResult.fingerprint}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-white/[0.06]">
                AES-256-GCM Verified
              </span>
            </div>
          </div>

          {/* Safe Plaintext Container (Rendered purely as text to prevent XSS) */}
          <div className="relative group">
            <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto select-text font-sans shadow-inner">
              {decodeResult.plaintext}
            </div>

            <button
              onClick={handleCopyPlaintext}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-medium border border-white/10 flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Actions Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleCopyPlaintext}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all shadow-sm"
            >
              {copiedMessage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMessage ? 'Copied to Clipboard' : 'Copy Message'}</span>
            </button>

            <button
              onClick={handleClearAndReset}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 font-medium text-sm border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Close & Clear</span>
            </button>

            <button
              onClick={() => {
                setDecodeResult(null);
                setEmojiInput('');
                setPassword('');
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Decode Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

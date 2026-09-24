import React, { useState, useMemo } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Share2,
  ExternalLink,
  Flame,
  Clock,
  Fingerprint as FingerprintIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActiveTab } from '../components/layout/Navbar';
import { encodeSecret } from '../lib/payload';
import { estimateEmojiCount } from '../lib/emojiCodec';
import { validatePlaintextInput, MAX_MESSAGE_CHARACTERS } from '../lib/validation';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../hooks/useToast';
import { EncodeResult } from '../types';

interface EncodePageProps {
  onSelectTab: (tab: ActiveTab) => void;
  onSendToCompatibilityTest?: (emojiString: string, fingerprint: string) => void;
  onSendToDecoder?: (emojiString: string) => void;
}

export const EncodePage: React.FC<EncodePageProps> = ({
  onSelectTab,
  onSendToCompatibilityTest,
  onSendToDecoder
}) => {
  const toast = useToast();

  // Form states
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [decoyMode, setDecoyMode] = useState(false);
  const [viewOnce, setViewOnce] = useState(false);

  // Status & output states
  const [isEncoding, setIsEncoding] = useState(false);
  const [isEncoded, setIsEncoded] = useState(false);
  const [encodeResult, setEncodeResult] = useState<EncodeResult | null>(null);
  const [encodeError, setEncodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Real-time byte length and validation
  const validation = useMemo(() => {
    return validatePlaintextInput(message);
  }, [message]);

  const estimatedEmojis = useMemo(() => {
    if (!message) return 0;
    const byteLen = new TextEncoder().encode(message).length;
    return estimateEmojiCount(byteLen, isPasswordProtected);
  }, [message, isPasswordProtected]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsEncoded(false);
    setEncodeError(null);
  };

  const handleEncode = async () => {
    if (!message.trim()) {
      return;
    }

    if (!validation.isValid) {
      const err = validation.error || 'Unable to encode this message.';
      setEncodeError(err);
      toast.error(err);
      return;
    }

    if (isPasswordProtected && !password.trim()) {
      const err = 'Password protection is enabled, but no password was entered.';
      setEncodeError(err);
      toast.warning(err);
      return;
    }

    setIsEncoding(true);
    setIsEncoded(false);
    setEncodeError(null);

    try {
      const result = await encodeSecret({
        message,
        password: isPasswordProtected ? password : '',
        decoyMode,
        viewOnce
      });

      setEncodeResult(result);
      setIsEncoded(true);
      toast.success('Secret encoded successfully! 🔐', 'Ready to share');

      // Trigger a subtle confetti burst on desktop
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      } catch (e) {
        console.debug('Confetti skipped:', e);
      }
    } catch (err: any) {
      console.error('Encode error:', err);
      setEncodeResult(null);
      setIsEncoded(false);
      const msg = err?.message || 'Unable to encode this message.';
      setEncodeError(msg);
      toast.error(msg);
    } finally {
      setIsEncoding(false);
    }
  };

  const handleCopy = async () => {
    if (!encodeResult) return;
    const success = await copyToClipboard(encodeResult.emojiString);
    if (success) {
      setCopied(true);
      toast.success('Emoji secret copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleRegenerate = async () => {
    if (!encodeResult) return;
    await handleEncode();
  };

  const handleTestCompatibility = () => {
    if (!encodeResult) return;
    if (onSendToCompatibilityTest) {
      onSendToCompatibilityTest(encodeResult.emojiString, encodeResult.fingerprint);
    } else {
      onSelectTab('compatibility');
    }
  };

  const handleTestInDecoder = () => {
    if (!encodeResult) return;
    if (onSendToDecoder) {
      onSendToDecoder(encodeResult.emojiString);
    } else {
      onSelectTab('decode');
    }
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
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Encode Mode</span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-emerald-400" />
            Encode a Secret
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Messages are encrypted in your browser using AES-256-GCM before being converted to emojis.
          </p>
        </div>

        {/* Message Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="secret-message" className="font-medium text-slate-200">
              Secret Message
            </label>
            <div className="flex items-center gap-3 text-slate-400 font-mono">
              <span>
                {message.length} / {MAX_MESSAGE_CHARACTERS}
              </span>
              {estimatedEmojis > 0 && (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ~{estimatedEmojis} emojis
                </span>
              )}
            </div>
          </div>

          <textarea
            id="secret-message"
            rows={5}
            value={message}
            onChange={handleMessageChange}
            placeholder="Write your secret message here... (e.g. passwords, coordinates, confidential notes, private thoughts)"
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y leading-relaxed"
          />

          {validation.warning && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{validation.warning}</span>
            </div>
          )}
        </div>

        {/* Password Protection Section */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="password-toggle" className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="password-toggle"
                type="checkbox"
                checked={isPasswordProtected}
                onChange={(e) => {
                  setIsPasswordProtected(e.target.checked);
                  setIsEncoded(false);
                  setEncodeError(null);
                }}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-200">Password protected</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">PBKDF2 100K iterations</span>
          </div>

          {isPasswordProtected ? (
            <div className="pt-2 space-y-2 animate-fadeIn">
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsEncoded(false);
                    setEncodeError(null);
                  }}
                  placeholder="Enter a strong passphrase..."
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
              <p className="text-[11px] text-slate-400">
                🔒 The recipient will need this exact passphrase to decrypt the message. We cannot recover forgotten passwords.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 pt-1">
              Anyone who has this emoji secret can decode it.
            </p>
          )}
        </div>

        {/* Feature Toggles: Decoy Mode & View Once */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Decoy Mode Toggle */}
          <label
            className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between space-y-2 ${
              decoyMode
                ? 'bg-purple-950/20 border-purple-500/40 shadow-sm shadow-purple-950/30'
                : 'bg-slate-900/30 border-white/[0.06] hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${decoyMode ? 'text-purple-400' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-white">Decoy Mode</span>
              </div>
              <input
                type="checkbox"
                checked={decoyMode}
                onChange={(e) => {
                  setDecoyMode(e.target.checked);
                  setIsEncoded(false);
                }}
                className="w-4 h-4 rounded border-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900 bg-slate-800"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Disguises the secret with conversational emoji spam. The actual payload remains securely encrypted.
            </p>
          </label>

          {/* View Once Toggle */}
          <label
            className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between space-y-2 ${
              viewOnce
                ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-950/30'
                : 'bg-slate-900/30 border-white/[0.06] hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${viewOnce ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold text-white">View Once</span>
              </div>
              <input
                type="checkbox"
                checked={viewOnce}
                onChange={(e) => {
                  setViewOnce(e.target.checked);
                  setIsEncoded(false);
                }}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 bg-slate-800"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instructs the decoder to display with a single-view alert and immediate memory purge upon closing.
            </p>
          </label>
        </div>

        {/* Error Feedback Display */}
        {encodeError && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-rose-300">Unable to encode this message.</p>
              <p className="text-slate-300 text-xs">{encodeError}</p>
            </div>
          </div>
        )}

        {/* Encode Action Button */}
        <button
          onClick={handleEncode}
          disabled={isEncoding || !message.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {isEncoding ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Encoding...</span>
            </>
          ) : isEncoded ? (
            <>
              <Check className="w-5 h-5 text-slate-950" />
              <span>Encoded ✓</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Encode Secret</span>
            </>
          )}
        </button>
      </div>

      {/* Result Output Card */}
      {encodeResult && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl shadow-emerald-950/30 space-y-6 animate-slideUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Your Encrypted Emoji Secret</h3>
                <p className="text-xs text-slate-400">Copy and share through any messaging platform.</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {encodeResult.hasPassword && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Password Protected
                </span>
              )}
              {encodeResult.viewOnce && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  View Once
                </span>
              )}
              {encodeResult.decoyMode && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Decoy Mode
                </span>
              )}
            </div>
          </div>

          {/* Large Copyable Emoji Box */}
          <div className="relative group">
            <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 max-h-56 overflow-y-auto font-mono text-lg sm:text-xl break-all emoji-font tracking-widest leading-relaxed select-all shadow-inner">
              {encodeResult.emojiString}
            </div>

            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Secret</span>
                </>
              )}
            </button>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Emoji Secret'}</span>
            </button>

            <button
              onClick={handleRegenerate}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Regenerate IV/Salt</span>
            </button>

            <button
              onClick={handleTestCompatibility}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Test Compatibility</span>
            </button>
          </div>

          {/* Fingerprint Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400">
                <FingerprintIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Cryptographic Secret Fingerprint</p>
                <p className="text-sm font-mono font-bold text-emerald-400 tracking-wider">
                  {encodeResult.fingerprint}
                </p>
              </div>
            </div>

            <button
              onClick={handleTestInDecoder}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium py-1 self-start sm:self-auto"
            >
              <span>Test in Decoder</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

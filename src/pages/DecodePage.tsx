import React, { useState, useEffect } from 'react';
import { Copy, ArrowLeft, Check } from 'lucide-react';
import { ActiveTab } from '../components/layout/Navbar';
import { decodeSecret } from '../lib/payload';
import { copyToClipboard } from '../lib/clipboard';
import { DecodeResult } from '../types';

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
  const [emojiInput, setEmojiInput] = useState(prefillEmojiString);
  const [password, setPassword] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  useEffect(() => {
    if (prefillEmojiString) {
      setEmojiInput(prefillEmojiString);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillEmojiString, onClearPrefill]);

  const handleDecode = async () => {
    if (!emojiInput.trim()) return;

    setIsDecoding(true);
    setDecodeError(null);

    try {
      const result = await decodeSecret({
        emojiString: emojiInput.trim(),
        password
      });

      setDecodeResult(result);
    } catch (err: any) {
      console.error('Decode error:', err);
      setDecodeResult(null);
      
      let errMsg = "We couldn't recognize this emoji message.";
      if (err.code === 'WRONG_PASSWORD_OR_CORRUPT') {
        errMsg = "That password doesn't work, or the emoji message may have been changed.";
      } else if (err.code === 'CORRUPT_PAYLOAD' || err.code === 'INVALID_HEADER') {
        errMsg = "This emoji message looks incomplete or changed. Try copying it again.";
      } else if (err.code === 'PASSWORD_REQUIRED') {
        errMsg = "This message needs a password. Please enter it below and try again.";
      }
      
      setDecodeError(errMsg);
    } finally {
      setIsDecoding(false);
    }
  };

  const handleCopyPlaintext = async () => {
    if (!decodeResult) return;
    const ok = await copyToClipboard(decodeResult.plaintext);
    if (ok) {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  return (
    <div className="max-w-[650px] mx-auto px-5 sm:px-6 pt-10 pb-20 space-y-10 animate-fade-in">
      {/* Back Button */}
      <div>
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-1.5 text-[15px] font-medium text-brand-secondary hover:text-brand-text transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-[32px] sm:text-[38px] font-bold text-brand-text">Open a Message</h1>
        <p className="text-brand-secondary text-[17px]">Paste the emoji message you received.</p>
      </div>

      {!decodeResult ? (
        <div className="space-y-8">
          <div className="space-y-3">
            <textarea
              rows={5}
              value={emojiInput}
              onChange={(e) => {
                setEmojiInput(e.target.value);
                setDecodeError(null);
              }}
              placeholder="Paste emojis here..."
              className="w-full px-5 py-4 rounded-2xl bg-white border border-brand-gold/40 text-brand-text placeholder-brand-secondary/60 text-[16px] font-mono emoji-font tracking-wider focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all resize-y shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[15px] font-semibold text-brand-text">
              Password (only if required)
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setDecodeError(null);
              }}
              placeholder="Enter password..."
              className="w-full max-w-[320px] px-4 py-3 rounded-xl bg-white border border-brand-gold/40 text-brand-text text-[15px] focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            />
          </div>

          {decodeError && (
            <div className="text-brand-darkred text-[15px] font-medium pl-1 animate-fade-in">
              {decodeError}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleDecode}
              disabled={isDecoding || !emojiInput.trim()}
              className="w-full h-[56px] rounded-[14px] bg-brand-red hover:bg-brand-darkred disabled:opacity-50 text-white font-medium text-[17px] border border-brand-gold/50 shadow-subtle hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isDecoding ? 'Opening...' : 'Open Message'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h3 className="text-[22px] font-bold text-brand-text">Here's the message</h3>
          </div>

          <div className="p-5 sm:p-6 rounded-[16px] bg-white border border-brand-gold/40 text-brand-text text-[17px] leading-relaxed whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto select-text font-sans shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            {decodeResult.plaintext}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleCopyPlaintext}
              className="w-full sm:flex-1 flex items-center justify-center gap-2.5 px-6 h-[56px] rounded-[14px] bg-brand-red hover:bg-brand-darkred text-white font-medium text-[16px] border border-brand-gold/50 shadow-subtle hover:-translate-y-[1px] active:scale-[0.98] transition-all"
            >
              {copiedMessage ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span>{copiedMessage ? 'Copied!' : 'Copy Message'}</span>
            </button>

            <button
              onClick={() => {
                setDecodeResult(null);
                setEmojiInput('');
                setPassword('');
                setCopiedMessage(false);
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 h-[56px] rounded-[14px] bg-white hover:bg-slate-50 text-brand-text font-medium text-[16px] border border-brand-gold/50 shadow-subtle hover:-translate-y-[1px] active:scale-[0.98] transition-all"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

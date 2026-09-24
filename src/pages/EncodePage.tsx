import React, { useState } from 'react';
import { Copy, ArrowLeft, Check } from 'lucide-react';
import { ActiveTab } from '../components/layout/Navbar';
import { encodeSecret } from '../lib/payload';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../hooks/useToast';
import { EncodeResult } from '../types';

interface EncodePageProps {
  onSelectTab: (tab: ActiveTab) => void;
  onSendToCompatibilityTest?: (emojiString: string, fingerprint: string) => void;
  onSendToDecoder?: (emojiString: string) => void;
}

export const EncodePage: React.FC<EncodePageProps> = ({ onSelectTab }) => {
  const toast = useToast();

  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodeResult, setEncodeResult] = useState<EncodeResult | null>(null);
  const [encodeError, setEncodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEncode = async () => {
    if (!message.trim()) return;

    if (isPasswordProtected && !password.trim()) {
      setEncodeError('Please enter a password.');
      return;
    }

    setIsEncoding(true);
    setEncodeError(null);

    try {
      const result = await encodeSecret({
        message,
        password: isPasswordProtected ? password : ''
      });
      setEncodeResult(result);
    } catch (err: any) {
      console.error('Encode error:', err);
      setEncodeResult(null);
      setEncodeError('Unable to encode this message.');
    } finally {
      setIsEncoding(false);
    }
  };

  const handleCopy = async () => {
    if (!encodeResult) return;
    const success = await copyToClipboard(encodeResult.emojiString);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Failed to copy to clipboard.');
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
        <h1 className="text-[32px] sm:text-[38px] font-bold text-brand-text">Hide a Message</h1>
        <p className="text-brand-secondary text-[17px]">Write something you'd like to keep private.</p>
      </div>

      {!encodeResult ? (
        <div className="space-y-8">
          <div className="space-y-3">
            <label htmlFor="secret-message" className="block text-[15px] font-semibold text-brand-text">
              Your message
            </label>
            <textarea
              id="secret-message"
              rows={6}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setEncodeError(null);
              }}
              placeholder="Type your message..."
              className="w-full px-5 py-4 rounded-2xl bg-white border border-brand-gold/40 text-brand-text placeholder-brand-secondary/60 text-[16px] focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all resize-y shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPasswordProtected}
                onChange={(e) => {
                  setIsPasswordProtected(e.target.checked);
                  setEncodeError(null);
                }}
                className="w-[20px] h-[20px] rounded border-brand-gold/40 text-brand-red focus:ring-brand-red cursor-pointer"
              />
              <span className="text-[16px] font-semibold text-brand-text">Password (optional)</span>
            </label>

            {isPasswordProtected ? (
              <div className="space-y-2 animate-fade-in pl-8">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setEncodeError(null);
                  }}
                  placeholder="Enter password..."
                  className="w-full max-w-[320px] px-4 py-3 rounded-xl bg-white border border-brand-gold/40 text-brand-text text-[15px] focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                />
                <p className="text-[14px] text-brand-secondary">
                  You'll need this password to open the message.
                </p>
              </div>
            ) : (
              <div className="pl-8">
                <p className="text-[14px] text-brand-secondary">
                  Anyone with the emoji message can open it without a password.
                </p>
              </div>
            )}
          </div>

          {encodeError && (
            <div className="text-brand-darkred text-[15px] font-medium pl-1">
              {encodeError}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleEncode}
              disabled={isEncoding || !message.trim()}
              className="w-full h-[56px] rounded-[14px] bg-brand-red hover:bg-brand-darkred disabled:opacity-50 text-white font-medium text-[17px] border border-brand-gold/50 shadow-subtle hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isEncoding ? 'Creating...' : 'Create Emoji Message'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h3 className="text-[22px] font-bold text-brand-text">Your emoji message is ready.</h3>
          </div>

          <div className="p-5 sm:p-6 rounded-[16px] bg-white border border-brand-gold/40 max-h-[300px] overflow-y-auto font-mono text-[20px] break-all emoji-font tracking-widest leading-relaxed select-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            {encodeResult.emojiString}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleCopy}
              className="w-full sm:flex-1 flex items-center justify-center gap-2.5 px-6 h-[56px] rounded-[14px] bg-brand-red hover:bg-brand-darkred text-white font-medium text-[16px] border border-brand-gold/50 shadow-subtle hover:-translate-y-[1px] active:scale-[0.98] transition-all"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? 'Copied!' : 'Copy Emoji Message'}</span>
            </button>

            <button
              onClick={() => {
                setEncodeResult(null);
                setMessage('');
                setPassword('');
                setIsPasswordProtected(false);
                setCopied(false);
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 h-[56px] rounded-[14px] bg-white hover:bg-slate-50 text-brand-text font-medium text-[16px] border border-brand-gold/50 shadow-subtle hover:-translate-y-[1px] active:scale-[0.98] transition-all"
            >
              <span>Create Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

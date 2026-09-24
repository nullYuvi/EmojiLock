import React, { useState } from 'react';
import { Lock, Unlock, Shield, Zap, Sparkles, Check, ArrowRight, EyeOff, KeyRound, Copy } from 'lucide-react';
import { ActiveTab } from '../components/layout/Navbar';
import { encodeSecret, decodeSecret } from '../lib/payload';
import { useToast } from '../hooks/useToast';
import { copyToClipboard } from '../lib/clipboard';

interface HomePageProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab }) => {
  const toast = useToast();
  const [demoInput, setDemoInput] = useState('Meet me at the coffee shop at 5 ☕');
  const [demoPassword, setDemoPassword] = useState('');
  const [demoEmojiOutput, setDemoEmojiOutput] = useState('');
  const [demoFingerprint, setDemoFingerprint] = useState('');
  const [isDemoEncoding, setIsDemoEncoding] = useState(false);
  const [demoDecrypted, setDemoDecrypted] = useState<string | null>(null);

  const handleRunDemo = async () => {
    if (!demoInput.trim()) return;
    setIsDemoEncoding(true);
    setDemoDecrypted(null);
    try {
      const res = await encodeSecret({
        message: demoInput,
        password: demoPassword || undefined
      });
      setDemoEmojiOutput(res.emojiString);
      setDemoFingerprint(res.fingerprint);
    } catch (err: any) {
      console.error('Home demo encode failed:', err);
      toast.error(err.message || 'Failed to encode');
    } finally {
      setIsDemoEncoding(false);
    }
  };

  const handleTestDecodeDemo = async () => {
    if (!demoEmojiOutput) return;
    try {
      const res = await decodeSecret({
        emojiString: demoEmojiOutput,
        password: demoPassword || undefined
      });
      setDemoDecrypted(res.plaintext);
      toast.success('Successfully decrypted secret in demo!');
    } catch (err: any) {
      console.error('Home demo decode failed:', err);
      toast.error(err.message || 'Failed to decode');
    }
  };

  const handleCopyDemoEmojis = async () => {
    if (!demoEmojiOutput) return;
    const ok = await copyToClipboard(demoEmojiOutput);
    if (ok) {
      toast.success('Emoji secret copied to clipboard!');
    }
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-7 pt-6 sm:pt-12">
        {/* Privacy Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium backdrop-blur-md shadow-sm">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Server Storage • 100% In-Browser Crypto</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Hide a secret in <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              plain sight.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Encrypt any sensitive message into an innocuous string of emojis. Share it safely over WhatsApp, Discord, Telegram, SMS, or anywhere on the web.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
          <button
            onClick={() => onSelectTab('encode')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-semibold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Lock className="w-5 h-5 text-slate-950" />
            <span>Encode Secret</span>
            <ArrowRight className="w-4 h-4 ml-1 text-slate-950" />
          </button>

          <button
            onClick={() => onSelectTab('decode')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-medium text-base border border-white/10 hover:border-emerald-500/30 shadow-lg shadow-black/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 backdrop-blur-md"
          >
            <Unlock className="w-5 h-5 text-cyan-400" />
            <span>Decode Secret</span>
          </button>
        </div>

        {/* Privacy statement */}
        <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Your message never leaves this browser.
        </p>
      </section>

      {/* Interactive Quick Try / Live Playground */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Live Interactive Playground
              </h2>
              <p className="text-xs text-slate-400">Experience client-side emoji encryption in real time.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 self-start sm:self-auto">
              AES-256-GCM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Side */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                1. Plaintext Message
              </label>
              <textarea
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Type a secret message..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
              />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={demoPassword}
                  onChange={(e) => setDemoPassword(e.target.value)}
                  placeholder="Optional password"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleRunDemo}
                  disabled={isDemoEncoding}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shrink-0 transition-colors shadow-sm"
                >
                  {isDemoEncoding ? 'Encrypting...' : 'Encode'}
                </button>
              </div>
            </div>

            {/* Output Side */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">
                  2. Generated Emoji Secret
                </label>
                {demoFingerprint && (
                  <span className="text-[11px] font-mono text-slate-400">
                    FP: <strong className="text-emerald-400">{demoFingerprint}</strong>
                  </span>
                )}
              </div>

              <div className="min-h-[86px] p-3 rounded-xl bg-slate-950/70 border border-white/10 font-mono text-sm break-all flex flex-col justify-between">
                {demoEmojiOutput ? (
                  <div className="emoji-font text-base tracking-widest leading-relaxed select-all">
                    {demoEmojiOutput}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic flex items-center justify-center h-full">
                    Click "Encode" to produce an emoji secret string
                  </div>
                )}
              </div>

              {demoEmojiOutput && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyDemoEmojis}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-200 border border-white/10 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={handleTestDecodeDemo}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-medium text-cyan-300 border border-cyan-500/30 transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Test Decrypt
                  </button>
                </div>
              )}
            </div>
          </div>

          {demoDecrypted && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-300">Decrypted Plaintext:</span>{' '}
                <span className="text-slate-100 font-sans">{demoDecrypted}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How EmojLock Works</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Three simple steps to impenetrable, steganographic messaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] space-y-4 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-emerald-400">STEP 01</div>
              <h3 className="text-lg font-semibold text-white">Encrypt Locally</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your message is converted to UTF-8 and encrypted in-browser with AES-256-GCM and PBKDF2-SHA-256 key derivation.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] space-y-4 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <span className="text-xl">🚀</span>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-cyan-400">STEP 02</div>
              <h3 className="text-lg font-semibold text-white">Curated Emoji Alphabet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Binary ciphertext is mapped onto 256 single-codepoint, non-ZWJ emojis crafted to survive messaging app copy-pasting.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] space-y-4 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Unlock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-purple-400">STEP 03</div>
              <h3 className="text-lg font-semibold text-white">Zero-Knowledge Decode</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The recipient pastes the emoji string into EmojLock to instantly verify the SHA-256 fingerprint and decrypt the plaintext.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Privacy & Architecture Features */}
      <section className="glass-panel rounded-3xl p-8 border border-white/[0.08] space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white">Privacy Engineered by Design</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            No accounts. No cookies. No server-side processing. Every operation is executed in your local JavaScript environment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.05] space-y-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">AES-256-GCM</h4>
            <p className="text-xs text-slate-400">
              Authenticated symmetric encryption with a 128-bit integrity tag and AAD header validation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.05] space-y-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">PBKDF2-SHA-256</h4>
            <p className="text-xs text-slate-400">
              Key stretching with 100,000 iterations to withstand high-speed offline dictionary attacks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.05] space-y-2">
            <EyeOff className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Decoy Mode</h4>
            <p className="text-xs text-slate-400">
              Camouflages your secret as conversational emoji spam while keeping payload data securely sealed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.05] space-y-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">View Once Mode</h4>
            <p className="text-xs text-slate-400">
              Single-view workflow that scrubs sensitive memory state immediately upon dismissal.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

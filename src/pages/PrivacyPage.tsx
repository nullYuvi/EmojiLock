import React from 'react';
import {
  Cpu,
  Database,
  KeyRound,
  Fingerprint,
  AlertTriangle,
  ArrowLeft,
  FileCode
} from 'lucide-react';
import { ActiveTab } from '../components/layout/Navbar';

interface PrivacyPageProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onSelectTab }) => {
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-10 animate-fadeIn">
      {/* Header */}
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
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            Zero-Knowledge Architecture
          </span>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Privacy & Security Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          EmojLock was designed under a strict zero-trust model: your secret data never leaves your device, and no server ever receives your plaintext, ciphertexts, or passphrases.
        </p>
      </div>

      {/* Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">100% In-Browser Cryptography</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All encryption and decryption operations leverage the browser's native <code>crypto.subtle</code> Web Crypto API. No remote API calls or background telemetry are ever initiated.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Zero Storage & Zero Databases</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Secrets are never written to <code>localStorage</code>, <code>sessionStorage</code>, or IndexedDB. Sensitive memory state is wiped when you clear or reload the page.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">PBKDF2-SHA-256 Key Stretching</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When a password is provided, keys are derived using PBKDF2 with SHA-256 and 100,000 iterations along with a 128-bit cryptographically random salt.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Fingerprint className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">SHA-256 Secret Fingerprints</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every payload produces a unique cryptographic fingerprint (e.g. <code>7F-A2-91-C4</code>), allowing parties to verify data integrity out-of-band.
          </p>
        </div>
      </div>

      {/* Technical Deep Dive */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-400" />
          Cryptographic Specifications
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] space-y-2">
            <h4 className="font-semibold text-emerald-400">AES-256-GCM Authenticated Encryption</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We utilize AES in Galois/Counter Mode (GCM) with 256-bit symmetric keys. GCM provides confidentiality while simultaneously ensuring data integrity and authenticity via a 128-bit authentication tag. Any tampering with ciphertext or header metadata immediately fails authentication.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] space-y-2">
            <h4 className="font-semibold text-cyan-400">Curated 256-Emoji Alphabet</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard Unicode emojis often contain multi-codepoint Zero-Width Joiner (ZWJ) sequences, variation selectors, or skin tone modifiers that frequently break when copied between different operating systems. EmojLock uses a curated set of 256 single-codepoint Unicode emojis, mapping 1 byte directly to 1 distinct emoji.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] space-y-2">
            <h4 className="font-semibold text-purple-400">Versioned Binary Header</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Payloads contain a 4-byte signature (<code>EMJL</code>), a version byte, flags, payload length, a 16-byte salt, and a 12-byte initialization vector (IV) generated with <code>crypto.getRandomValues()</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Limitations & Disclaimers */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/[0.06] space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Honest Security Boundaries & Limitations
        </h2>

        <ul className="space-y-3 text-xs text-slate-400 leading-relaxed list-disc list-inside">
          <li>
            <strong className="text-slate-200">No software can prevent OS-level screenshots:</strong> View-Once mode cleanses web memory upon dismissal, but web applications cannot prevent recipients from taking device screenshots, photos, or manual copies.
          </li>
          <li>
            <strong className="text-slate-200">Third-party platform alterations:</strong> Some messaging apps or rich text editors modify Unicode characters. Always check the secret fingerprint if you suspect a message was modified in transit.
          </li>
          <li>
            <strong className="text-slate-200">Password strength:</strong> If you use password protection, choose a strong passphrase. While 100,000 PBKDF2 iterations protect against simple attacks, short or common dictionary words remain vulnerable to brute-force.
          </li>
          <li>
            <strong className="text-slate-200">No backdoors or password recovery:</strong> Because everything is encrypted client-side with zero knowledge, forgotten passwords cannot be recovered by anyone.
          </li>
        </ul>
      </div>
    </div>
  );
};

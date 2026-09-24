import React from 'react';
import { Shield } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#05070a]/90 backdrop-blur-md py-10 mt-20 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="text-sm">🔐</span>
            </div>
            <div>
              <p className="font-semibold text-white text-sm">EMOJLOCK</p>
              <p className="text-xs text-slate-400">Hide a secret in plain sight.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => onSelectTab('encode')}
              className="hover:text-emerald-400 transition-colors"
            >
              Encode
            </button>
            <button
              onClick={() => onSelectTab('decode')}
              className="hover:text-cyan-400 transition-colors"
            >
              Decode
            </button>
            <button
              onClick={() => onSelectTab('compatibility')}
              className="hover:text-purple-400 transition-colors"
            >
              Compatibility
            </button>
            <button
              onClick={() => onSelectTab('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Architecture
            </button>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right font-mono">
            <p className="flex items-center justify-center md:justify-end gap-1 text-emerald-400/90 font-sans">
              <Shield className="w-3.5 h-3.5 inline text-emerald-400" />
              100% Client-Side Web Crypto
            </p>
            <p className="text-[11px] mt-0.5">Zero telemetry. Zero server storage.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} EmojLock. Built for true end-to-end user privacy.</p>
          <p className="text-slate-500">
            PBKDF2-SHA-256 • AES-256-GCM • SHA-256 Fingerprints
          </p>
        </div>
      </div>
    </footer>
  );
};

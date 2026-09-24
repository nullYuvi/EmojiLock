import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldCheck, WifiOff, Menu, X, RefreshCw } from 'lucide-react';

export type ActiveTab = 'home' | 'encode' | 'decode' | 'compatibility' | 'privacy';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#07090e]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
          aria-label="EmojLock Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="text-base select-none">🔐</span>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">EMOJLOCK</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v1.0
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5 hidden sm:inline-block">Client-Side Privacy</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/[0.06]" aria-label="Main Navigation">
          <button
            onClick={() => handleNavClick('encode')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'encode'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            Encode
          </button>

          <button
            onClick={() => handleNavClick('decode')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'decode'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Unlock className="w-4 h-4 text-cyan-400" />
            Decode
          </button>

          <button
            onClick={() => handleNavClick('compatibility')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'compatibility'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-purple-400" />
            Compatibility
          </button>

          <button
            onClick={() => handleNavClick('privacy')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'privacy'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            Privacy & Security
          </button>
        </nav>

        {/* Status Indicators & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          {/* Offline / Online Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border bg-slate-900/80"
            title={isOnline ? "App is online (all crypto runs strictly in your browser)" : "App is offline (100% functional via PWA shell)"}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">Local Only</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">Offline Ready</span>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-white/[0.08] focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#07090e]/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fadeIn">
          <button
            onClick={() => handleNavClick('encode')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-left transition-colors ${
              activeTab === 'encode'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Encode Secret</span>
          </button>

          <button
            onClick={() => handleNavClick('decode')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-left transition-colors ${
              activeTab === 'decode'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <Unlock className="w-5 h-5 text-cyan-400" />
            <span>Decode Secret</span>
          </button>

          <button
            onClick={() => handleNavClick('compatibility')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-left transition-colors ${
              activeTab === 'compatibility'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <RefreshCw className="w-5 h-5 text-purple-400" />
            <span>Compatibility Test</span>
          </button>

          <button
            onClick={() => handleNavClick('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-left transition-colors ${
              activeTab === 'privacy'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <span>Privacy & Security</span>
          </button>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between px-2 text-xs text-slate-400">
            <span>Zero server requests • 100% In-Browser</span>
            <span className="font-mono text-[11px] text-emerald-400">AES-256-GCM</span>
          </div>
        </div>
      )}
    </header>
  );
};

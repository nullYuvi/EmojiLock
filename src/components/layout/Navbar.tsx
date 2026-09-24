import React, { useState } from 'react';
import { Menu, X, Lock } from 'lucide-react';

export type ActiveTab = 'home' | 'encode' | 'decode' | 'compatibility' | 'privacy';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItemClass = (tab: ActiveTab) => 
    `text-[15px] font-medium transition-colors ${
      activeTab === tab 
        ? 'text-brand-red' 
        : 'text-brand-secondary hover:text-brand-text'
    }`;

  const mobileNavItemClass = (tab: ActiveTab) =>
    `w-full text-left px-4 py-3.5 text-base font-medium transition-colors ${
      activeTab === tab
        ? 'text-brand-red bg-brand-palered'
        : 'text-brand-secondary hover:text-brand-text hover:bg-black/5'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-brand-gold/30">
      <div className="max-w-[1100px] mx-auto px-5 h-[64px] flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-1.5 focus:outline-none py-1"
          aria-label="EmojiLock Home"
        >
          <Lock className="w-4 h-4 text-brand-red" strokeWidth={2.5} />
          <span className="font-bold text-[19px] tracking-tight">
            <span className="text-brand-text">Emoji</span>
            <span className="text-brand-red">Lock</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          <button onClick={() => {
            handleNavClick('home');
            setTimeout(() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }} className={navItemClass('home')}>
            How it works
          </button>
          <button onClick={() => handleNavClick('privacy')} className={navItemClass('privacy')}>
            Privacy
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden -mr-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-brand-secondary hover:text-brand-text focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-gold/20 bg-white px-2 py-3 shadow-sm animate-fade-in">
          <button onClick={() => {
            handleNavClick('home');
            setTimeout(() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }} className={mobileNavItemClass('home')}>
            How it works
          </button>
          <button onClick={() => handleNavClick('privacy')} className={mobileNavItemClass('privacy')}>
            Privacy
          </button>
        </div>
      )}
    </header>
  );
};

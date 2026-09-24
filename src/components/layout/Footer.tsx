import React from 'react';
import { ActiveTab } from './Navbar';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full border-t border-brand-gold/20 bg-white py-10 mt-auto">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[14px]">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-bold text-brand-text text-[15px]">EmojiLock</p>
          <p className="text-brand-secondary">Private messages, made from emojis.</p>
        </div>

        <div className="flex items-center gap-6 text-brand-secondary font-medium">
          <button
            onClick={() => onSelectTab('privacy')}
            className="hover:text-brand-text transition-colors focus:outline-none"
          >
            Privacy
          </button>
          <button
            onClick={() => {
              onSelectTab('home');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-brand-text transition-colors focus:outline-none"
          >
            How it works
          </button>
          <a
            href="https://github.com/emojlock/emojlock"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-text transition-colors focus:outline-none"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

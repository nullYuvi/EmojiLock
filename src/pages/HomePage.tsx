import React from 'react';
import { ActiveTab } from '../components/layout/Navbar';
import { Lock, Unlock, ArrowDown } from 'lucide-react';

interface HomePageProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab }) => {
  return (
    <div className="max-w-[1100px] mx-auto px-5 sm:px-6 pt-12 sm:pt-20 pb-20 space-y-24">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-12">
        <div className="space-y-5 max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <Lock className="w-5 h-5 text-brand-gold" strokeWidth={2.5} />
          </div>
          <h1 className="text-[38px] sm:text-[44px] md:text-[64px] font-bold tracking-tight leading-[1.1] text-brand-text">
            Hide a secret <br />
            <span className="text-brand-red">in emojis.</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-secondary font-medium">
            Write a message, turn it into emojis, and share it.
          </p>
        </div>

        {/* Hero Visual */}
        <div className="flex flex-col items-center justify-center gap-3 py-2 select-none w-full max-w-sm mx-auto">
          <div className="w-full bg-white border border-brand-gold/40 shadow-subtle rounded-xl p-4 text-brand-text text-[15px] font-medium text-left">
            Meet me at 7 ❤️
          </div>
          
          <div className="text-brand-red my-1">
            <ArrowDown className="w-5 h-5" strokeWidth={2.5} />
          </div>

          <div className="w-full bg-white border border-brand-gold/40 shadow-subtle rounded-xl p-4 text-[22px] tracking-[0.2em] text-left">
            😀 🦊 🌙 🚀 🍀
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto pt-2">
          <button
            onClick={() => onSelectTab('encode')}
            className="w-full flex items-center justify-center gap-2.5 px-8 h-[56px] rounded-[14px] bg-brand-red hover:bg-brand-darkred text-white font-medium text-[17px] border border-brand-gold/50 shadow-subtle hover:-translate-y-[1px] active:scale-[0.98] transition-all"
          >
            <Lock className="w-5 h-5" />
            <span>Hide a Message</span>
          </button>

          <button
            onClick={() => onSelectTab('decode')}
            className="w-full flex items-center justify-center gap-2.5 px-8 h-[56px] rounded-[14px] bg-white hover:bg-slate-50 text-brand-text font-medium text-[17px] border border-brand-gold/50 shadow-subtle hover:-translate-y-[1px] active:scale-[0.98] transition-all"
          >
            <Unlock className="w-5 h-5 text-brand-secondary" />
            <span>Open a Message</span>
          </button>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-4xl mx-auto pt-8">
        <h2 className="text-2xl font-bold text-center text-brand-text mb-10">How it works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-gold/40"></div>
            <div className="text-sm font-bold text-brand-secondary/60 mb-2">01</div>
            <h3 className="text-lg font-semibold text-brand-text mb-1.5">Write</h3>
            <p className="text-brand-secondary text-[15px]">Type your message.</p>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-gold/40"></div>
            <div className="text-sm font-bold text-brand-secondary/60 mb-2">02</div>
            <h3 className="text-lg font-semibold text-brand-text mb-1.5">Turn it into emojis</h3>
            <p className="text-brand-secondary text-[15px]">Create your private emoji message.</p>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-gold/40"></div>
            <div className="text-sm font-bold text-brand-secondary/60 mb-2">03</div>
            <h3 className="text-lg font-semibold text-brand-text mb-1.5">Share</h3>
            <p className="text-brand-secondary text-[15px]">Copy it and send it anywhere.</p>
          </div>
        </div>
      </section>

      {/* Privacy Message */}
      <section className="max-w-md mx-auto pt-10 pb-4">
        <div className="bg-brand-palered rounded-2xl p-6 border border-brand-red/10 flex flex-col items-center text-center space-y-2">
          <Lock className="w-5 h-5 text-brand-red mb-1" />
          <p className="text-[17px] font-semibold text-brand-text">Your message stays on your device.</p>
          <p className="text-[14px] text-brand-secondary">Nothing is stored on our servers.</p>
        </div>
      </section>
    </div>
  );
};

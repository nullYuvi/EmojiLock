import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { EncodePage } from './pages/EncodePage';
import { DecodePage } from './pages/DecodePage';
import { CompatibilityPage } from './pages/CompatibilityPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { EmojiConstellation } from './components/ui/EmojiConstellation';
import { ToastProvider } from './hooks/useToast';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [decoderPrefill, setDecoderPrefill] = useState('');
  const [compatPrefillEmoji, setCompatPrefillEmoji] = useState('');
  const [compatPrefillFp, setCompatPrefillFp] = useState('');

  // Register PWA service worker if supported
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.debug('Service worker registration skipped:', err);
        });
      });
    }
  }, []);

  const handleSendToDecoder = (emojiString: string) => {
    setDecoderPrefill(emojiString);
    setActiveTab('decode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendToCompat = (emojiString: string, fingerprint: string) => {
    setCompatPrefillEmoji(emojiString);
    setCompatPrefillFp(fingerprint);
    setActiveTab('compatibility');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 relative overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
        {/* Animated Constellation Background */}
        <EmojiConstellation />

        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Active Page View */}
        <main className="flex-1">
          {activeTab === 'home' && <HomePage onSelectTab={setActiveTab} />}
          {activeTab === 'encode' && (
            <EncodePage
              onSelectTab={setActiveTab}
              onSendToDecoder={handleSendToDecoder}
              onSendToCompatibilityTest={handleSendToCompat}
            />
          )}
          {activeTab === 'decode' && (
            <DecodePage
              onSelectTab={setActiveTab}
              prefillEmojiString={decoderPrefill}
              onClearPrefill={() => setDecoderPrefill('')}
            />
          )}
          {activeTab === 'compatibility' && (
            <CompatibilityPage
              onSelectTab={setActiveTab}
              initialEmojiString={compatPrefillEmoji}
              initialFingerprint={compatPrefillFp}
            />
          )}
          {activeTab === 'privacy' && <PrivacyPage onSelectTab={setActiveTab} />}
        </main>

        {/* Global Footer */}
        <Footer onSelectTab={setActiveTab} />
      </div>
    </ToastProvider>
  );
};

export default App;

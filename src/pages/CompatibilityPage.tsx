import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { ActiveTab } from '../components/layout/Navbar';
import { checkPayloadCompatibility } from '../lib/compatibility';
import { CompatibilityCheckResult } from '../types';

interface CompatibilityPageProps {
  onSelectTab: (tab: ActiveTab) => void;
  initialEmojiString?: string;
  initialFingerprint?: string;
}

export const CompatibilityPage: React.FC<CompatibilityPageProps> = ({
  onSelectTab,
  initialEmojiString = '',
}) => {
  const [pastedString, setPastedString] = useState(initialEmojiString);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CompatibilityCheckResult | null>(null);

  useEffect(() => {
    if (initialEmojiString) {
      setPastedString(initialEmojiString);
    }
  }, [initialEmojiString]);

  const handleRunCheck = async () => {
    if (!pastedString.trim()) return;

    setIsChecking(true);
    try {
      const res = await checkPayloadCompatibility(pastedString);
      setCheckResult(res);
    } catch (err: any) {
      console.error('Compatibility check error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-8 animate-fade-in">
      <div>
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-1.5 text-sm text-brand-secondary hover:text-brand-text transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-brand-text">Check Your Emoji Message</h1>
        <p className="text-brand-secondary text-base">
          Some apps may change copied text. Use this test to make sure your emoji message arrives unchanged.
        </p>
      </div>

      <div className="bg-white rounded-[18px] p-6 sm:p-8 border border-brand-gold/40 shadow-sm space-y-6">
        <textarea
          rows={4}
          value={pastedString}
          onChange={(e) => {
            setPastedString(e.target.value);
            setCheckResult(null);
          }}
          placeholder="Paste emojis here to test..."
          className="w-full px-4 py-3.5 rounded-xl bg-brand-warm/50 border border-brand-gold/40 text-brand-text placeholder-brand-secondary/70 text-base font-mono emoji-font focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all resize-y"
        />

        <button
          onClick={handleRunCheck}
          disabled={isChecking || !pastedString.trim()}
          className="w-full py-4 rounded-[14px] bg-brand-red hover:bg-brand-darkred disabled:opacity-60 text-white font-semibold text-lg border border-brand-gold/50 shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <span>Check Message</span>
          )}
        </button>

        {checkResult && (
          <div className="mt-6 p-6 rounded-[14px] border border-brand-gold/30 bg-brand-warm space-y-4">
            <h3 className="text-lg font-bold text-brand-text flex items-center justify-between">
              <span>Result</span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${
                checkResult.passed
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-brand-darkred border-brand-red/30'
              }`}>
                {checkResult.passed ? '✓ Looks good' : '⚠ Something changed'}
              </span>
            </h3>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-brand-secondary hover:text-brand-text">
                Technical details
              </summary>
              <div className="mt-3 p-4 rounded-xl bg-white border border-brand-gold/20 text-sm text-brand-secondary leading-relaxed font-mono">
                {checkResult.details}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

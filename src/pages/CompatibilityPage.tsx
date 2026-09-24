import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ClipboardPaste,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { ActiveTab } from '../components/layout/Navbar';
import { checkPayloadCompatibility } from '../lib/compatibility';
import { CompatibilityCheckResult } from '../types';
import { useToast } from '../hooks/useToast';

interface CompatibilityPageProps {
  onSelectTab: (tab: ActiveTab) => void;
  initialEmojiString?: string;
  initialFingerprint?: string;
}

export const CompatibilityPage: React.FC<CompatibilityPageProps> = ({
  onSelectTab,
  initialEmojiString = '',
  initialFingerprint = ''
}) => {
  const toast = useToast();

  const [pastedString, setPastedString] = useState(initialEmojiString);
  const [expectedFingerprint, setExpectedFingerprint] = useState(initialFingerprint);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CompatibilityCheckResult | null>(null);

  useEffect(() => {
    if (initialEmojiString) {
      setPastedString(initialEmojiString);
      setExpectedFingerprint(initialFingerprint);
    }
  }, [initialEmojiString, initialFingerprint]);

  const handleRunCheck = async () => {
    if (!pastedString.trim()) {
      toast.warning('Please paste an emoji string to check.');
      return;
    }

    setIsChecking(true);
    try {
      const res = await checkPayloadCompatibility(pastedString, expectedFingerprint.trim() || undefined);
      setCheckResult(res);

      if (res.passed) {
        toast.success('Emoji payload survived copy/paste verification!');
      } else {
        toast.warning('Compatibility check detected anomalies.');
      }
    } catch (err: any) {
      console.error('Compatibility check error:', err);
      toast.error(err.message || 'Verification error');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setPastedString(text);
          toast.info('Pasted from clipboard');
        }
      }
    } catch (err) {
      console.warn('Clipboard read error in CompatibilityPage:', err);
      toast.warning('Clipboard permission unavailable. Please paste manually.');
    }
  };

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-8 animate-fadeIn">
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
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
            Compatibility Lab
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <RefreshCw className="w-6 h-6 text-purple-400" />
            Compatibility Check
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Verify if an emoji secret copied from WhatsApp, Telegram, Discord, or SMS survived without Unicode mutilation or auto-formatting alterations.
          </p>
        </div>

        {/* Input area */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="test-emoji-string" className="font-medium text-slate-200">
                Pasted Emoji String
              </label>
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium px-2 py-0.5 rounded hover:bg-purple-500/10 transition-colors"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </div>

            <textarea
              id="test-emoji-string"
              rows={4}
              value={pastedString}
              onChange={(e) => {
                setPastedString(e.target.value);
                setCheckResult(null);
              }}
              placeholder="Paste the emoji text received from a messaging application..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm font-mono emoji-font focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="expected-fp" className="block text-xs font-medium text-slate-300">
              Original Fingerprint (Optional verification)
            </label>
            <input
              id="expected-fp"
              type="text"
              value={expectedFingerprint}
              onChange={(e) => {
                setExpectedFingerprint(e.target.value);
                setCheckResult(null);
              }}
              placeholder="e.g. 7F-A2-91-C4"
              className="w-full px-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleRunCheck}
            disabled={isChecking || !pastedString.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Unicode Streams...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Run Compatibility Check</span>
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        {checkResult && (
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-4 animate-slideUp">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Verification Checklist</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                checkResult.passed
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {checkResult.passed ? 'PASSED' : 'ANOMALY DETECTED'}
              </span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Check 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                <span className="text-slate-300">Emoji sequence valid & recognizable</span>
                {checkResult.sequenceValid ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valid</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <XCircle className="w-4 h-4" />
                    <span>Invalid</span>
                  </span>
                )}
              </div>

              {/* Check 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                <span className="text-slate-300">Binary payload structure preserved</span>
                {checkResult.preserved ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Preserved</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <XCircle className="w-4 h-4" />
                    <span>Corrupted</span>
                  </span>
                )}
              </div>

              {/* Check 3 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                <span className="text-slate-300">Cryptographic integrity check</span>
                {checkResult.integrityPassed ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Passed</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Mismatch</span>
                  </span>
                )}
              </div>
            </div>

            {/* Details Description */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.05] text-xs text-slate-300 leading-relaxed">
              <p>{checkResult.details}</p>
              {checkResult.pastedFingerprint && (
                <p className="mt-2 font-mono text-[11px] text-slate-400">
                  Detected Fingerprint: <strong className="text-purple-400">{checkResult.pastedFingerprint}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Platform Notes / Educational Callout */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/[0.05] space-y-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>Why do third-party apps alter text?</span>
          </div>
          <p className="leading-relaxed">
            Some messaging platforms (like certain versions of SMS, web chat clients, or rich-text editors) automatically convert emojis to image tags, strip unfamiliar Unicode code points, or append zero-width spaces. EmojLock uses a strictly curated alphabet of 256 single-codepoint emojis to minimize these issues, but we cannot control external app processing.
          </p>
        </div>
      </div>
    </div>
  );
};

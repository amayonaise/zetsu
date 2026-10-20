import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { tmdb } from '../../services/tmdb.ts';
import { storage } from '../../services/storage.ts';

interface Props {
  isOpen: boolean;
  onClose: (keySaved: boolean) => void;
  canSkip?: boolean;
}

export const TmdbOnboardingModal: React.FC<Props> = ({ isOpen, onClose, canSkip = true }) => {
  const [apiKey, setApiKey] = useState(storage.getTmdbKey());
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setErrorMsg('Please enter a valid 32-character TMDB API key.');
      return;
    }
    setIsValidating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const isValid = await tmdb.validateApiKey(apiKey.trim());
    setIsValidating(false);

    if (isValid) {
      storage.setTmdbKey(apiKey.trim());
      setSuccessMsg('TMDB API Key verified successfully! Loading cinema catalogs...');
      setTimeout(() => {
        onClose(true);
      }, 700);
    } else {
      setErrorMsg('Invalid TMDB API Key. Please verify the key from themoviedb.org/settings/api');
    }
  };

  const handleSkip = () => {
    storage.setOnboarded(true);
    onClose(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0d1310] border border-[#1d2924] rounded-2xl p-7 shadow-2xl text-left overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Zetsu Logo */}
        <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-[#1b2521]">
          <img src="/logo.png" alt="Zetsu Logo" className="w-11 h-11 object-contain drop-shadow" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Welcome to Zetsu</h2>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                Core v1.0
              </span>
            </div>
            <p className="text-xs text-[#82968d]">The all-seeing media intelligence desktop</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-semibold text-[#e2ece7] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" /> Enter Your TMDB API Key
          </h3>
          <p className="text-xs text-[#95a89f] leading-relaxed">
            Zetsu requires a free <strong className="text-white">The Movie Database (TMDB)</strong> API key to fetch high-res backdrops, release years, cast, episodes, and movie stream resolvers.
          </p>

          <div className="bg-[#121a16] border border-[#1f2d27] rounded-lg p-3 text-xs text-[#8ea299] flex items-start gap-2.5 mt-3">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              ⚽ <strong className="text-white">Live Sports</strong> (Football, UFC, F1, NBA) does <strong className="text-emerald-400">NOT</strong> require TMDB and is always ready to watch!
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleValidateAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#b8ccc2] mb-1.5">
              TMDB API Key (v3 auth)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="e.g. 8d39f7a1bc4028de5e921b7a0d4c810a"
              className="w-full px-3.5 py-2.5 bg-[#070b09] border border-[#23332c] focus:border-primary rounded-xl text-sm text-white placeholder-[#4e6359] focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-all"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isValidating}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-[#050806] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Save & Activate
                </>
              )}
            </button>

            {canSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="py-2.5 px-4 bg-[#141d19] hover:bg-[#1c2722] text-[#9eb1a8] hover:text-white text-xs font-semibold rounded-xl transition-all border border-[#212f29]"
              >
                Skip for Now
              </button>
            )}
          </div>
        </form>

        {/* Free TMDB Link Helper */}
        <div className="mt-5 pt-4 border-t border-[#1a2520] flex items-center justify-between text-[11px] text-[#758a80]">
          <span>Don't have an API key?</span>
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 font-semibold"
          >
            Get Free Key in 1 Minute <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

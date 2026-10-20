import React, { useState } from 'react';
import {
  Settings,
  KeyRound,
  Server,
  Subtitles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { storage } from '../services/storage.ts';
import { tmdb } from '../services/tmdb.ts';
import { zetsuCore } from '../services/zetsuCore.ts';

export const SettingsView: React.FC = () => {
  const [tmdbKey, setTmdbKey] = useState(storage.getTmdbKey());
  const [backendUrl, setBackendUrl] = useState(storage.getBackendUrl());
  const [subLang, setSubLang] = useState(storage.getDefaultSubtitleLang());

  const [tmdbStatus, setTmdbStatus] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [isTestingTmdb, setIsTestingTmdb] = useState(false);
  const [isTestingBackend, setIsTestingBackend] = useState(false);

  const handleSaveTmdb = async () => {
    setIsTestingTmdb(true);
    setTmdbStatus(null);
    const valid = await tmdb.validateApiKey(tmdbKey);
    setIsTestingTmdb(false);

    if (valid) {
      storage.setTmdbKey(tmdbKey);
      setTmdbStatus('TMDB API Key verified and saved successfully!');
    } else {
      setTmdbStatus('Verification failed. Invalid API Key.');
    }
  };

  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    setBackendStatus(null);
    storage.setBackendUrl(backendUrl);
    const online = await zetsuCore.isOnline();
    setIsTestingBackend(false);

    if (online) {
      setBackendStatus('Connected to Zetsu Core local server successfully!');
    } else {
      setBackendStatus('Could not reach backend. Ensure `npm start` is running in zetsu-core.');
    }
  };

  const handleSubLangChange = (lang: string) => {
    setSubLang(lang);
    storage.setDefaultSubtitleLang(lang);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all Continue Watching history?')) {
      localStorage.removeItem('zetsu_continue_watching');
      alert('History cleared.');
    }
  };

  const handleClearList = () => {
    if (confirm('Clear all items from your Watchlist?')) {
      localStorage.removeItem('zetsu_my_list');
      alert('Watchlist cleared.');
    }
  };

  return (
    <div className="max-w-3xl space-y-8 text-left pb-16">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Application Settings
        </h1>
        <p className="text-xs text-[#7e9489]">
          Manage your TMDB authentication, local scraper backend, and playback preferences.
        </p>
      </div>

      {/* TMDB API Key Section */}
      <section className="bg-[#0e1411] border border-[#1b2721] rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> The Movie Database (TMDB) API Key
            </h3>
            <p className="text-xs text-[#7e9489] mt-0.5">
              Required for metadata, posters, episodes, and multi-provider movie resolution.
            </p>
          </div>
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
          >
            Get Free Key <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={tmdbKey}
            onChange={(e) => setTmdbKey(e.target.value)}
            placeholder="Enter your 32-character TMDB API key"
            className="flex-1 px-3.5 py-2.5 bg-[#070a08] border border-[#23332c] focus:border-primary rounded-xl text-xs font-mono text-white placeholder-[#51675c] focus:outline-none"
          />
          <button
            onClick={handleSaveTmdb}
            disabled={isTestingTmdb}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isTestingTmdb ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Save Key
          </button>
        </div>

        {tmdbStatus && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              tmdbStatus.includes('success')
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                : 'bg-red-950/40 text-red-300 border border-red-800/40'
            }`}
          >
            {tmdbStatus.includes('success') ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{tmdbStatus}</span>
          </div>
        )}
      </section>

      {/* Zetsu Core Backend Endpoint */}
      <section className="bg-[#0e1411] border border-[#1b2721] rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" /> Zetsu Core Local Server URL
          </h3>
          <p className="text-xs text-[#7e9489] mt-0.5">
            Default endpoint for Live Sports scraper and multi-provider movie streams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className="flex-1 px-3.5 py-2.5 bg-[#070a08] border border-[#23332c] focus:border-primary rounded-xl text-xs font-mono text-white placeholder-[#51675c] focus:outline-none"
          />
          <button
            onClick={handleTestBackend}
            disabled={isTestingBackend}
            className="px-4 py-2.5 bg-[#17241e] hover:bg-[#203129] text-white font-semibold text-xs rounded-xl border border-[#273b31] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isTestingBackend ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Test Connection
          </button>
        </div>

        {backendStatus && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              backendStatus.includes('success')
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
            }`}
          >
            {backendStatus.includes('success') ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{backendStatus}</span>
          </div>
        )}
      </section>

      {/* Subtitles Preference */}
      <section className="bg-[#0e1411] border border-[#1b2721] rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Subtitles className="w-4 h-4 text-primary" /> Subtitle Preferences
          </h3>
          <p className="text-xs text-[#7e9489] mt-0.5">
            Default language prioritized when playing foreign cinema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubLangChange('id')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              subLang === 'id'
                ? 'bg-primary text-black font-bold border-primary'
                : 'bg-[#070a08] text-[#869b90] border-[#202e27] hover:text-white'
            }`}
          >
            🇮🇩 Indonesian (Bahasa Indonesia)
          </button>
          <button
            onClick={() => handleSubLangChange('en')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              subLang === 'en'
                ? 'bg-primary text-black font-bold border-primary'
                : 'bg-[#070a08] text-[#869b90] border-[#202e27] hover:text-white'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </section>

      {/* Danger Zone / Local Cache */}
      <section className="bg-[#0e1411] border border-[#1b2721] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-400" /> Data & Local Storage
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-[#171515] hover:bg-red-950/50 text-red-400 border border-red-900/30 text-xs font-semibold rounded-xl transition-all"
          >
            Clear Watch History
          </button>
          <button
            onClick={handleClearList}
            className="px-4 py-2 bg-[#171515] hover:bg-red-950/50 text-red-400 border border-red-900/30 text-xs font-semibold rounded-xl transition-all"
          >
            Clear Watchlist
          </button>
        </div>
      </section>
    </div>
  );
};

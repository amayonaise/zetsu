import React from 'react';
import { Search, Film, Tv, Trophy, KeyRound, Server, Settings as SettingsIcon } from 'lucide-react';
import { NavigationTab } from '../../types/index.ts';

interface Props {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSearch: () => void;
  onOpenTmdbModal: () => void;
  hasTmdbKey: boolean;
  isBackendOnline: boolean;
}

export const TopNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenTmdbModal,
  hasTmdbKey,
  isBackendOnline,
}) => {
  return (
    <header className="h-16 border-b border-white/5 bg-[#070b09]/80 backdrop-blur-2xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 select-none shadow-sm">
      {/* Mobile Branding (Visible only on mobile because sidebar is hidden) */}
      <div className="flex md:hidden items-center gap-2.5">
        <img
          src="/logo.png"
          alt="Zetsu"
          className="w-8 h-8 object-contain rounded-xl p-0.5 bg-black/40 border border-white/10"
        />
        <span className="font-black text-sm tracking-wider text-white font-sans flex items-center gap-1.5">
          ZETSU
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
        </span>
      </div>

      {/* Desktop Left: Quick Access Category Pills (Hidden on small landscape, visible on xl) */}
      <div className="hidden xl:flex items-center gap-2">
        <button
          onClick={() => onSelectTab('movies')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'movies'
              ? 'bg-primary text-black font-bold shadow-sm shadow-primary/30'
              : 'bg-white/5 border border-white/5 text-[#8fa298] hover:text-white hover:bg-white/10'
          }`}
        >
          <Film className="w-3.5 h-3.5" /> Movies
        </button>
        <button
          onClick={() => onSelectTab('tv')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'tv'
              ? 'bg-primary text-black font-bold shadow-sm shadow-primary/30'
              : 'bg-white/5 border border-white/5 text-[#8fa298] hover:text-white hover:bg-white/10'
          }`}
        >
          <Tv className="w-3.5 h-3.5" /> TV Series
        </button>
        <button
          onClick={() => onSelectTab('sports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'sports'
              ? 'bg-primary text-black font-bold shadow-sm shadow-primary/30'
              : 'bg-white/5 border border-white/5 text-[#8fa298] hover:text-white hover:bg-white/10'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> Live Sports
        </button>
      </div>

      {/* Middle: Search Trigger (Responsive, truncate text) */}
      <div className="hidden sm:flex flex-1 max-w-xs md:max-w-md mx-3 sm:mx-6 min-w-0">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-black/40 hover:bg-white/5 border border-white/10 hover:border-primary/40 rounded-xl text-xs text-[#6e8278] hover:text-[#9bb0a4] transition-all group shadow-inner min-w-0"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate">Search movies, shows, sports...</span>
          </span>
          <kbd className="hidden md:inline-block font-mono text-[10px] bg-white/5 text-[#8ea499] px-2 py-0.5 rounded border border-white/10 shrink-0 ml-2">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex md:hidden p-2 rounded-xl text-[#8fa298] hover:text-white hover:bg-[#121915] border border-[#18231e] transition-all"
          title="Search"
        >
          <Search className="w-4 h-4 text-primary" />
        </button>

        {/* TMDB Key Badge */}
        <button
          onClick={onOpenTmdbModal}
          title={hasTmdbKey ? 'TMDB API Active' : 'TMDB Not Configured'}
          className={`flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-lg text-[10px] md:text-[11px] font-mono font-medium border transition-all ${
            hasTmdbKey
              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
              : 'bg-amber-950/30 text-amber-400 border-amber-800/40 hover:bg-amber-900/40'
          }`}
        >
          <KeyRound className="w-3 h-3" />
          <span>{hasTmdbKey ? 'TMDB OK' : 'Set TMDB'}</span>
        </button>

        {/* Backend Status Indicator (Desktop only to save space on mobile) */}
        <div
          title={isBackendOnline ? 'Zetsu Core Local Backend: Connected' : 'Zetsu Core Backend: Offline (Using Built-in Extractor)'}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#111814] text-[#869b90] border border-[#1c2722]"
        >
          <Server className="w-3 h-3 text-[#64796f]" />
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendOnline ? 'bg-primary shadow-[0_0_8px_#10b981]' : 'bg-emerald-500'
            }`}
          />
        </div>

        {/* Settings Shortcut */}
        <button
          onClick={() => onSelectTab('settings')}
          className="p-2 rounded-xl text-[#7a9085] hover:text-white hover:bg-[#121915] transition-all"
          title="Application Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

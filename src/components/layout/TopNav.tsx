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
    <header className="h-16 border-b border-[#141d19] bg-[#070b09]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Quick Access Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectTab('movies')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'movies'
              ? 'bg-primary text-black font-bold'
              : 'bg-[#101714] text-[#8fa298] hover:text-white hover:bg-[#16211c]'
          }`}
        >
          <Film className="w-3.5 h-3.5" /> Movies
        </button>
        <button
          onClick={() => onSelectTab('tv')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'tv'
              ? 'bg-primary text-black font-bold'
              : 'bg-[#101714] text-[#8fa298] hover:text-white hover:bg-[#16211c]'
          }`}
        >
          <Tv className="w-3.5 h-3.5" /> TV Series
        </button>
        <button
          onClick={() => onSelectTab('sports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'sports'
              ? 'bg-primary text-black font-bold'
              : 'bg-[#101714] text-[#8fa298] hover:text-white hover:bg-[#16211c]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> Live Sports
        </button>
      </div>

      {/* Middle: Search Trigger */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[#0f1512] hover:bg-[#141d18] border border-[#1b2621] hover:border-primary/40 rounded-xl text-xs text-[#6e8278] hover:text-[#9bb0a4] transition-all group shadow-inner"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span>Search titles, sports, teams...</span>
          </span>
          <kbd className="font-mono text-[10px] bg-[#1a2520] text-[#8ea499] px-2 py-0.5 rounded border border-[#26372f]">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Status Indicators & Actions */}
      <div className="flex items-center gap-3">
        {/* TMDB Key Badge */}
        <button
          onClick={onOpenTmdbModal}
          title={hasTmdbKey ? 'TMDB API Active' : 'TMDB Not Configured'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border transition-all ${
            hasTmdbKey
              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
              : 'bg-amber-950/30 text-amber-400 border-amber-800/40 hover:bg-amber-900/40'
          }`}
        >
          <KeyRound className="w-3 h-3" />
          <span>{hasTmdbKey ? 'TMDB OK' : 'Set TMDB'}</span>
        </button>

        {/* Backend Status Indicator */}
        <div
          title={isBackendOnline ? 'Zetsu Core Local Backend: Connected' : 'Zetsu Core Backend: Offline (Using Mock Fallback)'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#111814] text-[#869b90] border border-[#1c2722]"
        >
          <Server className="w-3 h-3 text-[#64796f]" />
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendOnline ? 'bg-primary shadow-[0_0_8px_#10b981]' : 'bg-amber-500'
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

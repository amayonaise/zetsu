import React, { useEffect, useState } from 'react';
import { Trophy, Radio, Calendar, Layers, Play, Shield } from 'lucide-react';
import { PlaybackTarget, SportsMatch } from '../types/index.ts';
import { zetsuCore } from '../services/zetsuCore.ts';

interface Props {
  onStartPlayback: (target: PlaybackTarget) => void;
  selectedMatchInitial?: SportsMatch | null;
}

const CATEGORIES = [
  { id: 'all', label: 'All Sports' },
  { id: 'football', label: 'Football / Soccer' },
  { id: 'basketball', label: 'Basketball / NBA' },
  { id: 'motorsport', label: 'Motorsport / F1' },
  { id: 'fighting', label: 'Combat / UFC' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'hockey', label: 'Ice Hockey' },
];

export const SportsView: React.FC<Props> = ({ onStartPlayback, selectedMatchInitial }) => {
  const [matches, setMatches] = useState<SportsMatch[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'live' | 'today' | 'all'>('live');
  const [isLoading, setIsLoading] = useState(true);

  // Stream Resolution Modal
  const [selectedMatch, setSelectedMatch] = useState<SportsMatch | null>(selectedMatchInitial || null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [activeTab, activeCategory]);

  useEffect(() => {
    if (selectedMatchInitial) {
      setSelectedMatch(selectedMatchInitial);
    }
  }, [selectedMatchInitial]);

  const loadMatches = async () => {
    setIsLoading(true);
    let data: SportsMatch[] = [];
    if (activeTab === 'live') {
      data = await zetsuCore.getLiveMatches();
    } else if (activeTab === 'today') {
      data = await zetsuCore.getTodayMatches();
    } else {
      data = await zetsuCore.getAllMatches();
    }

    if (activeCategory !== 'all') {
      data = data.filter(m => m.category.toLowerCase() === activeCategory.toLowerCase());
    }

    setMatches(data);
    setIsLoading(false);
  };

  const handleResolveAndPlay = async (match: SportsMatch, source: string, streamNo: number = 1) => {
    setIsResolving(true);
    const result = await zetsuCore.resolveSportsStream(match.id, source, streamNo);
    setIsResolving(false);
    setSelectedMatch(null);

    const streamUrl = result.m3u8 || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    onStartPlayback({
      title: match.title,
      mediaType: 'sports',
      url: streamUrl,
      referer: result.referer || 'https://streamed.st/',
      isLive: true,
    });
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Sports Header Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-[#0d1612] via-[#09110d] to-[#060a08] border border-[#1b2721] overflow-hidden flex flex-col justify-between">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-xl z-10 space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase font-bold tracking-widest">
            <Shield className="w-4 h-4" /> Official Streamed.st Architecture
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Live Sports Arena
          </h1>
          <p className="text-xs text-[#82998e] leading-relaxed">
            Real-time fixtures, live streams with WebAssembly decrypters, and multi-channel coverage for Champions League, Premier League, UFC, Formula 1, and NBA.
          </p>
        </div>

        {/* Tab Buttons (Live Now / Today / All) */}
        <div className="flex items-center gap-2 mt-6 z-10">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'live'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-[#121c17] text-[#869b91] hover:text-white hover:bg-[#18261f]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Now ({matches.filter(m => m.status === 'LIVE').length})
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-primary text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-[#121c17] text-[#869b91] hover:text-white hover:bg-[#18261f]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Today's Schedule
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-[#121c17] text-[#869b91] hover:text-white hover:bg-[#18261f]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> All Competitions
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-[#101713] text-[#869b90] hover:text-white hover:bg-[#16211c]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Match Cards Grid */}
      {isLoading ? (
        <div className="py-24 flex justify-center items-center text-xs text-[#788e83]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
          Fetching live sports feeds...
        </div>
      ) : matches.length === 0 ? (
        <div className="py-20 text-center text-xs text-[#6e8277] bg-[#0c120f] border border-[#1b2621] rounded-2xl">
          No active matches found for this category at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => {
            const isLive = match.status === 'LIVE';
            return (
              <div
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="bg-[#0e1411] hover:bg-[#131c17] border border-[#1b2721] hover:border-primary/50 rounded-2xl p-5 cursor-pointer transition-all group flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#697f74] bg-[#141e19] px-2 py-0.5 rounded">
                      {match.category}
                    </span>
                    {isLive ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 font-mono">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {match.elapsed || 'LIVE'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#82998e] bg-[#131c18] px-2 py-0.5 rounded">
                        {match.elapsed || new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Teams & Score */}
                  <div className="space-y-3 my-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {match.teams?.home?.badge ? (
                          <img
                            src={match.teams.home.badge}
                            alt=""
                            className="w-6 h-6 object-contain shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-[#17221d] flex items-center justify-center text-[10px] text-[#71877d]">
                            ⚽
                          </div>
                        )}
                        <span className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                          {match.teams?.home?.name || match.title.split(' vs ')[0] || 'Team A'}
                        </span>
                      </div>
                      {match.score && (
                        <span className="font-mono text-sm font-bold text-primary pl-2">
                          {match.score.split('-')[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {match.teams?.away?.badge ? (
                          <img
                            src={match.teams.away.badge}
                            alt=""
                            className="w-6 h-6 object-contain shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-[#17221d] flex items-center justify-center text-[10px] text-[#71877d]">
                            ⚽
                          </div>
                        )}
                        <span className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                          {match.teams?.away?.name || match.title.split(' vs ')[1] || 'Team B'}
                        </span>
                      </div>
                      {match.score && (
                        <span className="font-mono text-sm font-bold text-primary pl-2">
                          {match.score.split('-')[1]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3.5 border-t border-[#18231e] flex items-center justify-between">
                  <span className="text-[11px] text-[#6d8277] font-mono">
                    {match.sources?.length || 2} Live Channels
                  </span>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch Stream
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stream Source Selector Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0c120f] border border-[#1d2924] rounded-2xl p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#18231e]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                  {selectedMatch.category} · Select Channel
                </span>
                <h3 className="text-base font-bold text-white truncate max-w-xs mt-0.5">
                  {selectedMatch.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#71857c] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <span className="block text-xs text-[#8ea499] mb-1 font-semibold">
                Available Decrypted Feeds:
              </span>

              {(selectedMatch.sources && selectedMatch.sources.length > 0
                ? selectedMatch.sources
                : [
                    { source: 'alpha', id: 'stream-01' },
                    { source: 'bravo', id: 'stream-02' },
                    { source: 'hotel', id: 'stream-03' },
                  ]
              ).map((src, idx) => (
                <button
                  key={idx}
                  disabled={isResolving}
                  onClick={() => handleResolveAndPlay(selectedMatch, src.source, idx + 1)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#121a16] hover:bg-[#18241f] border border-[#1e2c26] hover:border-primary/50 text-xs font-bold text-white transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="capitalize">{src.source} Stream #{idx + 1}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-primary border border-primary/30">
                      1080p 60fps
                    </span>
                  </div>
                  <span className="text-primary group-hover:translate-x-1 transition-transform">
                    {isResolving ? 'Connecting...' : 'Launch →'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Search, X, Film, Tv, Trophy, Star, ArrowRight } from 'lucide-react';
import { MediaItem, SportsMatch } from '../../types/index.ts';
import { tmdb } from '../../services/tmdb.ts';
import { zetsuCore } from '../../services/zetsuCore.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onSelectSport: (match: SportsMatch) => void;
}

export const SearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectMedia,
  onSelectSport,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv' | 'sports'>('all');
  const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
  const [sportsResults, setSportsResults] = useState<SportsMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setMediaResults([]);
      setSportsResults([]);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setMediaResults([]);
      setSportsResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const [mediaRes, sportsRes] = await Promise.all([
        tmdb.search(query.trim()),
        zetsuCore.getAllMatches(),
      ]);

      setMediaResults(mediaRes);

      const q = query.toLowerCase();
      const filteredSports = (sportsRes || []).filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.teams?.home?.name?.toLowerCase().includes(q) ||
          m.teams?.away?.name?.toLowerCase().includes(q)
      );
      setSportsResults(filteredSports);
      setIsSearching(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const displayMovies = mediaResults.filter(i => i.mediaType === 'movie');
  const displayTv = mediaResults.filter(i => i.mediaType === 'tv');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0c120f] border border-[#1d2924] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-left">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#18231e] gap-3">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows, teams, or sports events..."
            className="w-full bg-transparent text-sm text-white placeholder-[#5d7368] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-white/10 text-[#71857c] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="font-mono text-[10px] bg-[#141d19] text-[#71857c] px-2 py-0.5 rounded border border-[#202d27]">
            ESC
          </kbd>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#090e0c] border-b border-[#141d19]">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-primary text-black'
                : 'text-[#85988e] hover:text-white hover:bg-white/5'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveFilter('movie')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'movie'
                ? 'bg-primary text-black'
                : 'text-[#85988e] hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Movies ({displayMovies.length})
          </button>
          <button
            onClick={() => setActiveFilter('tv')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'tv'
                ? 'bg-primary text-black'
                : 'text-[#85988e] hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Series ({displayTv.length})
          </button>
          <button
            onClick={() => setActiveFilter('sports')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'sports'
                ? 'bg-primary text-black'
                : 'text-[#85988e] hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Sports ({sportsResults.length})
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {isSearching && (
            <div className="py-8 flex justify-center items-center text-xs text-[#879b91]">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Searching global catalog...
            </div>
          )}

          {!isSearching && query && mediaResults.length === 0 && sportsResults.length === 0 && (
            <div className="py-12 text-center text-xs text-[#6e8278]">
              No results found for "<span className="text-white">{query}</span>"
            </div>
          )}

          {/* Sports Results */}
          {(activeFilter === 'all' || activeFilter === 'sports') && sportsResults.length > 0 && (
            <div>
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#63796f] mb-2 px-1">
                Live Sports Matches
              </span>
              <div className="space-y-1.5">
                {sportsResults.slice(0, 4).map((match) => (
                  <div
                    key={match.id}
                    onClick={() => {
                      onSelectSport(match);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#111814] hover:bg-[#16201b] border border-[#1b2621] hover:border-primary/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-primary shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                          {match.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#788e84] uppercase">
                          {match.category} · {match.elapsed || 'Scheduled'}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#5b6f65] group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Results (Movies & TV) */}
          {(activeFilter === 'all' || activeFilter === 'movie' || activeFilter === 'tv') && (
            <div>
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#63796f] mb-2 px-1">
                Movies & TV Shows
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(activeFilter === 'all'
                  ? mediaResults
                  : activeFilter === 'movie'
                  ? displayMovies
                  : displayTv
                ).slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectMedia(item);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl bg-[#111814] hover:bg-[#16201b] border border-[#1b2621] hover:border-primary/40 cursor-pointer transition-all group"
                  >
                    <img
                      src={item.posterPath}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0 bg-black"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-mono uppercase font-bold text-primary">
                        {item.mediaType === 'movie' ? 'Movie' : 'TV Series'}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      {item.voteAverage && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                          <Star className="w-3 h-3 fill-current" /> {item.voteAverage}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

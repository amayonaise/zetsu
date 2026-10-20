import React, { useEffect, useState } from 'react';
import { Tv, Star, Filter } from 'lucide-react';
import { MediaItem } from '../types/index.ts';
import { tmdb } from '../services/tmdb.ts';

interface Props {
  onSelectMedia: (item: MediaItem) => void;
}

const TV_GENRES = [
  'All',
  'Sci-Fi & Fantasy',
  'Drama',
  'Action & Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Mystery',
];

export const TvShowsView: React.FC<Props> = ({ onSelectMedia }) => {
  const [shows, setShows] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating'>('popular');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    setIsLoading(true);
    const data = await tmdb.getPopularTv();
    setShows(data);
    setIsLoading(false);
  };

  const filteredShows = shows
    .filter((s) => {
      if (selectedGenre === 'All') return true;
      return s.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.voteAverage || 0) - (a.voteAverage || 0);
      return 0;
    });

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-primary" /> TV Series & Shows
          </h1>
          <p className="text-xs text-[#7e9489]">
            Marathon episodic television with season-by-season episode browsing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#788e83]">
            <Filter className="w-3.5 h-3.5" /> Sort:
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#101713] border border-[#1e2a25] text-xs font-semibold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Genre Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TV_GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === genre
                ? 'bg-primary text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#101713] text-[#869b90] hover:text-white hover:bg-[#16211c]'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-24 flex justify-center items-center text-xs text-[#788e83]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
          Loading television series...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredShows.map((show) => (
            <div
              key={show.id}
              onClick={() => onSelectMedia(show)}
              className="group bg-[#0e1411] border border-[#1a2520] hover:border-primary/50 rounded-2xl overflow-hidden cursor-pointer transition-all"
            >
              <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                <img
                  src={show.posterPath}
                  alt={show.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                    {show.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-[#8ea498] mt-1">
                    <span>
                      {show.seasonsCount ? `${show.seasonsCount} Seasons` : show.releaseDate?.slice(0, 4)}
                    </span>
                    {show.voteAverage && (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> {show.voteAverage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

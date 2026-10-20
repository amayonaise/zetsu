import React, { useEffect, useState } from 'react';
import { Film, Star, Filter } from 'lucide-react';
import { MediaItem } from '../types/index.ts';
import { tmdb } from '../services/tmdb.ts';

interface Props {
  onSelectMedia: (item: MediaItem) => void;
}

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Thriller',
  'Drama',
  'Adventure',
  'Comedy',
  'Crime',
  'Horror',
];

export const MoviesView: React.FC<Props> = ({ onSelectMedia }) => {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'rating' | 'year'>('trending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setIsLoading(true);
    const data = await tmdb.getPopularMovies();
    setMovies(data);
    setIsLoading(false);
  };

  const filteredMovies = movies
    .filter((m) => {
      if (selectedGenre === 'All') return true;
      return m.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.voteAverage || 0) - (a.voteAverage || 0);
      if (sortBy === 'year') {
        const yearA = parseInt(a.releaseDate?.slice(0, 4) || '0');
        const yearB = parseInt(b.releaseDate?.slice(0, 4) || '0');
        return yearB - yearA;
      }
      return 0;
    });

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" /> Cinema & Movies
          </h1>
          <p className="text-xs text-[#7e9489]">
            Discover blockbuster movies, classics, and independent films with direct CDN streaming.
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#788e83]">
            <Filter className="w-3.5 h-3.5" /> Sort:
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#101713] border border-[#1e2a25] text-xs font-semibold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="trending">Trending Now</option>
            <option value="rating">Highest Rated</option>
            <option value="year">Release Year</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GENRES.map((genre) => (
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

      {/* Movies Grid */}
      {isLoading ? (
        <div className="py-24 flex justify-center items-center text-xs text-[#788e83]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
          Loading movies catalog...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onSelectMedia(movie)}
              className="group bg-[#0e1411] border border-[#1a2520] hover:border-primary/50 rounded-2xl overflow-hidden cursor-pointer transition-all"
            >
              <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                    {movie.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-[#8ea498] mt-1">
                    <span>{movie.releaseDate?.slice(0, 4)}</span>
                    {movie.voteAverage && (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> {movie.voteAverage}
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

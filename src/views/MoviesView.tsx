import React, { useEffect, useState, useCallback } from 'react';
import { Film, Star, Filter, ChevronDown, Sparkles } from 'lucide-react';
import { MediaItem } from '../types/index.ts';
import { tmdb } from '../services/tmdb.ts';

interface Props {
  onSelectMedia: (item: MediaItem) => void;
}

const MOVIE_GENRES = [
  { id: 0, name: 'All' },
  { id: 28, name: 'Action' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 18, name: 'Drama' },
  { id: 12, name: 'Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 27, name: 'Horror' },
  { id: 16, name: 'Animation' },
  { id: 14, name: 'Fantasy' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Trending Now' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Release Year' },
];

export const MoviesView: React.FC<Props> = ({ onSelectMedia }) => {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const fetchMovies = useCallback(
    async (targetPage: number, genreId: number, sort: string, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await tmdb.discoverMovies({
          genreId: genreId === 0 ? undefined : genreId,
          sortBy: sort,
          page: targetPage,
        });

        if (append) {
          setMovies((prev) => {
            // Deduplicate by id
            const existingIds = new Set(prev.map((m) => m.id));
            const newUnique = res.results.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newUnique];
          });
        } else {
          setMovies(res.results);
        }

        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error('Failed to discover movies:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchMovies(1, selectedGenreId, sortBy, false);
  }, [selectedGenreId, sortBy, fetchMovies]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      fetchMovies(nextPage, selectedGenreId, sortBy, true);
    }
  };

  const selectedGenreName =
    MOVIE_GENRES.find((g) => g.id === selectedGenreId)?.name || 'All';

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
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#101713] border border-[#1e2a25] text-xs font-semibold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MOVIE_GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenreId(genre.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenreId === genre.id
                ? 'bg-primary text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-105'
                : 'bg-[#101713] text-[#869b90] hover:text-white hover:bg-[#16211c]'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col justify-center items-center text-xs text-[#788e83] gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Searching movies catalog ({selectedGenreName})...</span>
        </div>
      ) : movies.length === 0 ? (
        <div className="py-24 text-center text-[#788e83] space-y-2">
          <Film className="w-10 h-10 mx-auto text-[#2b3a32] opacity-70" />
          <p className="text-sm font-semibold text-[#8ea498]">No movies found</p>
          <p className="text-xs text-[#5a7064]">Try selecting a different genre or sort option.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                tabIndex={0}
                data-tv-nav="true"
                onClick={() => onSelectMedia(movie)}
                className="group tv-focusable bg-[#0e1411] border border-[#1a2520] hover:border-primary/50 focus:border-primary rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] duration-200"
              >
                <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                  <img
                    src={movie.posterPath}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                      {movie.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[#8ea498] mt-1">
                      <span>{movie.releaseDate?.slice(0, 4) || 'N/A'}</span>
                      {movie.voteAverage !== undefined && movie.voteAverage > 0 && (
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

          {/* Pagination / Load More Footer */}
          {page < totalPages && (
            <div className="flex flex-col items-center justify-center pt-4 pb-8 gap-2">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 bg-[#121b16] hover:bg-[#1a2720] border border-[#23352c] hover:border-primary/40 text-xs font-bold text-white px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading more movies...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Movies</span>
                    <ChevronDown className="w-4 h-4 text-primary" />
                  </>
                )}
              </button>
              <span className="text-[10px] text-[#5e776a]">
                Showing {movies.length} movies (Page {page} of {totalPages})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

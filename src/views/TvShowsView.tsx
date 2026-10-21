import React, { useEffect, useState, useCallback } from 'react';
import { Tv, Star, Filter, ChevronDown } from 'lucide-react';
import { MediaItem } from '../types/index.ts';
import { tmdb } from '../services/tmdb.ts';

interface Props {
  onSelectMedia: (item: MediaItem) => void;
}

const TV_GENRES = [
  { id: 0, name: 'All' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 18, name: 'Drama' },
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 9648, name: 'Mystery' },
  { id: 10764, name: 'Reality' },
  { id: 99, name: 'Documentary' },
];

const TV_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'first_air_date.desc', label: 'Latest Air Date' },
];

export const TvShowsView: React.FC<Props> = ({ onSelectMedia }) => {
  const [shows, setShows] = useState<MediaItem[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const fetchShows = useCallback(
    async (targetPage: number, genreId: number, sort: string, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await tmdb.discoverTv({
          genreId: genreId === 0 ? undefined : genreId,
          sortBy: sort,
          page: targetPage,
        });

        if (append) {
          setShows((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const newUnique = res.results.filter((s) => !existingIds.has(s.id));
            return [...prev, ...newUnique];
          });
        } else {
          setShows(res.results);
        }

        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error('Failed to discover TV shows:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchShows(1, selectedGenreId, sortBy, false);
  }, [selectedGenreId, sortBy, fetchShows]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      fetchShows(nextPage, selectedGenreId, sortBy, true);
    }
  };

  const selectedGenreName =
    TV_GENRES.find((g) => g.id === selectedGenreId)?.name || 'All';

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
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#101713] border border-[#1e2a25] text-xs font-semibold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {TV_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Genre Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TV_GENRES.map((genre) => (
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

      {/* Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col justify-center items-center text-xs text-[#788e83] gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Searching TV series ({selectedGenreName})...</span>
        </div>
      ) : shows.length === 0 ? (
        <div className="py-24 text-center text-[#788e83] space-y-2">
          <Tv className="w-10 h-10 mx-auto text-[#2b3a32] opacity-70" />
          <p className="text-sm font-semibold text-[#8ea498]">No TV series found</p>
          <p className="text-xs text-[#5a7064]">Try selecting a different genre or sort option.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {shows.map((show) => (
              <div
                key={show.id}
                tabIndex={0}
                data-tv-nav="true"
                onClick={() => onSelectMedia(show)}
                className="group tv-focusable bg-[#0e1411] border border-[#1a2520] hover:border-primary/50 focus:border-primary rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] duration-200"
              >
                <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                  <img
                    src={show.posterPath}
                    alt={show.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                      {show.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[#8ea498] mt-1">
                      <span>
                        {show.seasonsCount
                          ? `${show.seasonsCount} Seasons`
                          : show.releaseDate?.slice(0, 4) || 'N/A'}
                      </span>
                      {show.voteAverage !== undefined && show.voteAverage > 0 && (
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
                    <span>Loading more series...</span>
                  </>
                ) : (
                  <>
                    <span>Load More TV Series</span>
                    <ChevronDown className="w-4 h-4 text-primary" />
                  </>
                )}
              </button>
              <span className="text-[10px] text-[#5e776a]">
                Showing {shows.length} series (Page {page} of {totalPages})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

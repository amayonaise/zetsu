import React, { useEffect, useState } from 'react';
import { Play, Info, Bookmark, Star, Calendar, Clock, Radio, Trophy, Check } from 'lucide-react';
import { ContinueWatchingItem, MediaItem, PlaybackTarget, SportsMatch } from '../types/index.ts';
import { tmdb } from '../services/tmdb.ts';
import { zetsuCore } from '../services/zetsuCore.ts';
import { storage } from '../services/storage.ts';

interface Props {
  onSelectMedia: (item: MediaItem) => void;
  onSelectSport: (match: SportsMatch) => void;
  onStartPlayback: (target: PlaybackTarget) => void;
}

export const HomeView: React.FC<Props> = ({
  onSelectMedia,
  onSelectSport,
  onStartPlayback,
}) => {
  const [heroItem, setHeroItem] = useState<MediaItem | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [popularTv, setPopularTv] = useState<MediaItem[]>([]);
  const [liveSports, setLiveSports] = useState<SportsMatch[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [isHeroInList, setIsHeroInList] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    const [movies, tv, sports] = await Promise.all([
      tmdb.getTrending('movie'),
      tmdb.getPopularTv(),
      zetsuCore.getLiveMatches(),
    ]);

    setTrendingMovies(movies);
    setPopularTv(tv);
    setLiveSports(sports);

    if (movies.length > 0) {
      setHeroItem(movies[0]);
      setIsHeroInList(storage.isInMyList(movies[0].id));
    }

    setContinueWatching(storage.getContinueWatching());
  };

  const handleToggleHeroList = () => {
    if (!heroItem) return;
    const newState = storage.toggleMyList(heroItem);
    setIsHeroInList(newState);
  };

  const handlePlayHero = () => {
    if (!heroItem) return;
    onStartPlayback({
      title: heroItem.title,
      mediaType: 'movie',
      url: '',
      sources: [],
      tmdbId: String(heroItem.id),
      backdrop: heroItem.backdropPath,
      poster: heroItem.posterPath,
      overview: heroItem.overview,
      genres: heroItem.genres,
      isResolving: true,
    });
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Featured Hero Banner */}
      {heroItem && (
        <div className="relative h-[360px] sm:h-[460px] md:h-[540px] w-full rounded-2xl md:rounded-3xl overflow-hidden border border-[#1b2621] shadow-2xl">
          <img
            src={heroItem.backdropPath}
            alt={heroItem.title}
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          {/* Cinema Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070a08] via-[#070a08]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070a08] via-[#070a08]/60 to-transparent" />

          {/* Hero Content */}
          <div className="absolute bottom-5 left-4 right-4 sm:bottom-10 sm:left-10 max-w-2xl text-left space-y-2 sm:space-y-3 z-10">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary text-black font-mono">
                Featured Spotlight
              </span>
              {heroItem.voteAverage && (
                <span className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
                  <Star className="w-3 h-3 fill-current" /> {heroItem.voteAverage}
                </span>
              )}
              {heroItem.releaseDate && (
                <span className="text-[11px] sm:text-xs text-[#9bb0a5] bg-black/40 px-2 py-0.5 rounded">
                  {heroItem.releaseDate.slice(0, 4)}
                </span>
              )}
              {heroItem.duration && (
                <span className="text-[11px] sm:text-xs text-[#9bb0a5] bg-black/40 px-2 py-0.5 rounded">
                  {heroItem.duration}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {heroItem.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#cbd9d1] line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
              {heroItem.overview}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
              <button
                onClick={handlePlayHero}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary-hover text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" /> Play Now
              </button>
              <button
                onClick={() => onSelectMedia(heroItem)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95"
              >
                <Info className="w-4 h-4" /> Details
              </button>
              <button
                onClick={handleToggleHeroList}
                className="p-2.5 sm:p-3 bg-[#131b17] hover:bg-[#1a2520] text-white rounded-xl border border-[#202e27] transition-all active:scale-95"
                title="Add to My List"
              >
                {isHeroInList ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <section className="text-left space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Continue Watching
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {continueWatching.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onStartPlayback({
                    title: item.title,
                    mediaType: item.mediaType,
                    url: '',
                    sources: [],
                    tmdbId: item.tmdbId,
                    season: item.season,
                    episode: item.episode,
                    backdrop: item.backdropPath,
                    isResolving: true,
                  });
                }}
                className="group relative bg-[#0f1512] border border-[#1a2520] hover:border-primary/40 rounded-2xl overflow-hidden cursor-pointer transition-all"
              >
                <div className="relative h-32 w-full bg-black overflow-hidden">
                  <img
                    src={item.backdropPath}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-3 rounded-full bg-primary text-black">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <p className="text-[10px] text-[#788e83] font-mono mt-0.5">
                    {item.season && item.episode
                      ? `S${item.season} E${item.episode} · `
                      : ''}
                    {item.progressPercent}% Watched
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Live Sports Ticker */}
      <section className="text-left space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> Live & Upcoming Sports
          </h2>
          <span className="text-[11px] font-mono text-primary flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Real-time Feeds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {liveSports.slice(0, 3).map((match) => (
            <div
              key={match.id}
              onClick={() => onSelectSport(match)}
              className="bg-[#0e1411] hover:bg-[#131c18] border border-[#1b2721] hover:border-primary/50 rounded-2xl p-4 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#697f74]">
                  {match.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/30 font-mono">
                  <Radio className="w-3 h-3 animate-pulse" /> {match.elapsed || 'LIVE'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-primary transition-colors">
                  <span className="truncate">{match.teams?.home?.name || match.title.split(' vs ')[0] || 'Team A'}</span>
                  {match.score && <span className="font-mono text-primary">{match.score.split('-')[0]}</span>}
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-primary transition-colors">
                  <span className="truncate">{match.teams?.away?.name || match.title.split(' vs ')[1] || 'Team B'}</span>
                  {match.score && <span className="font-mono text-primary">{match.score.split('-')[1]}</span>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#18231e] flex items-center justify-between text-[11px] text-[#768b80]">
                <span>{match.sources?.length || 2} Stream Feeds</span>
                <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Watch Live &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Movies Grid */}
      <section className="text-left space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Trending Movies
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {trendingMovies.slice(0, 5).map((movie) => (
            <div
              key={movie.id}
              onClick={() => onSelectMedia(movie)}
              className="group bg-[#0f1512] border border-[#1a2520] hover:border-primary/50 rounded-2xl overflow-hidden cursor-pointer transition-all"
            >
              <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-[#8ea498] mt-0.5">
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
      </section>

      {/* Popular TV Shows Grid */}
      <section className="text-left space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Popular Series
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {popularTv.slice(0, 5).map((show) => (
            <div
              key={show.id}
              onClick={() => onSelectMedia(show)}
              className="group bg-[#0f1512] border border-[#1a2520] hover:border-primary/50 rounded-2xl overflow-hidden cursor-pointer transition-all"
            >
              <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                <img
                  src={show.posterPath}
                  alt={show.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h4 className="text-xs font-bold text-white truncate">{show.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-[#8ea498] mt-0.5">
                    <span>{show.releaseDate?.slice(0, 4)}</span>
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
      </section>
    </div>
  );
};

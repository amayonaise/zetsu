import React, { useEffect, useState } from 'react';
import {
  X,
  Play,
  Bookmark,
  Check,
  Star,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  User,
  Film,
  Building2,
  Globe2,
  DollarSign,
  Info,
} from 'lucide-react';
import { MediaItem, PlaybackTarget, TvEpisode } from '../../types/index.ts';
import { tmdb } from '../../services/tmdb.ts';
import { storage } from '../../services/storage.ts';

interface Props {
  item: MediaItem | null;
  onClose: () => void;
  onStartPlayback: (target: PlaybackTarget) => void;
}

export const MediaDetailModal: React.FC<Props> = ({
  item,
  onClose,
  onStartPlayback,
}) => {
  const [details, setDetails] = useState<MediaItem | null>(item);
  const [inList, setInList] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'episodes'>('overview');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<TvEpisode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  useEffect(() => {
    if (!item) return;
    setDetails(item);
    setInList(storage.isInMyList(item.id));
    setActiveTab(item.mediaType === 'tv' ? 'episodes' : 'overview');

    // Fetch full enriched metadata (credits, cast, tagline, director, etc.)
    tmdb.getDetails(item.id, item.mediaType).then((full) => {
      if (full) {
        setDetails(full);
      }
    });

    if (item.mediaType === 'tv') {
      loadSeasonEpisodes(1);
    }
  }, [item]);

  if (!item || !details) return null;

  const loadSeasonEpisodes = async (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    setIsLoadingEpisodes(true);
    const seasonData = await tmdb.getTvSeason(item.id, seasonNum);
    setEpisodes(seasonData?.episodes || []);
    setIsLoadingEpisodes(false);
  };

  const handleToggleList = () => {
    const newState = storage.toggleMyList(details);
    setInList(newState);
  };

  // Instant Play: Transition immediately to VideoPlayer and resolve stream inside player
  const handlePlayMovie = () => {
    onClose();
    onStartPlayback({
      title: details.title,
      mediaType: 'movie',
      url: '',
      sources: [],
      tmdbId: String(details.id),
      backdrop: details.backdropPath,
      poster: details.posterPath,
      overview: details.overview,
      genres: details.genres,
      isResolving: true,
    });
  };

  const handlePlayEpisode = (ep: TvEpisode) => {
    onClose();
    onStartPlayback({
      title: `${details.title} - S${selectedSeason}E${ep.episodeNumber}: ${ep.name}`,
      mediaType: 'tv',
      url: '',
      sources: [],
      tmdbId: String(details.id),
      season: selectedSeason,
      episode: ep.episodeNumber,
      backdrop: ep.stillPath || details.backdropPath,
      poster: details.posterPath,
      overview: ep.overview || details.overview,
      genres: details.genres,
      isResolving: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      {/* Background Click to Dismiss */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Main Glassmorphic Modal Container */}
      <div className="relative z-10 w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[92vh] bg-[#09110d]/90 backdrop-blur-3xl border-0 sm:border border-white/10 rounded-none sm:rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col text-left">
        {/* Backdrop Hero Banner */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full shrink-0 overflow-hidden">
          <img
            src={details.backdropPath}
            alt={details.title}
            className="w-full h-full object-cover object-top scale-105 filter brightness-[0.75] transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09110d] via-[#09110d]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09110d]/90 via-[#09110d]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xl border border-white/15 transition-all z-20 active:scale-95"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Hero Info */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 z-10 flex flex-col items-start gap-2.5 sm:gap-3">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary text-black font-mono shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                {details.mediaType === 'movie' ? 'Movie' : 'TV Series'}
              </span>

              {details.voteAverage && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <Star className="w-3 h-3 fill-current" /> {details.voteAverage}
                  {details.voteCount && (
                    <span className="text-[9px] text-[#8fa298] font-normal">
                      ({details.voteCount > 1000 ? `${(details.voteCount / 1000).toFixed(1)}k` : details.voteCount})
                    </span>
                  )}
                </span>
              )}

              {details.releaseDate && (
                <span className="flex items-center gap-1 text-[11px] text-[#cbdad1] bg-white/5 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 font-mono">
                  <Calendar className="w-3 h-3 text-primary" /> {details.releaseDate.slice(0, 4)}
                </span>
              )}

              {details.duration && (
                <span className="flex items-center gap-1 text-[11px] text-[#cbdad1] bg-white/5 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 font-mono">
                  <Clock className="w-3 h-3 text-primary" /> {details.duration}
                </span>
              )}

              {details.status && (
                <span className="hidden sm:inline-flex text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8ea499]">
                  {details.status}
                </span>
              )}
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                {details.title}
              </h1>
              {details.tagline && (
                <p className="text-xs sm:text-sm text-primary/90 italic font-medium mt-1 tracking-wide">
                  "{details.tagline}"
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              {details.mediaType === 'movie' && (
                <button
                  onClick={handlePlayMovie}
                  className="flex items-center gap-2 px-6 sm:px-7 py-3 bg-primary hover:bg-primary-hover text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Putar Film
                </button>
              )}

              {details.mediaType === 'tv' && episodes.length > 0 && (
                <button
                  onClick={() => handlePlayEpisode(episodes[0])}
                  className="flex items-center gap-2 px-6 sm:px-7 py-3 bg-primary hover:bg-primary-hover text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Putar S1 E1
                </button>
              )}

              <button
                onClick={handleToggleList}
                className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-2xl border border-white/10 backdrop-blur-xl transition-all active:scale-95"
              >
                {inList ? (
                  <>
                    <Check className="w-4 h-4 text-primary" /> Di Daftar Saya
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" /> Tambah ke Daftar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-2 px-6 sm:px-8 pt-4 pb-2 border-b border-white/5 bg-[#070e0a]/40 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-black shadow-sm'
                : 'text-[#8ea499] hover:text-white hover:bg-white/5'
            }`}
          >
            Ringkasan
          </button>

          {details.cast && details.cast.length > 0 && (
            <button
              onClick={() => setActiveTab('cast')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cast'
                  ? 'bg-primary text-black shadow-sm'
                  : 'text-[#8ea499] hover:text-white hover:bg-white/5'
              }`}
            >
              Pemeran ({details.cast.length})
            </button>
          )}

          {details.mediaType === 'tv' && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'episodes'
                  ? 'bg-primary text-black shadow-sm'
                  : 'text-[#8ea499] hover:text-white hover:bg-white/5'
              }`}
            >
              Daftar Episode
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Synopsis */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-primary font-bold mb-2">
                  Sinopsis
                </h3>
                <p className="text-sm sm:text-base text-[#cbdad1] leading-relaxed max-w-3xl font-normal">
                  {details.overview}
                </p>
              </div>

              {/* Genres Pills */}
              {details.genres && details.genres.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#6e8579] mb-2 font-bold">
                    Genre
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-[#cbdad1]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/5">
                {details.director && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-[#6e8579] font-bold">
                      <User className="w-3.5 h-3.5 text-primary" /> Sutradara
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1 truncate">
                      {details.director}
                    </p>
                  </div>
                )}

                {details.releaseDate && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-[#6e8579] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Rilis
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1 font-mono">
                      {details.releaseDate}
                    </p>
                  </div>
                )}

                {details.originalLanguage && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-[#6e8579] font-bold">
                      <Globe2 className="w-3.5 h-3.5 text-primary" /> Bahasa Asli
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1 font-mono">
                      {details.originalLanguage}
                    </p>
                  </div>
                )}

                {details.productionCompanies && details.productionCompanies.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-[#6e8579] font-bold">
                      <Building2 className="w-3.5 h-3.5 text-primary" /> Produksi
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1 truncate">
                      {details.productionCompanies.join(', ')}
                    </p>
                  </div>
                )}

                {details.budget && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-[#6e8579] font-bold">
                      <DollarSign className="w-3.5 h-3.5 text-primary" /> Anggaran
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1 font-mono">
                      {details.budget}
                    </p>
                  </div>
                )}

                {details.revenue && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-[#6e8579] font-bold">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Pendapatan
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1 font-mono">
                      {details.revenue}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CAST & CREW */}
          {activeTab === 'cast' && details.cast && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                Daftar Pemeran Utama
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {details.cast.map((actor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group"
                  >
                    {actor.profilePath ? (
                      <img
                        src={actor.profilePath}
                        alt={actor.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#6e8579]">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                        {actor.name}
                      </p>
                      {actor.character && (
                        <p className="text-[11px] text-[#7d9387] truncate mt-0.5">
                          {actor.character}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TV EPISODES */}
          {activeTab === 'episodes' && details.mediaType === 'tv' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Daftar Episode
                </h3>

                {/* Season Dropdown Selector */}
                {details.seasonsCount && details.seasonsCount > 1 && (
                  <select
                    value={selectedSeason}
                    onChange={(e) => loadSeasonEpisodes(Number(e.target.value))}
                    className="bg-black/60 border border-white/15 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-primary backdrop-blur-xl"
                  >
                    {Array.from({ length: details.seasonsCount }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-[#0c120f] text-white">
                        Season {i + 1}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {isLoadingEpisodes ? (
                <div className="py-16 flex justify-center items-center text-xs text-[#879b91]">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2.5" />
                  Memuat daftar episode...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {episodes.map((ep) => (
                    <div
                      key={ep.episodeNumber}
                      onClick={() => handlePlayEpisode(ep)}
                      className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-primary/40 cursor-pointer transition-all group active:scale-[0.98]"
                    >
                      {/* Episode Thumbnail with Play Overlay */}
                      <div className="relative w-28 h-18 sm:w-32 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-black/60 border border-white/10">
                        {ep.stillPath ? (
                          <img
                            src={ep.stillPath}
                            alt={ep.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#6e8579] font-mono">
                            EP {ep.episodeNumber}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Episode Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-primary">
                            EPISODE {ep.episodeNumber}
                          </span>
                          {ep.runtime && (
                            <span className="text-[10px] text-[#7d9387] font-mono">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors truncate mt-0.5">
                          {ep.name}
                        </h4>
                        <p className="text-[11px] text-[#8fa298] line-clamp-2 mt-1 leading-snug">
                          {ep.overview || 'Tidak ada deskripsi untuk episode ini.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

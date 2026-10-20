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
} from 'lucide-react';
import { MediaItem, PlaybackTarget, TvEpisode } from '../../types/index.ts';
import { tmdb } from '../../services/tmdb.ts';
import { zetsuCore } from '../../services/zetsuCore.ts';
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
  const [inList, setInList] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<TvEpisode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isResolvingStream, setIsResolvingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setInList(storage.isInMyList(item.id));

    if (item.mediaType === 'tv') {
      loadSeasonEpisodes(1);
    }
  }, [item]);

  if (!item) return null;

  const loadSeasonEpisodes = async (seasonNum: number) => {
    if (!item) return;
    setSelectedSeason(seasonNum);
    setIsLoadingEpisodes(true);
    const seasonData = await tmdb.getTvSeason(item.id, seasonNum);
    setEpisodes(seasonData?.episodes || []);
    setIsLoadingEpisodes(false);
  };

  const handleToggleList = () => {
    const newState = storage.toggleMyList(item);
    setInList(newState);
  };

  const handlePlayMovie = async () => {
    setIsResolvingStream(true);
    setStreamError(null);
    const result = await zetsuCore.resolveMovieStreams(String(item.id));
    setIsResolvingStream(false);

    if (result.sources && result.sources.length > 0) {
      onStartPlayback({
        title: item.title,
        mediaType: 'movie',
        url: result.sources[0].url,
        sources: result.sources,
        subtitles: result.subtitles,
        tmdbId: String(item.id),
        backdrop: item.backdropPath,
      });
    } else {
      setStreamError(result.error || 'No active streams found. Ensure Zetsu Core server is running at http://localhost:3000.');
    }
  };

  const handlePlayEpisode = async (ep: TvEpisode) => {
    setIsResolvingStream(true);
    setStreamError(null);
    const result = await zetsuCore.resolveTvStreams(
      String(item.id),
      selectedSeason,
      ep.episodeNumber
    );
    setIsResolvingStream(false);

    if (result.sources && result.sources.length > 0) {
      onStartPlayback({
        title: `${item.title} - S${selectedSeason}E${ep.episodeNumber}: ${ep.name}`,
        mediaType: 'tv',
        url: result.sources[0].url,
        sources: result.sources,
        subtitles: result.subtitles,
        tmdbId: String(item.id),
        season: selectedSeason,
        episode: ep.episodeNumber,
        backdrop: ep.stillPath || item.backdropPath,
      });
    } else {
      setStreamError(result.error || 'No active streams found. Ensure Zetsu Core server is running at http://localhost:3000.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c120f] border border-[#1b2722] rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left">
        {/* Backdrop Banner with Gradient Overlay */}
        <div className="relative h-72 md:h-96 w-full shrink-0 overflow-hidden">
          <img
            src={item.backdropPath}
            alt={item.title}
            className="w-full h-full object-cover object-top scale-105 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c120f] via-[#0c120f]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c120f] via-[#0c120f]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Backdrop Floating Metadata */}
          <div className="absolute bottom-6 left-8 right-8 z-10 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-black font-mono">
                {item.mediaType === 'movie' ? 'Movie' : 'TV Series'}
              </span>
              {item.voteAverage && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-current" /> {item.voteAverage}
                </span>
              )}
              {item.releaseDate && (
                <span className="flex items-center gap-1 text-xs text-[#9bb0a5] bg-black/30 px-2 py-0.5 rounded">
                  <Calendar className="w-3 h-3" /> {item.releaseDate.slice(0, 4)}
                </span>
              )}
              {item.duration && (
                <span className="flex items-center gap-1 text-xs text-[#9bb0a5] bg-black/30 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3" /> {item.duration}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
              {item.title}
            </h1>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {item.mediaType === 'movie' && (
                <button
                  onClick={handlePlayMovie}
                  disabled={isResolvingStream}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {isResolvingStream ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Resolving Stream...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Play Movie
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleToggleList}
                className="flex items-center gap-2 px-4 py-3 bg-[#151f1a] hover:bg-[#1d2b24] text-white text-xs font-semibold rounded-xl border border-[#23332c] transition-all"
              >
                {inList ? (
                  <>
                    <Check className="w-4 h-4 text-primary" /> In My List
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" /> Add to List
                  </>
                )}
              </button>
            </div>

            {streamError && (
              <div className="mt-2 p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200 backdrop-blur-md">
                ⚠️ {streamError}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Details & Episode Picker */}
        <div className="p-8 overflow-y-auto space-y-6">
          {/* Overview */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#71867c] mb-2">
              Synopsis
            </h3>
            <p className="text-sm text-[#cbdad1] leading-relaxed max-w-3xl font-normal">
              {item.overview}
            </p>
          </div>

          {/* TV Seasons & Episodes Browser */}
          {item.mediaType === 'tv' && (
            <div className="space-y-4 pt-4 border-t border-[#18231e]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Episodes
                </h3>

                {/* Season Selector */}
                {item.seasonsCount && item.seasonsCount > 1 && (
                  <select
                    value={selectedSeason}
                    onChange={(e) => loadSeasonEpisodes(Number(e.target.value))}
                    className="bg-[#121a16] border border-[#23332c] text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
                  >
                    {Array.from({ length: item.seasonsCount }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Season {i + 1}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {isLoadingEpisodes ? (
                <div className="py-12 flex justify-center items-center text-xs text-[#879b91]">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Loading season episodes...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {episodes.map((ep) => (
                    <div
                      key={ep.episodeNumber}
                      onClick={() => handlePlayEpisode(ep)}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#101713] hover:bg-[#15201b] border border-[#1b2621] hover:border-primary/40 cursor-pointer transition-all group"
                    >
                      {/* Thumbnail with hover play icon */}
                      <div className="relative w-28 h-16 rounded-xl overflow-hidden bg-black shrink-0">
                        {ep.stillPath ? (
                          <img
                            src={ep.stillPath}
                            alt={ep.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#17211d] text-[10px] text-[#697d73]">
                            S{selectedSeason}E{ep.episodeNumber}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 text-primary fill-current" />
                        </div>
                      </div>

                      {/* Episode Meta */}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono font-bold text-primary">
                          Episode {ep.episodeNumber}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                          {ep.name}
                        </h4>
                        <p className="text-[11px] text-[#788d83] line-clamp-2 mt-0.5">
                          {ep.overview || 'Watch this episode.'}
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

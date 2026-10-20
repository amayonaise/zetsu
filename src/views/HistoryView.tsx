import React, { useEffect, useState } from 'react';
import { Clock, Play, Trash2 } from 'lucide-react';
import { ContinueWatchingItem, PlaybackTarget } from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { zetsuCore } from '../services/zetsuCore.ts';

interface Props {
  onStartPlayback: (target: PlaybackTarget) => void;
  onBrowseCatalog: () => void;
}

export const HistoryView: React.FC<Props> = ({ onStartPlayback, onBrowseCatalog }) => {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    setItems(storage.getContinueWatching());
  }, []);

  const handleResume = async (item: ContinueWatchingItem) => {
    if (item.mediaType === 'movie') {
      const res = await zetsuCore.resolveMovieStreams(item.tmdbId);
      if (res.sources && res.sources.length > 0) {
        onStartPlayback({
          title: item.title,
          mediaType: 'movie',
          url: res.sources[0].url,
          sources: res.sources,
          subtitles: res.subtitles,
          tmdbId: item.tmdbId,
        });
      }
    } else {
      const res = await zetsuCore.resolveTvStreams(
        item.tmdbId,
        item.season || 1,
        item.episode || 1
      );
      if (res.sources && res.sources.length > 0) {
        onStartPlayback({
          title: item.title,
          mediaType: 'tv',
          url: res.sources[0].url,
          sources: res.sources,
          subtitles: res.subtitles,
          tmdbId: item.tmdbId,
          season: item.season,
          episode: item.episode,
        });
      }
    }
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storage.removeFromContinueWatching(id);
    setItems(storage.getContinueWatching());
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" /> Continue Watching & History
        </h1>
        <p className="text-xs text-[#7e9489]">
          Resume exactly where you left off across all your movie and television streams.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-[#0c120f] border border-[#1b2721] rounded-3xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-[#141e19] text-primary flex items-center justify-center mx-auto border border-[#202e27]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Watching History</h3>
            <p className="text-xs text-[#73887d] max-w-sm mx-auto mt-1">
              Start streaming any movie or episode, and Zetsu will automatically track your progress.
            </p>
          </div>
          <button
            onClick={onBrowseCatalog}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Start Watching
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleResume(item)}
              className="group relative bg-[#0e1411] border border-[#1a2520] hover:border-primary/50 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-lg"
            >
              <div className="relative h-40 w-full bg-black overflow-hidden">
                <img
                  src={item.backdropPath}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 rounded-full bg-primary text-black shadow-lg">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemove(e, item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600/80 text-white/80 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from History"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-[#80958b] mt-1 font-mono">
                  <span>
                    {item.season && item.episode ? `S${item.season} E${item.episode}` : 'Feature Film'}
                  </span>
                  <span className="text-primary font-bold">{item.progressPercent}% Completed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

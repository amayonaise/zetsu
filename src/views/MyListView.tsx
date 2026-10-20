import React, { useEffect, useState } from 'react';
import { Bookmark, Star, Trash2 } from 'lucide-react';
import { MediaItem } from '../types/index.ts';
import { storage } from '../services/storage.ts';

interface Props {
  onSelectMedia: (item: MediaItem) => void;
  onBrowseCatalog: () => void;
}

export const MyListView: React.FC<Props> = ({ onSelectMedia, onBrowseCatalog }) => {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setItems(storage.getMyList());
  }, []);

  const handleRemove = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    storage.toggleMyList(item);
    setItems(storage.getMyList());
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-primary" /> My Watchlist
        </h1>
        <p className="text-xs text-[#7e9489]">
          Titles you've saved to watch later across movies and series.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-[#0c120f] border border-[#1b2721] rounded-3xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-[#141e19] text-primary flex items-center justify-center mx-auto border border-[#202e27]">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-[#73887d] max-w-sm mx-auto mt-1">
              Explore trending movies and popular television series, then click "Add to List" to save them here.
            </p>
          </div>
          <button
            onClick={onBrowseCatalog}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Explore Cinema
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectMedia(item)}
              className="group bg-[#0e1411] border border-[#1a2520] hover:border-primary/50 rounded-2xl overflow-hidden cursor-pointer transition-all relative"
            >
              <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                <img
                  src={item.posterPath}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                <button
                  onClick={(e) => handleRemove(e, item)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600/80 text-white/80 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from List"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-[#8ea498] mt-1">
                    <span>{item.releaseDate?.slice(0, 4)}</span>
                    {item.voteAverage && (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> {item.voteAverage}
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

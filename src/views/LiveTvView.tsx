import React, { useEffect, useState } from 'react';
import { Radio, Play, Shield } from 'lucide-react';
import { PlaybackTarget, SportsMatch } from '../types/index.ts';
import { zetsuCore } from '../services/zetsuCore.ts';

interface Props {
  onStartPlayback: (target: PlaybackTarget) => void;
}

export const LiveTvView: React.FC<Props> = ({ onStartPlayback }) => {
  const [channels, setChannels] = useState<SportsMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLiveFeeds();
  }, []);

  const loadLiveFeeds = async () => {
    setIsLoading(true);
    const data = await zetsuCore.getLiveMatches();
    setChannels(data);
    setIsLoading(false);
  };

  const handlePlayChannel = async (channel: SportsMatch) => {
    const source = channel.sources?.[0]?.source || 'alpha';
    const result = await zetsuCore.resolveSportsStream(channel.id, source, 1);
    onStartPlayback({
      title: `${channel.title} (Live TV)`,
      mediaType: 'sports',
      url: result.m3u8 || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      referer: result.referer || 'https://streamed.st/',
      isLive: true,
    });
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Radio className="w-6 h-6 text-red-500 animate-pulse" /> Live Broadcasts & Channels
        </h1>
        <p className="text-xs text-[#7e9489]">
          24/7 decrypted live sports networks and event broadcast channels.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center items-center text-xs text-[#788e83]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
          Scanning live broadcasts...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {channels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => handlePlayChannel(ch)}
              className="bg-[#0e1411] hover:bg-[#131c18] border border-[#1b2721] hover:border-red-500/50 rounded-2xl p-5 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#697f74]">
                  {ch.category}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/30 font-mono">
                  <Radio className="w-3 h-3 animate-pulse" /> ON AIR
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2 my-2">
                {ch.title}
              </h3>

              <div className="mt-4 pt-3 border-t border-[#18231e] flex items-center justify-between text-xs text-[#768b80]">
                <span className="font-mono text-[11px] text-primary flex items-center gap-1">
                  <Shield className="w-3 h-3" /> WASM Decrypted
                </span>
                <span className="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 fill-current" /> Watch
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

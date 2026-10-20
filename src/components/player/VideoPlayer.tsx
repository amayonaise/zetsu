import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Subtitles,
  Settings as SettingsIcon,
  X,
  Radio,
  SkipForward,
  SkipBack,
  Layers,
  PictureInPicture,
} from 'lucide-react';
import { PlaybackTarget, SubtitleTrack } from '../../types/index.ts';
import { storage } from '../../services/storage.ts';

interface Props {
  target: PlaybackTarget | null;
  onClose: () => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

export const VideoPlayer: React.FC<Props> = ({
  target,
  onClose,
  onNextEpisode,
  onPrevEpisode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(true);

  // Settings drawers
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  // Subtitles & Sources
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!target) return;

    setSubtitles(target.subtitles || []);
    const defaultSub = (target.subtitles || []).find(
      s => s.lang === storage.getDefaultSubtitleLang() || s.isIndonesian
    );
    if (defaultSub) {
      setSelectedSubtitle(defaultSub.lang);
    } else {
      setSelectedSubtitle('off');
    }

    const video = videoRef.current;
    if (!video) return;

    const streamUrl = target.sources?.[currentSourceIndex]?.url || target.url;
    setIsBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = streamUrl.includes('.m3u8') || target.isLive;

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (!streamUrl.includes('/api/hls') && !streamUrl.includes('/api/proxy')) {
            const localProxyUrl = `http://localhost:3000/api/hls?url=${encodeURIComponent(streamUrl)}&referer=${encodeURIComponent(target.referer || 'https://embed.st/')}`;
            hls.loadSource(localProxyUrl);
            hls.attachMedia(video);
            return;
          }
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else {
      video.src = streamUrl;
      video.load();
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [target, currentSourceIndex]);

  // Handle Controls Timeout
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowSubtitleMenu(false);
        setShowSourceMenu(false);
      }, 3200);
    }
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, [isPlaying]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!target) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, isFullscreen, isPlaying]);

  if (!target) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  const seekRelative = (sec: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + sec));
    resetHideTimer();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
    resetHideTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = Number(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
    resetHideTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    resetHideTimer();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSpeedChange = (rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden font-sans select-none"
    >
      <video
        ref={videoRef}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onTimeUpdate={() => {
          if (!videoRef.current) return;
          setCurrentTime(videoRef.current.currentTime);
          if (videoRef.current.buffered.length > 0) {
            setBuffered(
              videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
            );
          }
          // Save continue watching for movies & series
          if (target.tmdbId && videoRef.current.duration > 0) {
            const pct = Math.floor(
              (videoRef.current.currentTime / videoRef.current.duration) * 100
            );
            storage.saveProgress({
              id: `${target.tmdbId}_${target.season || 0}_${target.episode || 0}`,
              tmdbId: target.tmdbId,
              mediaType: target.mediaType as any,
              title: target.title,
              backdropPath: target.backdrop || '',
              season: target.season,
              episode: target.episode,
              progressPercent: pct,
              currentTime: videoRef.current.currentTime,
              duration: videoRef.current.duration,
            });
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
            setIsBuffering(false);
          }
        }}
        onClick={togglePlay}
        onError={() => {
          const currentSrc = videoRef.current?.src || '';
          if (currentSrc && !currentSrc.includes('/api/hls') && !currentSrc.includes('/api/proxy')) {
            const streamUrl = target.sources?.[currentSourceIndex]?.url || target.url;
            const localProxyUrl = `http://localhost:3000/api/hls?url=${encodeURIComponent(streamUrl)}&referer=${encodeURIComponent(target.referer || 'https://embed.st/')}`;
            if (videoRef.current) {
              videoRef.current.src = localProxyUrl;
              videoRef.current.load();
              videoRef.current.play().catch(() => {});
            }
          }
        }}
        className="w-full h-full object-contain cursor-pointer"
      >
        {subtitles.map((sub, i) => (
          <track
            key={i}
            kind="subtitles"
            src={sub.file}
            srcLang={sub.lang}
            label={sub.label}
            default={selectedSubtitle === sub.lang}
          />
        ))}
      </video>

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#10b981]" />
          <span className="mt-3 text-xs font-mono text-[#cbd9d2] tracking-wider uppercase">
            Buffering Stream...
          </span>
        </div>
      )}

      {/* Top Overlay Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
            title="Close Player (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide truncate max-w-lg">
                {target.title}
              </h2>
              {target.isLive && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold tracking-wider animate-pulse">
                  <Radio className="w-3 h-3" /> LIVE
                </span>
              )}
            </div>
            {target.season && target.episode && (
              <p className="text-xs text-[#879b92]">
                Season {target.season} · Episode {target.episode}
              </p>
            )}
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          {target.sources && target.sources.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white backdrop-blur-md border border-white/10"
              >
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Source: {target.sources[currentSourceIndex]?.label || 'Default'}</span>
              </button>
              {showSourceMenu && (
                <div className="absolute right-0 top-10 w-52 bg-[#0c120f] border border-[#1e2a25] rounded-xl shadow-2xl p-2 space-y-1 z-50">
                  <span className="block text-[10px] uppercase font-mono font-bold text-[#687c72] px-2 py-1">
                    Select Server
                  </span>
                  {target.sources.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentSourceIndex(idx);
                        setShowSourceMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        currentSourceIndex === idx
                          ? 'bg-primary text-black font-bold'
                          : 'text-[#9cb0a5] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek Progress Bar */}
        {!target.isLive && (
          <div className="relative flex items-center mb-3 group cursor-pointer">
            {/* Buffered track */}
            <div
              className="absolute h-1 bg-white/20 rounded-full"
              style={{
                width: `${duration > 0 ? (buffered / duration) * 100 : 0}%`,
              }}
            />
            {/* Range input */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-primary cursor-pointer focus:outline-none"
            />
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          {/* Left: Play/Pause, Replay/Forward, Volume */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-3 bg-primary hover:bg-primary-hover text-black rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {!target.isLive && (
              <>
                <button
                  onClick={() => seekRelative(-10)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  title="Rewind 10s (Left Arrow)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => seekRelative(10)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  title="Forward 10s (Right Arrow)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Episode Navigation for TV Shows */}
            {onPrevEpisode && (
              <button
                onClick={onPrevEpisode}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
                title="Previous Episode"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}
            {onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
                title="Next Episode"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Volume */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={toggleMute}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 accent-primary rounded-full cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Timestamp */}
            <span className="text-xs font-mono text-[#9bb0a5] ml-2">
              {target.isLive ? (
                <span className="text-red-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> LIVE ACTION
                </span>
              ) : (
                `${formatTime(currentTime)} / ${formatTime(duration)}`
              )}
            </span>
          </div>

          {/* Right: Subtitles, Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Subtitles */}
            <div className="relative">
              <button
                onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                className={`p-2 rounded-xl transition-all ${
                  selectedSubtitle !== 'off'
                    ? 'text-primary bg-primary/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title="Subtitles"
              >
                <Subtitles className="w-4 h-4" />
              </button>
              {showSubtitleMenu && (
                <div className="absolute right-0 bottom-12 w-48 bg-[#0c120f] border border-[#1e2a25] rounded-xl shadow-2xl p-2 space-y-1 z-50">
                  <span className="block text-[10px] uppercase font-mono font-bold text-[#687c72] px-2 py-1">
                    Subtitles
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSubtitle('off');
                      setShowSubtitleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedSubtitle === 'off' ? 'bg-primary text-black' : 'text-[#8ea499] hover:bg-white/10'
                    }`}
                  >
                    Off
                  </button>
                  {subtitles.map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedSubtitle(sub.lang);
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                        selectedSubtitle === sub.lang
                          ? 'bg-primary text-black'
                          : 'text-[#8ea499] hover:bg-white/10'
                      }`}
                    >
                      {sub.label} {sub.isIndonesian && '🇮🇩'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute right-0 bottom-12 w-28 bg-[#0c120f] border border-[#1e2a25] rounded-xl shadow-2xl p-1.5 space-y-1 z-50 font-mono text-xs">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`w-full text-left px-2 py-1 rounded-lg ${
                        playbackRate === rate ? 'bg-primary text-black font-bold' : 'text-[#8ea499] hover:bg-white/10'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            {document.pictureInPictureEnabled && (
              <button
                onClick={() => {
                  if (document.pictureInPictureElement) {
                    document.exitPictureInPicture().catch(() => {});
                  } else if (videoRef.current) {
                    videoRef.current.requestPictureInPicture().catch(() => {});
                  }
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

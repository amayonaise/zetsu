export type NavigationTab = 
  | 'home' 
  | 'movies' 
  | 'tv' 
  | 'sports' 
  | 'livetv' 
  | 'mylist' 
  | 'history' 
  | 'settings';

export interface MediaItem {
  id: number | string;
  tmdbId?: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  voteAverage?: number;
  genres?: string[];
  duration?: string;
  seasonsCount?: number;
}

export interface TvSeason {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  episodes?: TvEpisode[];
}

export interface TvEpisode {
  episodeNumber: number;
  name: string;
  overview: string;
  stillPath: string;
  airDate: string;
  runtime?: number;
}

export interface SportsMatch {
  id: string;
  title: string;
  category: string;
  date: number; // ms
  poster?: string;
  popular?: boolean;
  status?: 'LIVE' | 'UPCOMING' | 'FINISHED';
  elapsed?: string;
  score?: string;
  teams?: {
    home?: { name: string; badge?: string };
    away?: { name: string; badge?: string };
  };
  sources?: { source: string; id: string }[];
}

export interface StreamSource {
  id?: string;
  source: string;
  label: string;
  url: string;
  type?: 'hls' | 'mp4';
  quality?: string;
  hd?: boolean;
  language?: string;
  referer?: string;
}

export interface SubtitleTrack {
  file: string;
  label: string;
  lang: string;
  isIndonesian?: boolean;
  default?: boolean;
}

export interface ContinueWatchingItem {
  id: string;
  tmdbId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  backdropPath: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  progressPercent: number; // 0 - 100
  currentTime: number;
  duration: number;
  updatedAt: number;
}

export interface PlaybackTarget {
  title: string;
  mediaType: 'movie' | 'tv' | 'sports';
  url: string;
  referer?: string;
  isLive?: boolean;
  subtitles?: SubtitleTrack[];
  sources?: StreamSource[];
  currentSourceIndex?: number;
  tmdbId?: string;
  season?: number;
  episode?: number;
  backdrop?: string;
}

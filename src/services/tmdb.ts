import { MediaItem, TvSeason } from '../types/index.ts';
import { storage } from './storage.ts';
import { MOCK_HERO_MOVIE, MOCK_POPULAR_TV, MOCK_TRENDING_MOVIES } from './mockData.ts';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdb = {
  async validateApiKey(key: string): Promise<boolean> {
    if (!key || key.trim().length < 20) return false;
    try {
      const res = await fetch(`${TMDB_BASE_URL}/configuration?api_key=${key.trim()}`);
      return res.ok;
    } catch {
      return false;
    }
  },

  async getTrending(type: 'all' | 'movie' | 'tv' = 'all'): Promise<MediaItem[]> {
    const key = storage.getTmdbKey();
    if (!key) {
      return type === 'tv' ? MOCK_POPULAR_TV : MOCK_TRENDING_MOVIES;
    }
    try {
      const res = await fetch(`${TMDB_BASE_URL}/trending/${type}/day?api_key=${key}`);
      if (!res.ok) throw new Error('TMDB fetch failed');
      const data = await res.json();
      return (data.results || []).map((item: any) => this.mapTmdbItem(item, item.media_type || (type === 'all' ? 'movie' : type)));
    } catch {
      return type === 'tv' ? MOCK_POPULAR_TV : MOCK_TRENDING_MOVIES;
    }
  },

  async getPopularMovies(page: number = 1): Promise<MediaItem[]> {
    const key = storage.getTmdbKey();
    if (!key) return MOCK_TRENDING_MOVIES;
    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${key}&page=${page}`);
      if (!res.ok) throw new Error('TMDB fetch failed');
      const data = await res.json();
      return (data.results || []).map((item: any) => this.mapTmdbItem(item, 'movie'));
    } catch {
      return MOCK_TRENDING_MOVIES;
    }
  },

  async getPopularTv(page: number = 1): Promise<MediaItem[]> {
    const key = storage.getTmdbKey();
    if (!key) return MOCK_POPULAR_TV;
    try {
      const res = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${key}&page=${page}`);
      if (!res.ok) throw new Error('TMDB fetch failed');
      const data = await res.json();
      return (data.results || []).map((item: any) => this.mapTmdbItem(item, 'tv'));
    } catch {
      return MOCK_POPULAR_TV;
    }
  },

  async getDetails(id: string | number, type: 'movie' | 'tv'): Promise<MediaItem | null> {
    const key = storage.getTmdbKey();
    if (!key) {
      const all = [...MOCK_TRENDING_MOVIES, ...MOCK_POPULAR_TV];
      return all.find(i => String(i.id) === String(id)) || MOCK_HERO_MOVIE;
    }
    try {
      const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${key}&append_to_response=credits,similar`);
      if (!res.ok) throw new Error('TMDB details failed');
      const item = await res.json();
      return this.mapTmdbItem(item, type);
    } catch {
      return null;
    }
  },

  async getTvSeason(tvId: string | number, seasonNumber: number): Promise<TvSeason | null> {
    const key = storage.getTmdbKey();
    if (!key) {
      // Mock Season 1 episodes
      return {
        seasonNumber,
        name: `Season ${seasonNumber}`,
        episodeCount: 8,
        episodes: Array.from({ length: 8 }, (_, i) => ({
          episodeNumber: i + 1,
          name: `Episode ${i + 1}: The Beginning of the End`,
          overview: 'The tensions rise as the factions collide in a battle for control and survival.',
          stillPath: 'https://image.tmdb.org/t/p/w500/h96sM8y8c0iJpG1x0z34yV8a0x.jpg',
          airDate: '2024',
          runtime: 54,
        })),
      };
    }
    try {
      const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${key}`);
      if (!res.ok) throw new Error('TMDB season failed');
      const data = await res.json();
      return {
        seasonNumber: data.season_number,
        name: data.name,
        episodeCount: (data.episodes || []).length,
        episodes: (data.episodes || []).map((ep: any) => ({
          episodeNumber: ep.episode_number,
          name: ep.name,
          overview: ep.overview,
          stillPath: ep.still_path ? `${IMAGE_BASE_URL}/w500${ep.still_path}` : '',
          airDate: ep.air_date,
          runtime: ep.runtime,
        })),
      };
    } catch {
      return null;
    }
  },

  async search(query: string, type: 'multi' | 'movie' | 'tv' = 'multi'): Promise<MediaItem[]> {
    if (!query.trim()) return [];
    const key = storage.getTmdbKey();
    if (!key) {
      const q = query.toLowerCase();
      const all = [...MOCK_TRENDING_MOVIES, ...MOCK_POPULAR_TV];
      return all.filter(i => i.title.toLowerCase().includes(q));
    }
    try {
      const res = await fetch(`${TMDB_BASE_URL}/search/${type}?api_key=${key}&query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('TMDB search failed');
      const data = await res.json();
      return (data.results || [])
        .filter((i: any) => i.poster_path || i.backdrop_path)
        .map((item: any) => this.mapTmdbItem(item, item.media_type || (type === 'multi' ? 'movie' : type)));
    } catch {
      return [];
    }
  },

  mapTmdbItem(item: any, type: 'movie' | 'tv'): MediaItem {
    return {
      id: item.id,
      tmdbId: String(item.id),
      title: item.title || item.name || 'Untitled',
      overview: item.overview || 'No synopsis available.',
      posterPath: item.poster_path
        ? `${IMAGE_BASE_URL}/w500${item.poster_path}`
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
      backdropPath: item.backdrop_path
        ? `${IMAGE_BASE_URL}/original${item.backdrop_path}`
        : item.poster_path
        ? `${IMAGE_BASE_URL}/original${item.poster_path}`
        : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1280&auto=format&fit=crop&q=80',
      mediaType: type,
      releaseDate: item.release_date || item.first_air_date,
      voteAverage: item.vote_average ? Number(item.vote_average.toFixed(1)) : undefined,
      genres: item.genres?.map((g: any) => g.name) || [],
      duration: item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : undefined,
      seasonsCount: item.number_of_seasons,
    };
  },
};

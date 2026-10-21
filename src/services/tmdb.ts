import { MediaItem, TvSeason } from '../types/index.ts';
import { storage } from './storage.ts';
import { MOCK_HERO_MOVIE, MOCK_POPULAR_TV, MOCK_TRENDING_MOVIES } from './mockData.ts';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const TMDB_GENRES_MOVIE: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const TMDB_GENRES_TV: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

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
    const res = await this.discoverMovies({ sortBy: 'popularity.desc', page });
    return res.results;
  },

  async getPopularTv(page: number = 1): Promise<MediaItem[]> {
    const res = await this.discoverTv({ sortBy: 'popularity.desc', page });
    return res.results;
  },

  async discoverMovies(params: {
    genreId?: number;
    sortBy?: string;
    page?: number;
  } = {}): Promise<{ results: MediaItem[]; page: number; totalPages: number }> {
    const key = storage.getTmdbKey();
    const page = params.page || 1;
    if (!key) {
      let filtered = [...MOCK_TRENDING_MOVIES];
      if (params.genreId && TMDB_GENRES_MOVIE[params.genreId]) {
        const target = TMDB_GENRES_MOVIE[params.genreId].toLowerCase();
        filtered = filtered.filter((m) =>
          m.genres?.some((g) => g.toLowerCase() === target)
        );
      }
      return { results: filtered, page: 1, totalPages: 1 };
    }

    try {
      const sortParam = params.sortBy || 'popularity.desc';
      const extraParams = sortParam.startsWith('vote_average') ? '&vote_count.gte=200' : '';
      const genreParam = params.genreId ? `&with_genres=${params.genreId}` : '';
      const url = `${TMDB_BASE_URL}/discover/movie?api_key=${key}&sort_by=${sortParam}${extraParams}${genreParam}&page=${page}&include_adult=false`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('TMDB discover movies failed');
      const data = await res.json();

      return {
        results: (data.results || []).map((item: any) => this.mapTmdbItem(item, 'movie')),
        page: data.page || page,
        totalPages: Math.min(data.total_pages || 1, 500), // TMDB caps discover at 500 pages
      };
    } catch {
      return { results: MOCK_TRENDING_MOVIES, page: 1, totalPages: 1 };
    }
  },

  async discoverTv(params: {
    genreId?: number;
    sortBy?: string;
    page?: number;
  } = {}): Promise<{ results: MediaItem[]; page: number; totalPages: number }> {
    const key = storage.getTmdbKey();
    const page = params.page || 1;
    if (!key) {
      let filtered = [...MOCK_POPULAR_TV];
      if (params.genreId && TMDB_GENRES_TV[params.genreId]) {
        const target = TMDB_GENRES_TV[params.genreId].toLowerCase();
        filtered = filtered.filter((m) =>
          m.genres?.some((g) => g.toLowerCase() === target)
        );
      }
      return { results: filtered, page: 1, totalPages: 1 };
    }

    try {
      const sortParam = params.sortBy || 'popularity.desc';
      const extraParams = sortParam.startsWith('vote_average') ? '&vote_count.gte=100' : '';
      const genreParam = params.genreId ? `&with_genres=${params.genreId}` : '';
      const url = `${TMDB_BASE_URL}/discover/tv?api_key=${key}&sort_by=${sortParam}${extraParams}${genreParam}&page=${page}&include_adult=false`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('TMDB discover TV failed');
      const data = await res.json();

      return {
        results: (data.results || []).map((item: any) => this.mapTmdbItem(item, 'tv')),
        page: data.page || page,
        totalPages: Math.min(data.total_pages || 1, 500),
      };
    } catch {
      return { results: MOCK_POPULAR_TV, page: 1, totalPages: 1 };
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
    const genreMap = type === 'tv' ? TMDB_GENRES_TV : TMDB_GENRES_MOVIE;
    const mappedGenres: string[] = item.genres
      ? item.genres.map((g: any) => g.name)
      : Array.isArray(item.genre_ids)
      ? item.genre_ids
          .map((id: number) => genreMap[id] || TMDB_GENRES_MOVIE[id] || TMDB_GENRES_TV[id])
          .filter(Boolean)
      : [];

    // Extract Director or Creator
    let director: string | undefined;
    if (type === 'movie' && Array.isArray(item.credits?.crew)) {
      const dirObj = item.credits.crew.find((c: any) => c.job === 'Director');
      if (dirObj) director = dirObj.name;
    } else if (type === 'tv') {
      if (Array.isArray(item.created_by) && item.created_by.length > 0) {
        director = item.created_by.map((c: any) => c.name).join(', ');
      } else if (Array.isArray(item.credits?.crew)) {
        const creatorObj = item.credits.crew.find((c: any) => c.job === 'Executive Producer' || c.job === 'Director');
        if (creatorObj) director = creatorObj.name;
      }
    }

    // Extract top 12 cast members
    const cast = Array.isArray(item.credits?.cast)
      ? item.credits.cast.slice(0, 12).map((c: any) => ({
          name: c.name,
          character: c.character,
          profilePath: c.profile_path ? `${IMAGE_BASE_URL}/w185${c.profile_path}` : undefined,
        }))
      : undefined;

    // Production companies
    const productionCompanies = Array.isArray(item.production_companies)
      ? item.production_companies.map((p: any) => p.name).slice(0, 4)
      : undefined;

    // Formatted budget & revenue
    const formatCurrency = (val: number) => {
      if (!val || val <= 0) return undefined;
      return `$${(val / 1000000).toFixed(1)}M`;
    };

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
      voteCount: item.vote_count,
      genres: mappedGenres,
      duration: item.runtime
        ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
        : Array.isArray(item.episode_run_time) && item.episode_run_time[0]
        ? `${item.episode_run_time[0]}m / ep`
        : undefined,
      seasonsCount: item.number_of_seasons,
      tagline: item.tagline,
      status: item.status,
      director,
      cast,
      productionCompanies,
      budget: formatCurrency(item.budget),
      revenue: formatCurrency(item.revenue),
      originalLanguage: item.original_language?.toUpperCase(),
    };
  },
};

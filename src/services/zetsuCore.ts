import { SportsMatch, StreamSource, SubtitleTrack } from '../types/index.ts';
import { storage } from './storage.ts';
import { MOCK_SPORTS_MATCHES } from './mockData.ts';

async function fetchWithWarmup(url: string, init?: RequestInit, maxRetries = 4): Promise<Response> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status >= 500 && attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }
  throw lastError || new Error('Connection failed');
}

export const zetsuCore = {
  getBaseUrl(): string {
    return storage.getBackendUrl();
  },

  async isOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/`, { method: 'GET', signal: AbortSignal.timeout(2500) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getLiveMatches(): Promise<SportsMatch[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/matches/live`, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error('Failed to fetch live matches');
      const data = await res.json();
      return (data || []).map((m: any) => ({
        ...m,
        status: 'LIVE',
        elapsed: 'LIVE',
      }));
    } catch {
      return MOCK_SPORTS_MATCHES.filter(m => m.status === 'LIVE');
    }
  },

  async getTodayMatches(): Promise<SportsMatch[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/matches/all-today`, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error('Failed to fetch today matches');
      return await res.json();
    } catch {
      return MOCK_SPORTS_MATCHES;
    }
  },

  async getAllMatches(): Promise<SportsMatch[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/matches/all`, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error('Failed to fetch all matches');
      return await res.json();
    } catch {
      return MOCK_SPORTS_MATCHES;
    }
  },

  async getSportMatches(sport: string): Promise<SportsMatch[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/matches/${sport}`, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error('Failed to fetch sport matches');
      return await res.json();
    } catch {
      return MOCK_SPORTS_MATCHES.filter(m => m.category.toLowerCase() === sport.toLowerCase());
    }
  },

  async resolveSportsStream(matchId: string, source: string, streamNo: number = 1): Promise<{
    ok: boolean;
    m3u8?: string;
    referer?: string;
    relay?: string;
    error?: string;
  }> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/sports/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, source, stream: streamNo }),
        signal: AbortSignal.timeout(12000),
      });
      return await res.json();
    } catch (e: any) {
      return {
        ok: true,
        m3u8: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        referer: 'https://streamed.st/',
      };
    }
  },

  async resolveMovieStreams(tmdbId: string): Promise<{
    success: boolean;
    sources: StreamSource[];
    subtitles: SubtitleTrack[];
    title?: string;
    error?: string;
  }> {
    try {
      const res = await fetchWithWarmup(`${this.getBaseUrl()}/api/movies/${tmdbId}`, { 
        signal: AbortSignal.timeout(25000) 
      });
      if (!res.ok) throw new Error('Backend HTTP error');
      const data = await res.json();
      return {
        success: data.success ?? true,
        sources: (data.sources || []).map((s: any) => ({
          ...s,
          label: s.label || s.source,
          url: s.url.startsWith('/') ? `${this.getBaseUrl()}${s.url}` : s.url,
        })),
        subtitles: (data.subtitles || []).map((sub: any) => ({
          ...sub,
          file: sub.file && sub.file.startsWith('/') ? `${this.getBaseUrl()}${sub.file}` : sub.file,
        })),
        title: data.title,
      };
    } catch (err: any) {
      console.warn('Backend unavailable, falling back:', err);
      return {
        success: false,
        error: 'Backend server at http://localhost:3000 is not responding. Please start Zetsu Core.',
        sources: [],
        subtitles: [],
      };
    }
  },

  async resolveTvStreams(tmdbId: string, season: number, episode: number): Promise<{
    success: boolean;
    sources: StreamSource[];
    subtitles: SubtitleTrack[];
    title?: string;
    error?: string;
  }> {
    try {
      const res = await fetchWithWarmup(`${this.getBaseUrl()}/api/tv/${tmdbId}/${season}/${episode}`, { 
        signal: AbortSignal.timeout(25000) 
      });
      if (!res.ok) throw new Error('Backend HTTP error');
      const data = await res.json();
      return {
        success: data.success ?? true,
        sources: (data.sources || []).map((s: any) => ({
          ...s,
          label: s.label || s.source,
          url: s.url.startsWith('/') ? `${this.getBaseUrl()}${s.url}` : s.url,
        })),
        subtitles: (data.subtitles || []).map((sub: any) => ({
          ...sub,
          file: sub.file && sub.file.startsWith('/') ? `${this.getBaseUrl()}${sub.file}` : sub.file,
        })),
        title: data.title,
      };
    } catch (err: any) {
      console.warn('Backend unavailable, falling back:', err);
      return {
        success: false,
        error: 'Backend server at http://localhost:3000 is not responding. Please start Zetsu Core.',
        sources: [],
        subtitles: [],
      };
    }
  },
};

import { ContinueWatchingItem, MediaItem } from '../types/index.ts';

// Optional build-time default so onboarding can be pre-filled. Anything the
// user saves in Settings still wins. Set VITE_DEFAULT_TMDB_KEY in a local
// `.env` file — never commit a real key.
const DEFAULT_TMDB_KEY = (import.meta.env.VITE_DEFAULT_TMDB_KEY as string | undefined) ?? '';

const DEFAULT_BACKEND_URL = 'https://junction-distributed-raymond-illustrated.trycloudflare.com';

const KEYS = {
  TMDB_API_KEY: 'zetsu_tmdb_api_key',
  BACKEND_URL: 'zetsu_backend_url',
  MY_LIST: 'zetsu_my_list',
  CONTINUE_WATCHING: 'zetsu_continue_watching',
  SUBTITLE_LANG: 'zetsu_default_sub_lang',
  HAS_ONBOARDED: 'zetsu_has_onboarded',
};

// The desktop app used to bundle and spawn a local Node server on port 3000.
// The resolver now lives on the VPS only, so any leftover localhost override
// stored by an older build is dead — drop it and fall back to the VPS default.
const LEGACY_LOCAL_BACKEND =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)(:\d+)?(\/.*)?$/i;

function normalizeBackendUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export const storage = {
  getTmdbKey(): string {
    return localStorage.getItem(KEYS.TMDB_API_KEY) || DEFAULT_TMDB_KEY;
  },
  setTmdbKey(key: string) {
    if (key) {
      localStorage.setItem(KEYS.TMDB_API_KEY, key.trim());
      localStorage.setItem(KEYS.HAS_ONBOARDED, 'true');
    } else {
      localStorage.removeItem(KEYS.TMDB_API_KEY);
    }
  },
  hasOnboarded(): boolean {
    return localStorage.getItem(KEYS.HAS_ONBOARDED) === 'true';
  },
  setOnboarded(value: boolean) {
    localStorage.setItem(KEYS.HAS_ONBOARDED, value ? 'true' : 'false');
  },
  getBackendUrl(): string {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEYS.BACKEND_URL);
      if (stored && LEGACY_LOCAL_BACKEND.test(stored.trim())) {
        localStorage.removeItem(KEYS.BACKEND_URL);
        stored = null;
      }
    } catch {
      stored = null;
    }
    return stored ? normalizeBackendUrl(stored) : DEFAULT_BACKEND_URL;
  },
  setBackendUrl(url: string) {
    const normalized = normalizeBackendUrl(url ?? '');
    try {
      if (!normalized || LEGACY_LOCAL_BACKEND.test(normalized)) {
        localStorage.removeItem(KEYS.BACKEND_URL);
        return;
      }
      localStorage.setItem(KEYS.BACKEND_URL, normalized);
    } catch {
      // Ignore storage failures (private mode / quota) — the default still works.
    }
  },
  getMyList(): MediaItem[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.MY_LIST) || '[]');
    } catch {
      return [];
    }
  },
  toggleMyList(item: MediaItem): boolean {
    const list = this.getMyList();
    const idx = list.findIndex(i => String(i.id) === String(item.id));
    if (idx >= 0) {
      list.splice(idx, 1);
      localStorage.setItem(KEYS.MY_LIST, JSON.stringify(list));
      return false;
    } else {
      list.unshift(item);
      localStorage.setItem(KEYS.MY_LIST, JSON.stringify(list));
      return true;
    }
  },
  isInMyList(id: string | number): boolean {
    return this.getMyList().some(i => String(i.id) === String(id));
  },
  getContinueWatching(): ContinueWatchingItem[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.CONTINUE_WATCHING) || '[]');
    } catch {
      return [];
    }
  },
  getProgress(id: string): ContinueWatchingItem | undefined {
    return this.getContinueWatching().find(i => i.id === id);
  },
  saveProgress(item: Omit<ContinueWatchingItem, 'updatedAt'>) {
    const list = this.getContinueWatching().filter(i => i.id !== item.id);
    list.unshift({
      ...item,
      updatedAt: Date.now(),
    });
    // Keep max 20 items
    localStorage.setItem(KEYS.CONTINUE_WATCHING, JSON.stringify(list.slice(0, 20)));
  },
  removeFromContinueWatching(id: string) {
    const list = this.getContinueWatching().filter(i => i.id !== id);
    localStorage.setItem(KEYS.CONTINUE_WATCHING, JSON.stringify(list));
  },
  getDefaultSubtitleLang(): string {
    return localStorage.getItem(KEYS.SUBTITLE_LANG) || 'id'; // Indonesian first
  },
  setDefaultSubtitleLang(lang: string) {
    localStorage.setItem(KEYS.SUBTITLE_LANG, lang);
  },
};

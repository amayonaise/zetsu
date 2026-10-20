import { ContinueWatchingItem, MediaItem } from '../types/index.ts';

const KEYS = {
  TMDB_API_KEY: 'zetsu_tmdb_api_key',
  BACKEND_URL: 'zetsu_backend_url',
  MY_LIST: 'zetsu_my_list',
  CONTINUE_WATCHING: 'zetsu_continue_watching',
  SUBTITLE_LANG: 'zetsu_default_sub_lang',
  HAS_ONBOARDED: 'zetsu_has_onboarded',
};

export const storage = {
  getTmdbKey(): string {
    return localStorage.getItem(KEYS.TMDB_API_KEY) || '';
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
    return localStorage.getItem(KEYS.BACKEND_URL) || 'http://localhost:3000';
  },
  setBackendUrl(url: string) {
    localStorage.setItem(KEYS.BACKEND_URL, url.trim().replace(/\/+$/, ''));
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

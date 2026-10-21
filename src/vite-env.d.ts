/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional TMDB key used to pre-fill onboarding (see `.env.example`). */
  readonly VITE_DEFAULT_TMDB_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

<p align="center">
  <img src="./public/logo.png" alt="ZETSU" width="280" />
</p>

<p align="center">
  <em>"The all-seeing media intelligence desktop."</em><br />
  A premium, cinematic desktop streaming application for <b>Movies</b>, <b>TV Shows</b>, and <b>Live Sports</b>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-blue.svg" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/React-18-61dafb.svg" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" />
</p>

---

## 🌟 Overview

**Zetsu Desktop** combines the cinematic feel of commercial streaming platforms with dedicated live sports broadcast features, built on top of **Tauri v2**, **React**, and **Zetsu Core**:

- 🔑 **Onboarding Setup**: On initial launch, prompts for your free **TMDB API Key** (with live validation) to unlock high-res posters, release years, cast, seasons, and episodes.
- ⚽ **Live Sports Arena**: Football, Basketball (NBA), Motorsport (Formula 1), Combat (UFC), Tennis, and Hockey with live scoreboards, match status, and decrypted feeds.
- 🎬 **Cinema Catalog**: Browse trending movies and popular series with genre chips and sort filters.
- 📺 **TV Series Browser**: Season-by-season episode list with thumbnails, runtime, and 1-click play.
- ⚡ **Immersive Video Player**:
  - HLS `.m3u8` live streaming & direct MP4 playback.
  - Seekbar with buffered progress, volume control, mute, fullscreen.
  - Subtitle track selector (Indonesian 🇮🇩 & English 🇬🇧).
  - Playback speed controls (0.5x to 2x).
  - Picture-in-Picture (PiP).
  - Keyboard shortcuts (`Space` = Play/Pause, `F` = Fullscreen, `M` = Mute, `←/→` = Seek 10s).
- 🔍 **Instant Spotlight Search (`Ctrl + K`)**: Debounced search across movies, series, and sports events.
- 💾 **Local Persistence**: Tracks your **Continue Watching** progress and **My List** locally.

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

Optional — pre-fill the onboarding with a default TMDB key:

```bash
cp .env.example .env   # then set VITE_DEFAULT_TMDB_KEY
```

Without it, the app simply asks for a key on first launch.

### 2. Development Mode

To run in your desktop browser or webview immediately:

```bash
npm run dev
```
Open [`http://localhost:1420`](http://localhost:1420) in your browser.

### 3. Tauri Desktop Mode (Native Window)

If you have Rust and the Microsoft C++ Build Tools installed:

```bash
npm run tauri dev
```

To build a standalone Windows `.exe` / MSI installer:

```bash
npm run tauri build
```

---

## ⚙️ Backend Integration

Zetsu Desktop is a pure client. The **Zetsu Core** resolver API (scrapers for Live Sports, Movies & TV Shows) is hosted on the VPS and reached over HTTPS — nothing is bundled into the `.exe` and no local server is spawned.

1. The endpoint defaults to `https://junction-distributed-raymond-illustrated.trycloudflare.com` (see `DEFAULT_BACKEND_URL` in `src/services/storage.ts`).
2. Override it any time under **Settings → Zetsu Resolver API URL**, then hit **Test Connection**.
3. If the backend is unreachable, Zetsu Desktop falls back to the built-in client-side resolver and mock feeds so the UI stays interactive.

> **Note:** builds from before the VPS migration may have stored a `http://localhost:3000` override. That value is now stale and is automatically discarded on first launch.

---

## 🛡️ License

MIT License © 2026 Zetsu Core Contributors. See [LICENSE](./LICENSE).

---

## 📦 Releases

Installers and the Android APK are published as [GitHub Releases](https://github.com/amayonaise/zetsu/releases) — binaries are intentionally **not** committed to the repository.

Pushing a tag triggers `.github/workflows/release.yml`, which builds the MSI, the NSIS setup, and the Android APK, then attaches them to the release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

For a **signed** APK, add these repository secrets before tagging:

| Secret | Purpose |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Your keystore, base64-encoded |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |
| `VITE_DEFAULT_TMDB_KEY` | Optional default TMDB key |

Without signing secrets the workflow still publishes the APK, but as `zetsu-android-unsigned.apk`.

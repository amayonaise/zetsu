import { StreamSource, SubtitleTrack } from '../types/index.ts';

const ENC_DEC_API = 'https://enc-dec.app/api';
const VIDLINK_BASE = 'https://vidlink.pro';

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

export const builtInResolver = {
  /**
   * Resolves movie streams directly on the client (Smart TV / Mobile / Browser)
   * with zero external backend hosting required.
   */
  async resolveMovieStreams(tmdbId: string): Promise<{
    success: boolean;
    sources: StreamSource[];
    subtitles: SubtitleTrack[];
    title?: string;
    error?: string;
  }> {
    const sources: StreamSource[] = [];
    const subtitles: SubtitleTrack[] = [];

    // 1. Try VidLink High-Speed Extractor
    try {
      const encRes = await fetch(
        `${ENC_DEC_API}/enc-vidlink?text=${encodeURIComponent(tmdbId)}`,
        { headers: COMMON_HEADERS, signal: AbortSignal.timeout(6000) }
      ).catch(() => null);

      if (encRes && encRes.ok) {
        const encData = await encRes.json();
        const encryptedId = encData?.result;

        if (encryptedId) {
          const apiRes = await fetch(`${VIDLINK_BASE}/api/b/movie/${encryptedId}`, {
            headers: {
              ...COMMON_HEADERS,
              Referer: 'https://vidlink.pro/',
              Origin: 'https://vidlink.pro',
            },
            signal: AbortSignal.timeout(8000),
          }).catch(() => null);

          if (apiRes && apiRes.ok) {
            const data = await apiRes.json();
            const stream = data?.stream;

            if (stream?.playlist) {
              sources.push({
                source: 'vidlink-hls',
                label: 'Server 1 (VidLink HD Master)',
                url: stream.playlist,
                quality: '1080p',
                type: 'hls',
              });
            }

            if (stream?.qualities && typeof stream.qualities === 'object') {
              for (const q of ['1080', '720', '480']) {
                const item = stream.qualities[q];
                if (item?.url) {
                  sources.push({
                    source: `vidlink-${q}`,
                    label: `Server VidLink (${q}p Direct)`,
                    url: item.url,
                    quality: `${q}p`,
                    type: item.type === 'mp4' ? 'mp4' : 'hls',
                  });
                }
              }
            }

            // Subtitles
            if (Array.isArray(stream?.tracks)) {
              for (const t of stream.tracks) {
                if (t.url && t.label) {
                  const isIndo =
                    t.lang === 'id' ||
                    t.label.toLowerCase().includes('indo') ||
                    t.label.toLowerCase().includes('bahasa');
                  subtitles.push({
                    file: t.url,
                    label: t.label,
                    lang: t.lang || (isIndo ? 'id' : 'en'),
                    isIndonesian: isIndo,
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[BuiltIn] Vidlink error:', e);
    }

    // 2. Try VixSrc API Extractor
    try {
      const vixRes = await fetch(`https://vixsrc.to/api/movie/${tmdbId}`, {
        headers: {
          Referer: 'https://vixsrc.to/',
          ...COMMON_HEADERS,
        },
        signal: AbortSignal.timeout(6000),
      }).catch(() => null);

      if (vixRes && vixRes.ok) {
        const vixData = await vixRes.json();
        if (vixData?.src) {
          sources.push({
            source: 'vixsrc',
            label: 'Server 2 (VixSrc CDN)',
            url: vixData.src,
            quality: '1080p',
            type: 'hls',
            referer: 'https://vixsrc.to/',
          });
        }
      }
    } catch (e) {
      console.warn('[BuiltIn] VixSrc error:', e);
    }

    // 3. Fallback Providers
    sources.push({
      source: 'vidsrc-embed',
      label: 'Server 3 (Vidsrc VIP)',
      url: `https://vidsrc.icu/embed/movie/${tmdbId}`,
      quality: '1080p',
      type: 'hls',
    });

    sources.push({
      source: 'embedsu',
      label: 'Server 4 (Cinema Pro)',
      url: `https://embed.su/embed/movie/${tmdbId}`,
      quality: '1080p',
      type: 'hls',
    });

    return {
      success: sources.length > 0,
      sources,
      subtitles,
    };
  },

  /**
   * Resolves TV episode streams directly on the client
   */
  async resolveTvStreams(
    tmdbId: string,
    season: number,
    episode: number
  ): Promise<{
    success: boolean;
    sources: StreamSource[];
    subtitles: SubtitleTrack[];
    title?: string;
    error?: string;
  }> {
    const sources: StreamSource[] = [];
    const subtitles: SubtitleTrack[] = [];

    // 1. Try VidLink TV
    try {
      const encRes = await fetch(
        `${ENC_DEC_API}/enc-vidlink?text=${encodeURIComponent(tmdbId)}`,
        { headers: COMMON_HEADERS, signal: AbortSignal.timeout(6000) }
      ).catch(() => null);

      if (encRes && encRes.ok) {
        const encData = await encRes.json();
        const encryptedId = encData?.result;

        if (encryptedId) {
          const apiRes = await fetch(
            `${VIDLINK_BASE}/api/b/tv/${encryptedId}/${season}/${episode}`,
            {
              headers: {
                ...COMMON_HEADERS,
                Referer: 'https://vidlink.pro/',
                Origin: 'https://vidlink.pro',
              },
              signal: AbortSignal.timeout(8000),
            }
          ).catch(() => null);

          if (apiRes && apiRes.ok) {
            const data = await apiRes.json();
            const stream = data?.stream;

            if (stream?.playlist) {
              sources.push({
                source: 'vidlink-hls',
                label: 'Server 1 (VidLink HD Master)',
                url: stream.playlist,
                quality: '1080p',
                type: 'hls',
              });
            }

            if (stream?.qualities && typeof stream.qualities === 'object') {
              for (const q of ['1080', '720', '480']) {
                const item = stream.qualities[q];
                if (item?.url) {
                  sources.push({
                    source: `vidlink-${q}`,
                    label: `Server VidLink (${q}p Direct)`,
                    url: item.url,
                    quality: `${q}p`,
                    type: item.type === 'mp4' ? 'mp4' : 'hls',
                  });
                }
              }
            }

            // Subtitles
            if (Array.isArray(stream?.tracks)) {
              for (const t of stream.tracks) {
                if (t.url && t.label) {
                  const isIndo =
                    t.lang === 'id' ||
                    t.label.toLowerCase().includes('indo') ||
                    t.label.toLowerCase().includes('bahasa');
                  subtitles.push({
                    file: t.url,
                    label: t.label,
                    lang: t.lang || (isIndo ? 'id' : 'en'),
                    isIndonesian: isIndo,
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[BuiltIn TV] Vidlink error:', e);
    }

    // 2. VixSrc TV
    try {
      const vixRes = await fetch(
        `https://vixsrc.to/api/tv/${tmdbId}/${season}/${episode}`,
        {
          headers: { Referer: 'https://vixsrc.to/', ...COMMON_HEADERS },
          signal: AbortSignal.timeout(6000),
        }
      ).catch(() => null);

      if (vixRes && vixRes.ok) {
        const vixData = await vixRes.json();
        if (vixData?.src) {
          sources.push({
            source: 'vixsrc',
            label: 'Server 2 (VixSrc Series)',
            url: vixData.src,
            quality: '1080p',
            type: 'hls',
            referer: 'https://vixsrc.to/',
          });
        }
      }
    } catch (e) {
      console.warn('[BuiltIn TV] VixSrc error:', e);
    }

    // 3. Fallbacks
    sources.push({
      source: 'vidsrc-embed',
      label: 'Server 3 (Vidsrc Series)',
      url: `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`,
      quality: '1080p',
      type: 'hls',
    });

    return {
      success: sources.length > 0,
      sources,
      subtitles,
    };
  },
};

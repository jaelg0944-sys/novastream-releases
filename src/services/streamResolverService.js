// src/services/streamResolverService.js
// Servicio de resolución de streams nativos para NovaStream TV
// Intenta obtener URLs directas de video (HLS/MP4) para reproducción nativa
// Si falla, devuelve null y el catálogo usa iframe como fallback transparente

const BRIDGE_SERVER = 'https://novastream-resolver.vercel.app';
const NOVA_RESOLVER = 'https://novastream-resolver.vercel.app';
const RESOLVE_TIMEOUT = 8000; // 8 segundos máximo para resolver

// ── Cache local persistente ────────────────────────────────
const CACHE_KEY_PREFIX = 'nova_stream_cache_v2_';
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 horas

function getCacheKey(imdbId, type, season, episode) {
  return `${CACHE_KEY_PREFIX}${imdbId}_${type}_${season || ''}_${episode || ''}`;
}

function getFromCache(imdbId, type, season, episode) {
  try {
    const key = getCacheKey(imdbId, type, season, episode);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function saveToCache(imdbId, type, season, episode, url, isNative) {
  try {
    const key = getCacheKey(imdbId, type, season, episode);
    localStorage.setItem(key, JSON.stringify({
      url,
      isNative,
      timestamp: Date.now()
    }));
  } catch {
    // localStorage lleno o no disponible, ignorar
  }
}

// ── Resolver principal ─────────────────────────────────────
export async function resolveStream(imdbId, type = 'movie', season = null, episode = null, post = null) {
  const targetPost = post || (String(imdbId).match(/^\d+$/) ? imdbId : null);
  console.log(`[StreamResolver] Resolviendo stream nativo para: ${imdbId} (post: ${targetPost || 'no'}, ${type})`);

  // 1. Verificar cache local (instantáneo)
  const cached = getFromCache(imdbId, type, season, episode);
  if (cached) {
    console.log(`[StreamResolver] ✅ Cache local encontrado: ${cached.url}`);
    return { url: cached.url, isNative: cached.isNative };
  }

  // 2. Lanzar TODOS los resolvers en PARALELO (el primero que responda gana)
  const resolvers = [
    // Prioridad alta: NovaResolver (Repelis24 Vimeos Latino - español directo)
    tryNovaResolver(imdbId, type, season, episode, targetPost)
      .then(url => url ? { url, isNative: true, source: 'Vimeos Latino' } : null)
      .catch(() => null),

    // Prioridad media: Bridge Server
    tryBridgeResolver(imdbId, type, season, episode)
      .then(url => url ? { url, isNative: true, source: 'Bridge' } : null)
      .catch(() => null),

    // Prioridad baja: Stremio Addons
    tryStremioAddons(imdbId, type, season, episode)
      .then(url => url ? { url, isNative: true, source: 'Stremio' } : null)
      .catch(() => null),
  ];

  try {
    const results = await Promise.allSettled(resolvers);
    
    // Buscar el primer resultado exitoso con URL
    let result = null;
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value && r.value.url) {
        result = r.value;
        break;
      }
    }

    if (result) {
      console.log(`[StreamResolver] ✅ Stream nativo vía ${result.source}: ${result.url}`);

      // Guardar en cache local para acceso instantáneo la próxima vez
      saveToCache(imdbId, type, season, episode, result.url, result.isNative);

      return { url: result.url, isNative: result.isNative };
    }
  } catch (err) {
    console.warn('[StreamResolver] Error en resolución paralela:', err);
  }

  // 3. Fallback: iframe transparente
  const iframeUrl = generateIframeUrl(imdbId, type, season, episode);
  console.log(`[StreamResolver] ⚠️ Sin stream nativo. Usando iframe: ${iframeUrl}`);
  return { url: iframeUrl, isNative: false };
}

// ── NovaStream Resolver (nuestro scraper propio) ───────────
async function tryNovaResolver(imdbId, type, season, episode, post = null) {
  const params = new URLSearchParams({ id: imdbId, type: type === 'series' ? 'tv' : 'movie' });
  if (post) params.set('post', String(post));
  if (season) params.set('season', String(season));
  if (episode) params.set('episode', String(episode));

  const url = `${NOVA_RESOLVER}/api/stream?${params}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
    return null;
  } catch (err) {
    clearTimeout(timeout);
    return null; // No lanzar error, devolver null para que Promise.any continúe
  }
}

// ── Bridge Server Resolver ─────────────────────────────────
async function tryBridgeResolver(imdbId, type, season, episode) {
  const params = new URLSearchParams({
    tmdb: imdbId,
    type: type === 'series' ? 'tv' : 'movie'
  });
  if (season) params.set('season', String(season));
  if (episode) params.set('episode', String(episode));

  const url = `${BRIDGE_SERVER}/api/proxy?url=${encodeURIComponent(`https://vidsrc.cc/v2/embed/${type === 'series' ? 'tv' : 'movie'}/${imdbId}`)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      const m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
      if (m3u8Match) return m3u8Match[0];
    }
    return null;
  } catch (err) {
    clearTimeout(timeout);
    return null;
  }
}

// ── Stremio Community Addons Resolver ──────────────────────
// Consulta addons públicos del ecosistema Stremio que devuelven URLs directas
const STREMIO_ADDONS = [
  'https://vidsrc-addon.vercel.app',
  'https://stremio-vidsrc.herokuapp.com',
];

async function tryStremioAddons(imdbId, type, season, episode) {
  const stremioType = type === 'series' ? 'series' : 'movie';
  const stremioId = type === 'series' && season && episode
    ? `${imdbId}:${season}:${episode}`
    : imdbId;

  // Lanzar todos los addons en paralelo también
  const addonPromises = STREMIO_ADDONS.map(async (baseUrl) => {
    try {
      const endpoint = `${baseUrl}/stream/${stremioType}/${stremioId}.json`;
      const proxiedEndpoint = `https://novastream-resolver.vercel.app/api/proxy?url=${encodeURIComponent(endpoint)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(proxiedEndpoint, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data && data.streams && data.streams.length > 0) {
          // Buscar el primer stream con URL directa (no magnet/torrent)
          const directStream = data.streams.find(s =>
            s.url &&
            !s.url.startsWith('magnet:') &&
            (s.url.includes('.m3u8') || s.url.includes('.mp4') || s.url.startsWith('http'))
          );
          if (directStream) {
            return directStream.url;
          }
        }
      }
    } catch {
      // Addon no disponible
    }
    return null;
  });

  const results = await Promise.allSettled(addonPromises);
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) return r.value;
  }
  return null;
}

// ── Generador de URLs de Iframe (fallback) ─────────────────
const IFRAME_PROVIDERS = [
  {
    movieUrl: (id) => `https://vidlink.pro/movie/${id}?primaryColor=ff3366&autoplay=true`,
    tvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=ff3366&autoplay=true`,
  },
  {
    movieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  },
  {
    movieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
];

function generateIframeUrl(imdbId, type, season, episode) {
  const provider = IFRAME_PROVIDERS[0]; // Usar el primero (VidLink)
  if (type === 'series' && season && episode) {
    return provider.tvUrl(imdbId, season, episode);
  }
  return provider.movieUrl(imdbId);
}

// src/services/vodService.js
// Catálogo VOD integrado con la base de datos abierta Cinemeta de GitHub/Stremio
// Y reproductor de resolución directa sin bloqueos de IP (VidLink)

// Series custom locales del usuario (mantenidas por compatibilidad)
export const customSeries = [
  {
    id: 'custom-asi-aprenderas',
    title: 'Así Aprenderás',
    description: 'Drama coreano de suspenso y acción. Un maestro busca justicia por sus alumnos.',
    poster: '/assets/asi_aprenderas.jpg',
    category: 'Series',
    type: 'series',
    episodes: [
      { number: 1, title: 'Capítulo 1', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/c0f3c30d-cff2-45c5-a0fd-d269c718cda6/720p-h264/720p-h264.m3u8?token=1780985491_31af3a3b38d8d0e86dc6a2dad4ae09abfbd6701605811863e909bc9fa5dfb55c&requestType=manifest&sessionId=a1954e59-2e17-4e4e-ba5c-a05b64730791&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 2, title: 'Capítulo 2', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/5fffd86e-6006-4b79-b568-55cda6ebbc9a/720p-h264/720p-h264.m3u8?token=1780985644_9425a1f209ea0c6c64c39e1ac73044ca8d9008bfe9806a783221bb88bfa5f3c7&requestType=manifest&sessionId=b3bd8d0d-da96-48e9-a98b-d3e7c8ce0497&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 3, title: 'Capítulo 3', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/101b753d-8446-4181-856c-b5c007b318e7/720p-h264/720p-h264.m3u8?token=1780985715_c3c7f46b956f720077fe6f07d6b7d22ff1b6d831ae2eda8eab8d0a94220ec3ca&requestType=manifest&sessionId=6b160e56-23a6-4c7f-b255-e6e5bae6d20e&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 4, title: 'Capítulo 4', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/16453582-a230-4e7b-a4f4-97f8dd8fe3ac/720p-h264/720p-h264.m3u8?token=1780985787_79852c751eec631a03c3f48a4b31c7529480042c521650aae9a8315217582ccd&requestType=manifest&sessionId=c2ed3b24-5070-4eeb-8356-9d125a645867&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 5, title: 'Capítulo 5', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/685f3cd0-3596-4634-95e1-72d13454b57e/720p-h264/720p-h264.m3u8?token=1780985843_0bb4ac98d35f2db08e6c5414cee0100e10800939a8097ce944bd8c07d313211d&requestType=manifest&sessionId=7431e99a-3784-4ec3-b7b2-79306f16a17c&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 6, title: 'Capítulo 6', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/274ebd11-44e3-4df7-8d6c-a3c5282b8ccd/720p-h264/720p-h264.m3u8?token=1780985892_8b8d9348628644ea2feaa0baea054013d6c7de11a1ca6ee72b5a1be713978824&requestType=manifest&sessionId=30e8dab8-65ac-474a-b478-d450ebb0494a&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
    ],
    streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/c0f3c30d-cff2-45c5-a0fd-d269c718cda6/720p-h264/720p-h264.m3u8?token=1780985491_31af3a3b38d8d0e86dc6a2dad4ae09abfbd6701605811863e909bc9fa5dfb55c&requestType=manifest&sessionId=a1954e59-2e17-4e4e-ba5c-a05b64730791&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf'
  }
];

// 1. Obtener cartelera en tiempo real 100% desde Repelis24 vía backend (Servidor Vimeos Latino)
export const fetchRepelisCartelera = async (type = 'pelicula', catalog = 'top', genre = '', page = 1) => {
  try {
    const cType = type === 'serie' || type === 'series' ? 'tv' : 'movie';
    const apiUrl = `https://novastream-resolver.vercel.app/api/catalog?type=${cType}&genre=${encodeURIComponent(genre)}&page=${page}`;
    console.log('[Catalog] Obteniendo cartelera Repelis24 vía backend:', apiUrl);

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Backend Catalog HTTP error ${res.status}`);
    const data = await res.json();

    if (data.success && data.items && data.items.length > 0) {
      console.log(`[Catalog] ✅ ${data.items.length} películas recibidas 100% de Repelis24 (Vimeos Latino).`);
      return data.items;
    }
  } catch (err) {
    console.error('[Catalog] Error al obtener catálogo de Repelis24 backend:', err.message);
  }
  return [];
};

// 2. Buscar películas o series en Repelis24
export const searchRepelis = async (query) => {
  if (!query) return [];
  try {
    const apiUrl = `https://novastream-resolver.vercel.app/api/catalog?search=${encodeURIComponent(query)}`;
    console.log('[Catalog Search] Buscando en Repelis24:', apiUrl);

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Search API error ${res.status}`);
    const data = await res.json();

    if (data.success && data.items) {
      return data.items;
    }
  } catch (err) {
    console.error('[Catalog Search] Error en búsqueda de Repelis24:', err.message);
  }
  return [];
};

// 2b. Obtener servidores de reproducción en tiempo real para una película
export const fetchMovieServers = async (postId) => {
  if (!postId) return [];
  try {
    const apiUrl = `https://novastream-resolver.vercel.app/api/stream?post=${postId}&action=servers`;
    console.log('[Catalog] Obteniendo servidores en tiempo real:', apiUrl);

    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.servers && data.servers.length > 0) {
        return data.servers;
      }
    }
  } catch (err) {
    console.warn('[fetchMovieServers] Error obteniendo servidores:', err.message);
  }
  return [];
};

// ── Proveedores de Embed para VOD ──────────────────────────
const VOD_PROVIDERS = [
  {
    name: 'VidLink Premium',
    lang: 'Multi / Latino',
    movieUrl: (id) => `https://vidlink.pro/movie/${id}?primaryColor=ff3366&autoplay=true`,
    tvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=ff3366&autoplay=true`,
  },
  {
    name: 'Vidsrc Server',
    lang: 'Multi / Subtitulado',
    movieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'AutoEmbed',
    lang: 'Multi / Latino',
    movieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'Embed.su',
    lang: 'Multi / Subtitulado',
    movieUrl: (id) => `https://embed.su/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
];

// 3. Obtener detalles y capítulos de una película/serie con múltiples servidores
export const fetchRepelisDetails = async (idOrPost, typeParam, urlParam) => {
  const imdbId = idOrPost;
  try {
    const isImdbId = typeof imdbId === 'string' && imdbId.startsWith('tt');
    const isNumeric = typeof imdbId === 'string' && /^\d+$/.test(imdbId);
    let isTv = false;

    if (isImdbId) {
      isTv = imdbId.includes(':') || await checkIfTvShow(imdbId);
    } else if (typeParam === 'series' || typeParam === 'tv') {
      isTv = true;
    }

    if (!isImdbId) {
      const path = isTv ? 'series' : 'movie';
      const fallbackId = isNumeric ? `tt${imdbId}` : imdbId;
      let metaData = null;
      try {
        const res = await fetch(`https://v3-cinemeta.strem.io/meta/${path}/${fallbackId}.json`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.meta) metaData = data.meta;
        }
      } catch { }

      return {
        postId: imdbId,
        description: metaData?.description || 'Sin sinopsis disponible.',
        episodes: [],
        seasons: null,
        options: VOD_PROVIDERS.map((provider, idx) => ({
          nume: String(idx + 1),
          type: isTv ? 'tv' : 'movie',
          post: imdbId,
          server: provider.name,
          lang: provider.lang,
          embedUrl: isTv ? provider.tvUrl(fallbackId, 1, 1) : provider.movieUrl(fallbackId),
          isIframe: true
        }))
      };
    }

    const path = isTv ? 'series' : 'movie';
    
    const res = await fetch(`https://v3-cinemeta.strem.io/meta/${path}/${imdbId}.json`);
    if (!res.ok) throw new Error(`Cinemeta Meta HTTP error ${res.status}`);
    const data = await res.json();
    if (!data || !data.meta) throw new Error('Detalles no disponibles');

    const meta = data.meta;
    let allEpisodes = [];

    // Si es serie, cargar todos los episodios reales de la base de datos
    if (isTv && meta.videos && meta.videos.length > 0) {
      allEpisodes = meta.videos
        .filter(ep => ep.season > 0)
        .map(ep => ({
          number: ep.episode || ep.number,
          season: ep.season,
          title: ep.name || `Capítulo ${ep.episode || ep.number}`,
          // Usa el primer proveedor disponible como default
          streamUrl: VOD_PROVIDERS[0].tvUrl(imdbId, ep.season, ep.episode || ep.number),
          isIframe: true
        }));
    }

    // Generar opciones de servidor para cada proveedor de embed
    const options = VOD_PROVIDERS.map((provider, idx) => ({
      nume: String(idx + 1),
      type: isTv ? 'tv' : 'movie',
      post: imdbId,
      server: provider.name,
      lang: provider.lang,
      embedUrl: isTv 
        ? VOD_PROVIDERS[idx].tvUrl(imdbId, 1, 1)
        : provider.movieUrl(imdbId),
      isIframe: true
    }));

    return {
      postId: imdbId,
      description: meta.description || 'Sin sinopsis disponible.',
      episodes: allEpisodes,
      seasons: isTv ? Array.from(new Set(allEpisodes.map(ep => ep.season))).map(s => ({ s, eps: allEpisodes.filter(e => e.season === s).length })) : null,
      options
    };
  } catch (err) {
    console.error('Error al obtener detalles de Cinemeta:', err);
    return {
      postId: imdbId,
      description: 'Error al cargar los detalles.',
      options: []
    };
  }
};

// Helper rápido para comprobar si el ID de IMDb corresponde a una serie
async function checkIfTvShow(imdbId) {
  try {
    const res = await fetch(`https://v3-cinemeta.strem.io/meta/series/${imdbId}.json`);
    const data = await res.json();
    return !!(data && data.meta);
  } catch {
    return false;
  }
}

// 4. Obtener URL final (Para compatibilidad con el reproductor)
export const fetchRepelisEmbed = async (post, type, nume) => {
  const idx = Math.max(0, parseInt(nume, 10) - 1);
  const provider = VOD_PROVIDERS[idx] || VOD_PROVIDERS[0];
  if (type === 'tv') {
    return provider.tvUrl(post, 1, 1);
  }
  return provider.movieUrl(post);
};

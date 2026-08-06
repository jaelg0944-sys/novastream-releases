// src/services/vodService.js
// Catálogo VOD integrado con la base de datos abierta Cinemeta de GitHub/Stremio
// Y reproductor de resolución directa sin bloqueos de IP (VidLink)

// Series custom locales del usuario (mantenidas por compatibilidad)
export const customSeries = [];
// Custom series deshabilitadas - tokens de streaming expirados

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

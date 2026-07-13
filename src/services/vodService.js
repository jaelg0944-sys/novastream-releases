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

// 1. Obtener cartelera en tiempo real desde Stremio Cinemeta (IMDb/TMDb)
export const fetchRepelisCartelera = async (type = 'pelicula', page = 1) => {
  const cTab = type === 'serie' ? 'series' : 'movie';
  try {
    const res = await fetch(`https://v3-cinemeta.strem.io/catalog/${cTab}/top/page=${page}.json`);
    if (!res.ok) throw new Error(`Cinemeta HTTP error ${res.status}`);
    const data = await res.json();
    if (!data || !data.metas) return [];
    
    return data.metas.map(item => ({
      id: item.id, // IMDb ID (tt...)
      title: item.name,
      type: item.type === 'series' ? 'series' : 'movie',
      poster: item.poster || `https://images.metahub.space/poster/medium/${item.id}/img`,
      url: item.id,
      description: '',
      rating: item.imdbRating || '0',
      year: item.releaseInfo || '',
      genre: item.type === 'series' ? 'Series' : 'Película'
    }));
  } catch (err) {
    console.error('Error al obtener catálogo de Cinemeta:', err);
    return [];
  }
};

// 2. Buscar películas o series en Cinemeta
export const searchRepelis = async (query) => {
  if (!query) return [];
  try {
    const [movieRes, seriesRes] = await Promise.all([
      fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(query)}.json`).then(r => r.json().catch(() => ({ metas: [] }))),
      fetch(`https://v3-cinemeta.strem.io/catalog/series/top/search=${encodeURIComponent(query)}.json`).then(r => r.json().catch(() => ({ metas: [] })))
    ]);
    
    const movies = (movieRes.metas || []).map(item => ({
      id: item.id,
      title: item.name,
      type: 'movie',
      poster: item.poster || `https://images.metahub.space/poster/medium/${item.id}/img`,
      url: item.id,
      description: '',
      rating: item.imdbRating || '0',
      year: item.releaseInfo || '',
      genre: 'Película'
    }));

    const series = (seriesRes.metas || []).map(item => ({
      id: item.id,
      title: item.name,
      type: 'series',
      poster: item.poster || `https://images.metahub.space/poster/medium/${item.id}/img`,
      url: item.id,
      description: '',
      rating: item.imdbRating || '0',
      year: item.releaseInfo || '',
      genre: 'Series'
    }));

    return [...movies, ...series];
  } catch (err) {
    console.error('Error en búsqueda de Cinemeta:', err);
    return [];
  }
};

// 3. Obtener detalles y capítulos de una película/serie con reproductor VidLink directo
export const fetchRepelisDetails = async (imdbId) => {
  try {
    const isTv = imdbId.startsWith('tt') && (imdbId.includes(':') || await checkIfTvShow(imdbId));
    const path = isTv ? 'series' : 'movie';
    
    const res = await fetch(`https://v3-cinemeta.strem.io/meta/${path}/${imdbId}.json`);
    if (!res.ok) throw new Error(`Cinemeta Meta HTTP error ${res.status}`);
    const data = await res.json();
    if (!data || !data.meta) throw new Error('Detalles no disponibles');

    const meta = data.meta;
    let allEpisodes = [];

    // Generar la URL de streaming de VidLink con color personalizado NovaStream (#ff3366)
    let streamUrl = `https://vidlink.pro/movie/${imdbId}?primaryColor=ff3366&autoplay=true`;

    // Si es serie, cargar todos los episodios reales de la base de datos
    if (isTv && meta.videos && meta.videos.length > 0) {
      allEpisodes = meta.videos
        .filter(ep => ep.season > 0)
        .map(ep => ({
          number: ep.episode || ep.number,
          season: ep.season,
          title: ep.name || `Capítulo ${ep.episode || ep.number}`,
          // El reproductor cargará este iframe de VidLink directamente
          streamUrl: `https://vidlink.pro/tv/${imdbId}/${ep.season}/${ep.episode || ep.number}?primaryColor=ff3366&autoplay=true`,
          isIframe: true
        }));
    }

    return {
      postId: imdbId,
      description: meta.description || 'Sin sinopsis disponible.',
      episodes: allEpisodes,
      seasons: isTv ? Array.from(new Set(allEpisodes.map(ep => ep.season))).map(s => ({ s, eps: allEpisodes.filter(e => e.season === s).length })) : null,
      options: [
        {
          nume: '1',
          type: streamUrl,
          post: imdbId,
          server: 'Reproductor Premium (Nativo)',
          lang: 'Español Latino / Multi',
          embedUrl: streamUrl,
          isIframe: true
        }
      ]
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
  return `https://vidlink.pro/movie/${post}?primaryColor=ff3366&autoplay=true`;
};

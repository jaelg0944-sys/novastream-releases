// src/services/vodService.js
// Catálogo VOD integrado dinámicamente con el servidor en tiempo real

const BRIDGE_SERVER = 'https://server-sigma-cyan.vercel.app';

// Series custom locales del usuario
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

// Helper para construir episodios en series dinámicas
function buildEpisodes(tmdbId, season, count) {
  const eps = [];
  for (let i = 1; i <= count; i++) {
    eps.push({
      number: i,
      season: season,
      title: `Temporada ${season} - Episodio ${i}`,
      streamUrl: `https://vidsrcme.ru/embed/tv/${tmdbId}/${season}/${i}`,
      isIframe: false // Se reproducirá nativamente con Hls.js
    });
  }
  return eps;
}

// 1. Obtener cartelera en tiempo real (Películas o Series)
export const fetchRepelisCartelera = async (type = 'pelicula', page = 1) => {
  const queryType = type === 'serie' ? 'serie' : 'pelicula';
  try {
    const res = await fetch(`${BRIDGE_SERVER}/api/repelis/cartelera?type=${queryType}&page=${page}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.map(item => ({
      id: item.url, // Usar la URL como ID único para el flujo
      title: item.title,
      type: item.type === 'tvshow' ? 'series' : 'movie',
      poster: item.poster,
      url: item.url,
      description: '',
      rating: item.rating,
      year: item.year,
      genre: item.type === 'tvshow' ? 'Series' : 'Película'
    }));
  } catch (err) {
    console.error('Error al obtener cartelera:', err);
    return [];
  }
};

// 2. Buscar películas o series en tiempo real
export const searchRepelis = async (query) => {
  try {
    const res = await fetch(`${BRIDGE_SERVER}/api/repelis/buscar?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.map(item => ({
      id: item.url,
      title: item.title,
      type: item.type === 'tvshow' ? 'series' : 'movie',
      poster: item.poster,
      url: item.url,
      description: '',
      rating: item.rating,
      year: item.year,
      genre: item.type === 'tvshow' ? 'Series' : 'Película'
    }));
  } catch (err) {
    console.error('Error en búsqueda:', err);
    return [];
  }
};

// 3. Obtener detalles y opciones de reproducción en tiempo real
export const fetchRepelisDetails = async (url) => {
  try {
    const res = await fetch(`${BRIDGE_SERVER}/api/repelis/detalles?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const details = await res.json();

    const tmdbId = details.postId;
    const isTv = url.includes('/serie/');
    const type = isTv ? 'tv' : 'movie';

    // Para películas, devolvemos la URL nativa directa del resolutor
    let nativeStreamUrl = `${BRIDGE_SERVER}/api/vixsrc/resolve?tmdb=${tmdbId}&type=movie`;
    let allEpisodes = [];

    // Para series, construimos los episodios en base a los datos raspados por el backend
    if (isTv && details.episodes && details.episodes.length > 0) {
      allEpisodes = details.episodes.map(ep => ({
        number: ep.episode,
        season: ep.season,
        title: `Temporada ${ep.season} - Capítulo ${ep.episode}: ${ep.title}`,
        // El reproductor cargará este stream nativamente en Hls.js a través del resolutor
        streamUrl: `${BRIDGE_SERVER}/api/vixsrc/resolve?tmdb=${tmdbId}&type=tv&season=${ep.season}&episode=${ep.episode}`,
        isIframe: false
      }));
    }

    return {
      postId: tmdbId,
      description: details.description || 'Sin descripción disponible.',
      episodes: allEpisodes,
      seasons: isTv ? Array.from(new Set(allEpisodes.map(ep => ep.season))).map(s => ({ s, eps: allEpisodes.filter(e => e.season === s).length })) : null,
      options: [
        {
          nume: '1',
          type: nativeStreamUrl,
          post: tmdbId,
          server: 'Reproductor Premium (Nativo)',
          lang: 'Español Latino / Multi',
          embedUrl: nativeStreamUrl
        }
      ]
    };
  } catch (err) {
    console.error('Error al obtener detalles:', err);
    return {
      postId: '',
      description: 'Error al cargar los detalles.',
      options: []
    };
  }
};

// 4. Obtener embed URL final
export const fetchRepelisEmbed = async (post, type, nume) => {
  if (type && type.startsWith('http')) return type;
  return `${BRIDGE_SERVER}/api/vixsrc/resolve?tmdb=${post}&type=movie`;
};

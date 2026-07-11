// src/services/vodService.js
// Servicio VOD para películas y series, integrando scraping directo desde repelis24.ing y series personalizadas

// Usamos un proxy CORS público y robusto de respaldo para evitar bloqueos de CORS en desarrollo web,
// pero en Capacitor (móvil) y Electron (PC con webSecurity: false) los requests se pueden hacer de forma directa.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const BASE_URL = 'https://repelis24.ing';

// Series personalizadas del usuario (como "Así Aprenderás")
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

// Helper para hacer fetch tolerante a CORS
async function fetchHtml(url) {
  // Intentar fetch directo primero
  try {
    const res = await fetch(url);
    if (res.ok) return await res.text();
  } catch (e) {
    console.warn('[VOD Service] Fetch directo falló por CORS, intentando con proxy...', e.message);
  }

  // De respaldo, usar proxy CORS
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error('Error al conectar con la base de datos de películas');
  const data = await res.text();
  return data;
}

// Scraper de items de la cartelera/búsqueda
function extractRepelisItems(html) {
  const items = [];
  const articleRegex = /<article[^>]*class=["']item\s+(movies|tvshows)["'][^>]*>([\s\S]*?)<\/article>/g;
  let match;
  
  while ((match = articleRegex.exec(html)) !== null) {
    const type = match[1];
    const articleHtml = match[2];
    
    const idMatch = articleHtml.match(/id=["']post-(\d+)["']/);
    const postId = idMatch ? idMatch[1] : null;
    
    const imgMatch = articleHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]+alt=["']([^"']+)["']/) || 
                     articleHtml.match(/<img[^>]+alt=["']([^"']+)["'][^>]+src=["']([^"']+)["']/);
    let poster = '';
    let title = '';
    if (imgMatch) {
      if (imgMatch[1].startsWith('http')) {
        poster = imgMatch[1];
        title = imgMatch[2];
      } else {
        poster = imgMatch[2];
        title = imgMatch[1];
      }
    }
    
    const linkMatch = articleHtml.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/);
    const detailUrl = linkMatch ? linkMatch[1] : '';
    
    const ratingMatch = articleHtml.match(/<div[^>]*class=["']rating["'][^>]*>([^<]+)<\/div>/);
    const rating = ratingMatch ? ratingMatch[1].trim() : '0';
    
    const yearMatch = articleHtml.match(/<span>([^<]+)<\/span>/);
    const year = yearMatch ? yearMatch[1].trim() : '';
    
    if (title && detailUrl) {
      items.push({
        id: postId,
        title,
        type: type === 'movies' ? 'movie' : 'tvshow',
        poster,
        url: detailUrl,
        rating,
        year
      });
    }
  }
  return items;
}

// Scraper de detalles y reproductores
function extractRepelisDetails(html) {
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || 
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  const postMatch = html.match(/data-post=['"](\d+)['"]/) || 
                    html.match(/name=['"]comment_post_ID['"] value=['"](\d+)['"]/);
  const postId = postMatch ? postMatch[1] : null;

  const options = [];
  const optionRegex = /<li[^>]*class=['"]dooplay_player_option['"][^>]*data-type=['"]([^'"]+)['"][^>]*data-post=['"]([^'"]+)['"][^>]*data-nume=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/li>/g;
  let match;
  
  while ((match = optionRegex.exec(html)) !== null) {
    const type = match[1];
    const post = match[2];
    const nume = match[3];
    const innerHtml = match[4];

    const titleMatch = innerHtml.match(/<span class=['"]title['"]>([^<]+)<\/span>/);
    const serverName = titleMatch ? titleMatch[1].trim() : 'Server';

    const langMatch = innerHtml.match(/flags\/([^.]+)\.png/);
    const lang = langMatch ? langMatch[1] : 'es';

    options.push({
      nume,
      type,
      post,
      server: serverName,
      lang: lang === 'en' ? 'Subtitulado' : lang === 'es' ? 'Castellano' : 'Latino'
    });
  }

  return {
    postId,
    description,
    options
  };
}

// ── APIs del Servicio ──────────────────────────────────────

// Obtener cartelera
export const fetchRepelisCartelera = async (type = 'pelicula', page = 1) => {
  try {
    let targetUrl = `${BASE_URL}/`;
    if (type === 'serie') {
      targetUrl = page > 1 ? `${BASE_URL}/serie/page/${page}/` : `${BASE_URL}/serie/`;
    } else {
      targetUrl = page > 1 ? `${BASE_URL}/pelicula/page/${page}/` : `${BASE_URL}/pelicula/`;
    }

    console.log(`[VOD] Cargando cartelera: ${targetUrl}`);
    const html = await fetchHtml(targetUrl);
    return extractRepelisItems(html);
  } catch (error) {
    console.error('Error fetching VOD data:', error);
    return [];
  }
};

// Buscar películas o series
export const searchRepelis = async (query) => {
  try {
    const targetUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    console.log(`[VOD] Buscando: ${targetUrl}`);
    const html = await fetchHtml(targetUrl);
    return extractRepelisItems(html);
  } catch (error) {
    console.error('Error searching VOD:', error);
    return [];
  }
};

// Obtener detalles de una película/serie
export const fetchRepelisDetails = async (url) => {
  try {
    console.log(`[VOD] Obteniendo detalles: ${url}`);
    const html = await fetchHtml(url);
    return extractRepelisDetails(html);
  } catch (error) {
    console.error('Error fetching details:', error);
    return null;
  }
};

// Obtener el enlace embed final del player de video
export const fetchRepelisEmbed = async (post, type, nume) => {
  try {
    const targetUrl = `${BASE_URL}/wp-json/dooplayer/v2/${post}/${type}/${nume}`;
    console.log(`[VOD] Obteniendo enlace embed: ${targetUrl}`);
    
    let embedUrl = null;
    try {
      const res = await fetch(targetUrl);
      if (res.ok) {
        const data = await res.json();
        embedUrl = data.embed_url || null;
      }
    } catch (e) {
      console.warn('[VOD] Fetch directo de embed falló por CORS, usando proxy...');
    }

    if (!embedUrl) {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const data = await res.json();
        embedUrl = data.embed_url || null;
      }
    }

    if (embedUrl) {
      // Limpiar iframe tags si vienen integrados en el response
      const iframeMatch = embedUrl.match(/src=['"]([^'"]+)['"]/);
      if (iframeMatch) {
        embedUrl = iframeMatch[1];
      }
    }

    return embedUrl;
  } catch (error) {
    console.error('Error fetching embed:', error);
    return null;
  }
};

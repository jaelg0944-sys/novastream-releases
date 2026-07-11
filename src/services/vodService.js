// src/services/vodService.js
// Servicio VOD para películas y series, integrando directamente desde cinecalidad.ro

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const BASE_URL = 'https://www.cinecalidad.ro';

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
  return await res.text();
}

// Scraper de items de Cinecalidad
function extractCinecalidadItems(html) {
  const items = [];
  
  // Cinecalidad envuelve cada película en un div de clase: "home_post_cont post_box" o "home_post_cont home_post_cont_last post_box"
  const divRegex = /<div class="home_post_cont[^"]*">([\s\S]*?)<\/div>/g;
  let match;
  while ((match = divRegex.exec(html)) !== null) {
    const divHtml = match[1];
    
    const linkMatch = divHtml.match(/href=([^\s>]+)/);
    const imgMatch = divHtml.match(/<img[^>]+src=([^\s>]+)/);
    const titleMatch = divHtml.match(/title="([^"]+)"/);
    const extractMatch = divHtml.match(/extract="([^"]+)"/);
    
    if (linkMatch && imgMatch && titleMatch) {
      const url = linkMatch[1];
      const poster = imgMatch[1];
      const title = titleMatch[1];
      
      let description = '';
      if (extractMatch) {
        const rawExtract = extractMatch[1];
        const temp = rawExtract
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&');
        const pMatch = temp.match(/<p>([\s\S]*?)<\/p>/);
        description = pMatch ? pMatch[1].trim() : '';
      }

      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : '2025';

      items.push({
        id: url.split('/').filter(Boolean).pop(),
        title: title.replace(/\s*\(\d{4}\)\s*/g, ''), // limpiar año del título
        type: 'movie',
        poster,
        url,
        description,
        rating: '9.0',
        year
      });
    }
  }
  return items;
}

// Scraper de detalles y reproductores de Cinecalidad
function extractCinecalidadDetails(html) {
  // Sinopsis/descripción general de la película
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || 
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Reproductores de video en "VER ONLINE"
  const options = [];
  
  // Buscar tags como: <a href=javascript:void(0); target=_blank class="link onlinelink" service=OnlineFilemoon data=j2e6wcknnw5g><li>Filemoon</li></a>
  const optionRegex = /<a[^>]+class=["']link\s+onlinelink["'][^>]+service=([^ >]+)[^>]+data=([^ >]+)>/g;
  let match;
  let nume = 1;
  while ((match = optionRegex.exec(html)) !== null) {
    const serviceName = match[1].replace('Online', '');
    const dataId = match[2];
    
    // Mapear los servidores compatibles para visualización directa
    let serverUrl = '';
    if (serviceName.toLowerCase() === 'filemoon') {
      serverUrl = `https://filemoon.sx/e/${dataId}`;
    } else if (serviceName.toLowerCase() === 'voe') {
      serverUrl = `https://voe.sx/e/${dataId}`;
    } else if (serviceName.toLowerCase() === 'doodstream') {
      serverUrl = `https://dood.yt/e/${dataId}`;
    } else if (serviceName.toLowerCase() === 'mega') {
      serverUrl = `https://mega.nz/embed/${dataId}`;
    }

    if (serverUrl) {
      options.push({
        nume: nume.toString(),
        type: 'iframe',
        post: dataId,
        server: serviceName,
        lang: 'Español Latino',
        embedUrl: serverUrl
      });
      nume++;
    }
  }

  return {
    postId: 'cinecalidad',
    description,
    options
  };
}

// ── APIs del Servicio ──────────────────────────────────────

// Obtener cartelera de Cinecalidad
export const fetchRepelisCartelera = async (type = 'pelicula', page = 1) => {
  try {
    // Cinecalidad es principalmente películas, por lo que cargamos la cartelera normal
    let targetUrl = `${BASE_URL}/`;
    if (page > 1) {
      targetUrl = `${BASE_URL}/page/${page}/`;
    }

    console.log(`[VOD Cinecalidad] Cargando: ${targetUrl}`);
    const html = await fetchHtml(targetUrl);
    return extractCinecalidadItems(html);
  } catch (error) {
    console.error('Error fetching Cinecalidad data:', error);
    return [];
  }
};

// Buscar películas
export const searchRepelis = async (query) => {
  try {
    const targetUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    console.log(`[VOD Cinecalidad] Buscando: ${targetUrl}`);
    const html = await fetchHtml(targetUrl);
    return extractCinecalidadItems(html);
  } catch (error) {
    console.error('Error searching Cinecalidad VOD:', error);
    return [];
  }
};

// Obtener detalles de la película
export const fetchRepelisDetails = async (url) => {
  try {
    console.log(`[VOD Cinecalidad] Detalles: ${url}`);
    const html = await fetchHtml(url);
    return extractCinecalidadDetails(html);
  } catch (error) {
    console.error('Error fetching Cinecalidad details:', error);
    return null;
  }
};

// Obtener el enlace embed final del player de video
export const fetchRepelisEmbed = async (post, type, nume) => {
  // Los reproductores en Cinecalidad ya los tenemos pre-resueltos en la función de detalles
  // en la propiedad "embedUrl", por lo que no es necesario hacer peticiones extras.
  // Sin embargo, para mantener compatibilidad con Catalog.jsx, retornamos el embedUrl mapeado.
  return type || null; 
};

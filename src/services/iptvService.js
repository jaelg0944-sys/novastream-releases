// src/services/iptvService.js
// Servicio IPTV con canales estáticos, resolver dinámico y servidor puente

import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

// ── Configuración ──────────────────────────────────────────
const BRIDGE_SERVER = 'https://server-sigma-cyan.vercel.app';
const CACHE_KEY = 'novastream_iptv_data_v56';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hora

// ── Base URL para assets locales ───────────────────────────
const BASE = '';

// ── Lista de Canales Estáticos (Ll) ────────────────────────
const CHANNELS = [
  // ─── Nacionales Ecuador ───
  { id: 'ec1',  name: 'Ecuavisa',       logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ecuavisa_Logo.svg/320px-Ecuavisa_Logo.svg.png',    streamUrl: 'https://dai.google.com/linear/hls/event/GyPkTVDZSXGhpOvxPK7m2g/master.m3u8', category: 'Nacionales' },
  { id: 'ec2',  name: 'Teleamazonas',   logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Teleamazonas_logo.png', streamUrl: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8', category: 'Nacionales' },
  { id: 'ec3',  name: 'Oromar TV',      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Logo_Oromar_TV.png',     streamUrl: 'https://stream.oromar.tv/hls/oromartv_hi/index.m3u8', category: 'Nacionales' },
  { id: 'ec4',  name: 'TVC',            logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Logo_TVC_Ecuador.png',          streamUrl: 'https://library-getafix.fireclip.tv/56e2d24bfdcf13ab4a321867/live/live_1.m3u8', category: 'Nacionales' },
  { id: 'ec5',  name: 'Gamavisión',     logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Gamavisi%C3%B3n_Ecuador_logo.svg/320px-Gamavisi%C3%B3n_Ecuador_logo.svg.png',   streamUrl: 'http://45.224.97.181:9999/Gamavision/index.m3u8', category: 'Nacionales' },
  { id: 'ec6',  name: 'TC Televisión',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/TC_Televisi%C3%B3n_logo_2022.svg/320px-TC_Televisi%C3%B3n_logo_2022.svg.png',           streamUrl: 'http://179.60.51.134:8888/TC/index.m3u8', category: 'Nacionales' },
  { id: 'ec7',  name: 'RTS',            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/RTS_Ecuador_logo.svg/320px-RTS_Ecuador_logo.svg.png',          streamUrl: 'https://d2w3o8zn50cs1k.cloudfront.net/ts:abr.m3u8', category: 'Nacionales' },
  { id: 'ec8',  name: 'Canal Uno',      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Canal_Uno_%28Ecuador%29_logo.png/320px-Canal_Uno_%28Ecuador%29_logo.png', streamUrl: 'https://stmv6.voxtvhd.com.br/sonorama/sonorama/playlist.m3u8', category: 'Nacionales' },
  { id: 'ec9',  name: 'Ecuador TV',     logo: 'https://i.imgur.com/hj6EYwe.png', streamUrl: 'http://45.224.97.181:9999/EcuadorTV/index.m3u8', category: 'Nacionales' },
  { id: 'ec10', name: 'RTU',            logo: 'https://i.imgur.com/1OWvMP4.png', streamUrl: 'https://video1.makrodigital.com/rtu/rtu/chunks.m3u8', category: 'Nacionales' },
  { id: 'ec11', name: 'Telerama',       logo: 'https://i.imgur.com/whIRrjo.png', streamUrl: 'https://play.once.net.ec/telerama/live.tv/538.m3u8', category: 'Nacionales' },

  // ─── Nacionales España ───
  { id: 'es1', name: 'La 1 (España)',   logo: `${BASE}/assets/la1.png`,          streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8', category: 'Nacionales', country: 'España' },
  { id: 'es2', name: 'La 2 (España)',   logo: `${BASE}/assets/la2.png`,          streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la2/la2_main_dvr.m3u8', category: 'Nacionales', country: 'España' },
  { id: 'es3', name: 'Canal 24H',       logo: `${BASE}/assets/24h.png`,          streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/24h/24h_main_dvr.m3u8', category: 'Nacionales', country: 'España' },

  { id: 'es5', name: 'Teledeporte',     logo: `${BASE}/assets/teledeporte.png`,  streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8', category: 'Deportes', country: 'España' },
  { id: 'es6', name: 'Real Madrid TV',  logo: `${BASE}/assets/realmadrid.png`,   streamUrl: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8', category: 'Deportes', country: 'España' },

  // ─── Deportes ───
  { id: 'rd1',  name: 'ESPN',           logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png',         streamUrl: 'http://200.115.120.1:8000/play/ca040/index.m3u8', category: 'Deportes' },
  { id: 'rd2',  name: 'ESPN 2',         logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png',         streamUrl: 'http://200.115.120.1:8000/play/ca041/index.m3u8', category: 'Deportes' },
  { id: 'rd3',  name: 'ESPN 3',         logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png',         streamUrl: 'http://200.115.120.1:8000/play/ca042/index.m3u8', category: 'Deportes' },
  { id: 'rd14', name: 'TUDN',           logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/TUDN_logo.svg/320px-TUDN_logo.svg.png',         streamUrl: 'http://200.115.120.1:8000/play/ca039/index.m3u8', category: 'Deportes' },

  // ─── Infantil ───
  { id: 'ki1', name: 'Canela Kids',     logo: `${BASE}/assets/canelakids.png`,   streamUrl: 'https://amg00658-amg00658c47-canelatv-international-7222.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-canelakids-canelatvinternational/playlist.m3u8', category: 'Infantil' },
  { id: 'f01', name: 'Disney Channel',  logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/2024_Disney_Channel_text_logo.svg', streamUrl: 'http://45.185.163.75:8000/play/a02j/index.m3u8', category: 'Infantil', country: 'Latinoamérica' },
  { id: 'f02', name: 'Disney Jr.',      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/2024_Disney_Jr._Logo.svg', streamUrl: 'http://45.185.163.75:8000/play/a016/index.m3u8', category: 'Infantil', country: 'Latinoamérica' },
  { id: 'f03', name: 'Nickelodeon',     logo: 'https://i.imgur.com/E84jnP8.png', streamUrl: 'http://179.60.51.134:8888/NICK/index.m3u8', category: 'Infantil', country: 'Latinoamérica' },
  { id: 'f04', name: 'Nick Jr.',        logo: 'https://i.imgur.com/KT4tdQs.png', streamUrl: 'http://179.60.51.134:8888/NICK-JR/index.m3u8', category: 'Infantil', country: 'Latinoamérica' },

  // ─── Novelas ───
  { id: 'nv1', name: 'Novelas Turcas',  logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Canela.TV_logo.png', streamUrl: 'https://amg00658-amg00658c102-canelatv-international-7231.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-novelasturcas-canelatvinternational/playlist.m3u8', category: 'Novelas' },
  { id: 'nv2', name: 'Las Estrellas',   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_Las_Estrellas.svg/320px-Logo_Las_Estrellas.svg.png', streamUrl: 'http://bantel-cdn1.iptvperu.tv:1935/btnscrtn/Canal_Las_Estrellas.stream/playlist.m3u8', category: 'Novelas', country: 'México' },
  { id: 'nv3', name: 'TL Novelas',      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Tlnovelas_logo.svg/320px-Tlnovelas_logo.svg.png', streamUrl: 'http://bantel-cdn1.iptvperu.tv:1935/btnscrtn/TL_Novelas.stream/playlist.m3u8', category: 'Novelas', country: 'México' },

  // ─── Entretenimiento ───
  { id: 'f05', name: 'MTV',             logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/MTV_2021_%28brand_version%29.svg/960px-MTV_2021_%28brand_version%29.svg.png', streamUrl: 'http://179.60.51.134:8888/MTV/index.m3u8', category: 'Entretenimiento', country: 'Latinoamérica' },
  { id: 'f06', name: 'Comedy Central',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Comedy_Central_2018.svg/960px-Comedy_Central_2018.svg.png', streamUrl: 'http://181.119.93.83:8000/play/a1di/index.m3u8', category: 'Entretenimiento', country: 'Latinoamérica' },

  // ─── Cine ───
  { id: 'f07', name: 'Star Channel',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Star_Channel_2020.svg/960px-Star_Channel_2020.svg.png', streamUrl: 'http://bantel-cdn1.iptvperu.tv:1935/btnscrtn/StarChannel.stream/playlist.m3u8', category: 'Cine', country: 'Latinoamérica' },
  { id: 'f12', name: 'AXN',             logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/960px-AXN_logo_%282015%29.svg.png', streamUrl: 'http://177.234.249.178:8888/AXN/index.m3u8', category: 'Cine', country: 'Latinoamérica' },
  { id: 'f13', name: 'Cinecanal',       logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/CinecanalLA.png/960px-CinecanalLA.png', streamUrl: 'http://bantel-cdn1.iptvperu.tv:1935/btnscrtn/cinecanal.stream/playlist.m3u8', category: 'Cine', country: 'Latinoamérica' },
  { id: 'f08', name: 'Studio Universal', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/StudioUniversal2016.png/960px-StudioUniversal2016.png', streamUrl: 'http://138.121.15.230:9002/STUDIO-UNIVERSAL/index.m3u8', category: 'Cine', country: 'Latinoamérica' },
  { id: 'f09', name: 'Universal TV',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Universal_TV_logo.svg/960px-Universal_TV_logo.svg.png', streamUrl: 'http://138.121.15.230:9002/UNIVERSAL-CHANNEL/index.m3u8', category: 'Cine', country: 'Latinoamérica' },

  // ─── Documentales ───
  { id: 'f10', name: 'A&E',             logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/A%26E_Network_logo.svg/500px-A%26E_Network_logo.svg.png', streamUrl: 'http://138.121.15.230:9002/A&E/index.m3u8', category: 'Documentales', country: 'Latinoamérica' },
  { id: 'f11', name: 'History Channel', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/History_%282021%29.svg/500px-History_%282021%29.svg.png', streamUrl: 'http://138.121.15.230:9002/HISTORY-CHANNEL/index.m3u8', category: 'Documentales', country: 'Latinoamérica' },

].map(channel => ({
  ...channel,
  country: channel.country || (channel.category === 'Nacionales' ? 'Ecuador' : 'Latinoamérica'),
  rawCategories: [channel.category],
  languages: ['spa'],
  isEcuaplay: false,
  resolveType: channel.resolveType || null,
}));


// ── Función para obtener HTML de una página (Rl) ──────────
// Intenta primero con CapacitorHttp (nativo), luego con proxies CORS
const fetchPageHtml = async (url, referer) => {
  let html = '';

  // Intento 1: CapacitorHttp (solo funciona en dispositivo nativo)
  if (Capacitor.isNativePlatform()) {
    try {
      const response = await CapacitorHttp.get({
        url,
        headers: {
          Accept: 'text/html',
          ...(referer ? { Referer: referer } : {}),
        },
        responseType: 'text',
      });
      html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } catch (err) {
      console.warn('[fetchPageHtml] CapacitorHttp falló:', err.message);
    }
  }

  // Intento 2: corsproxy.io
  if (!html || html.length < 50) {
    try {
      html = await (await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`)).text();
    } catch (err) {
      console.warn('[fetchPageHtml] corsproxy falló:', err.message);
    }
  }

  // Intento 3: codetabs proxy
  if (!html || html.length < 50) {
    try {
      html = await (await fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`)).text();
    } catch (err) {
      console.warn('[fetchPageHtml] codetabs falló:', err.message);
    }
  }

  return html || '';
};


// ── Resolver Dinámico de Streams (Bl) ──────────────────────
// Intenta primero con el Servidor Puente, luego con fallback local
export const resolveStream = async (type, url) => {
  // Intento 1: Servidor Puente
  try {
    console.log(`[Resolver] Intentando resolver mediante Servidor Puente: ${url}`);
    const response = await fetch(`${BRIDGE_SERVER}/api/resolve?url=${encodeURIComponent(url)}&type=${type}`);
    if (response.ok) {
      const data = await response.json();
      if (data.streamUrl) {
        console.log(`[Resolver] Enlace resuelto con éxito por el Puente: ${data.streamUrl}`);
        return data.streamUrl;
      }
    }
  } catch (err) {
    console.warn(`[Resolver] El Servidor Puente falló o no está disponible: ${err.message}. Usando fallback local.`);
  }

  // Intento 2: Fallback local para tvhd2
  if (type === 'tvhd2') {
    try {
      console.log(`[Resolver] Iniciando resolución para tipo: ${type}, url: ${url}`);
      let resolveUrl = url;
      if (resolveUrl.includes('/vivo/')) {
        resolveUrl = resolveUrl.replace('/vivo/', '/tv/');
      }
      const html = await fetchPageHtml(resolveUrl, resolveUrl.replace('/tv/', '/vivo/'));
      const match = html.match(/var playbackURL\s*=\s*"([^"]+)"/);
      if (match && match[1]) {
        const streamUrl = match[1];
        console.log('[Resolver] URL de video extraída con éxito:', streamUrl);
        return streamUrl;
      } else {
        throw new Error('No se encontró "var playbackURL" en el código HTML de origen.');
      }
    } catch (err) {
      console.error('[Resolver] Error al obtener el stream dinámico de tvhd2:', err);
      throw err;
    }
  }

  // Intento 3: Fallback local para ecuaplay
  if (type === 'ecuaplay') {
    try {
      console.log(`[Resolver] Iniciando resolución ECUAPLAY: ${url}`);
      const html = await fetchPageHtml(url, 'https://www.ecuaplay.online/index.html');

      // Buscar playbackURL
      const matchPlayback = html.match(/var playbackURL\s*=\s*"([^"]+)"/);
      if (matchPlayback && matchPlayback[1]) return matchPlayback[1];

      // Buscar URL m3u8 directa
      const matchM3u8 = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
      if (matchM3u8 && matchM3u8[0]) {
        console.log('[Resolver] URL m3u8 directa encontrada:', matchM3u8[0]);
        return matchM3u8[0];
      }

      // Buscar source
      const matchSource = html.match(/source:\s*"([^"]+)"/i);
      if (matchSource && matchSource[1]) {
        console.log('[Resolver] source URL encontrada:', matchSource[1]);
        return matchSource[1];
      }

      // Buscar iframe y resolver recursivamente
      const matchIframe = html.match(/<iframe[^>]+src="([^"]+)"/i);
      if (matchIframe && matchIframe[1]) {
        let iframeUrl = matchIframe[1];
        console.log('[Resolver] iframe encontrado:', iframeUrl);

        if (iframeUrl.startsWith('/')) {
          iframeUrl = `${new URL(url).origin}${iframeUrl}`;
        }

        // Si es tvhd2, resolver recursivamente
        if (iframeUrl.includes('tvhd2') || iframeUrl.includes('canales.php')) {
          return await resolveStream('tvhd2', iframeUrl);
        }

        // Si es un embed conocido (dailymotion, youtube, vimeo), devolver directamente
        if (iframeUrl.includes('dailymotion.com') || iframeUrl.includes('youtube.com') || iframeUrl.includes('vimeo.com')) {
          return iframeUrl;
        }

        // Intentar resolver iframe anidado de tercer nivel
        try {
          console.log('[Resolver] Resolviendo iframe anidado de tercer nivel:', iframeUrl);
          const innerHtml = await fetchPageHtml(iframeUrl, url);
          const matchInnerIframe = innerHtml.match(/<iframe[^>]+src="([^"]+)"/i);
          if (matchInnerIframe && matchInnerIframe[1]) {
            let nestedUrl = matchInnerIframe[1];
            if (nestedUrl.startsWith('/')) {
              nestedUrl = `${new URL(iframeUrl).origin}${nestedUrl}`;
            }
            console.log('[Resolver] Iframe anidado resuelto con éxito:', nestedUrl);
            return nestedUrl;
          }
        } catch (innerErr) {
          console.warn('[Resolver] Error al resolver iframe anidado:', innerErr);
        }

        return iframeUrl;
      }

      throw new Error('No se encontró stream en Ecuaplay.');
    } catch (err) {
      console.error('[Resolver] Error al obtener el stream dinámico de ecuaplay:', err);
      throw err;
    }
  }

  // Si no tiene tipo de resolución especial, devolver la URL tal cual
  return url;
};


// ── Función principal para obtener datos IPTV (zl) ─────────
export const fetchIPTVData = async () => {
  try {
    // Verificar caché local
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }

    // Usar la lista de canales estáticos directamente
    const channels = [...CHANNELS];

    // Guardar en caché
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: channels,
      timestamp: Date.now(),
    }));

    return channels;
  } catch (error) {
    console.error('Error fetching IPTV data:', error);
    return CHANNELS;
  }
};

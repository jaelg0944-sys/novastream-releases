// src/services/iptvService.js
// Servicio IPTV con canales estáticos, resolver dinámico y servidor puente

import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

// ── Configuración ──────────────────────────────────────────
const BRIDGE_SERVER = 'https://novastream-resolver.vercel.app';
const CACHE_KEY = 'novastream_iptv_data_v113';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hora

// ── Base URL para assets locales ───────────────────────────
const BASE = '';

// ── Lista de Canales Estáticos (Ll) ────────────────────────
const CHANNELS = [
  // ─── Nacionales Ecuador ───
  { id: 'ec1',  name: 'Ecuavisa',       logo: `${BASE}/assets/ecuavisa.png`,    streamUrl: 'http://45.171.108.253:8888/ECUAVISA/index.m3u8', category: 'Nacionales', backups: ['https://redirector.rudo.video/hls-video/c54ac2799874375c81c1672abb700870537c5223/ecuavisa/ecuavisa.smil/playlist_dvr.m3u8', 'http://45.224.97.181:9999/Ecuavisa/index.m3u8', 'http://179.60.51.134:8888/ECUAVISA/index.m3u8'] },
  { id: 'ec2',  name: 'Teleamazonas',   logo: `${BASE}/assets/teleamazonas.png`, streamUrl: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8', category: 'Nacionales' },
  { id: 'ec3',  name: 'Oromar TV',      logo: `${BASE}/assets/oromartv.png`,     streamUrl: 'https://stream.oromar.tv/hls/oromartv_hi/index.m3u8', category: 'Nacionales' },
  { id: 'ec4',  name: 'TVC',            logo: `${BASE}/assets/tvc.png`,          streamUrl: 'https://library-getafix.fireclip.tv/56e2d24bfdcf13ab4a321867/live/live_1.m3u8', category: 'Nacionales' },
  { id: 'ec5',  name: 'Gamavisión',     logo: `${BASE}/assets/gamavision.png`,   streamUrl: 'http://45.224.97.181:9999/Gamavision/index.m3u8', category: 'Nacionales' },
  { id: 'ec6',  name: 'TC Televisión',  logo: `${BASE}/assets/tc.png`,           streamUrl: 'http://179.60.51.134:8888/TC/index.m3u8', category: 'Nacionales' },
  { id: 'ec7',  name: 'RTS',            logo: `${BASE}/assets/rts.png`,          streamUrl: 'http://179.60.51.134:8888/RTS/index.m3u8', category: 'Nacionales' },
  { id: 'ec8',  name: 'Canal Uno',      logo: `${BASE}/assets/canaluno.png`, streamUrl: 'https://stmv6.voxtvhd.com.br/sonorama/sonorama/playlist.m3u8', category: 'Nacionales' },
  { id: 'ec9',  name: 'Ecuador TV',     logo: `${BASE}/assets/ecuadortv.png`, streamUrl: 'http://45.224.97.181:9999/EcuadorTV/index.m3u8', category: 'Nacionales' },
  { id: 'ec10', name: 'RTU',            logo: `${BASE}/assets/rtu.png`, streamUrl: 'https://video1.makrodigital.com/rtu/rtu/chunks.m3u8', category: 'Nacionales' },


  // ─── Nacionales España ───
  { id: 'es1', name: 'La 1 (España)',   logo: `${BASE}/assets/la1.png`,          streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8', category: 'Nacionales', country: 'España' },
  { id: 'es2', name: 'La 2 (España)',   logo: `${BASE}/assets/la2.png`,          streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la2/la2_main_dvr.m3u8', category: 'Nacionales', country: 'España' },
  { id: 'es3', name: 'Canal 24H',       logo: `${BASE}/assets/24h.png`,          streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/24h/24h_main_dvr.m3u8', category: 'Nacionales', country: 'España' },

  { id: 'es5', name: 'Teledeporte',     logo: `${BASE}/assets/teledeporte.png`,  streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8', category: 'Deportes', country: 'España' },
  { id: 'es6', name: 'Real Madrid TV',  logo: `${BASE}/assets/realmadrid.png`,   streamUrl: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8', category: 'Deportes', country: 'España' },

  { 
    id: 'dsports', 
    name: 'DSports (DirecTV)', 
    logo: `${BASE}/assets/dsports.png`, 
    streamUrl: 'https://otte-qw.live.pv-cdn.net/pdx-nitro/live/clients/dash/enc/3gg2jnixjn/out/v1/e1840e01f3f14563b66bbb944d5cc54c/cenc.mpd', 
    category: 'Deportes',
    isDashed: true,
    drm: {
      clearKeys: {
        'f8b207c10f3f76aeba32a360ec52b9e4': 'afad49d20eb39670e93e371c1d669921'
      }
    }
  },
  { 
    id: 'rd1',  
    name: 'ESPN',           
    logo: `${BASE}/assets/espn.png`,         
    streamUrl: 'http://179.60.51.134:8888/ESPN/index.m3u8', 
    category: 'Deportes',
    backups: [
      'http://179.60.51.134:8888/ESPN/index.m3u8',
      'http://85.237.89.160:9590/usa-s/ESPN-HD/index.m3u8'
    ]
  },
  { 
    id: 'rd2',  
    name: 'ESPN 2',         
    logo: `${BASE}/assets/espn.png`,         
    streamUrl: 'http://200.115.120.1:8000/play/ca041/index.m3u8', 
    category: 'Deportes',
    backups: [
      'http://179.60.51.134:8888/ESPN2/index.m3u8'
    ]
  },
  { 
    id: 'rd3',  
    name: 'ESPN 3',         
    logo: `${BASE}/assets/espn.png`,         
    streamUrl: 'http://200.115.120.1:8000/play/ca042/index.m3u8', 
    category: 'Deportes',
    backups: [
      'http://179.60.51.134:8888/ESPN3/index.m3u8'
    ]
  },
  { id: 'rd14', name: 'TUDN',           logo: `${BASE}/assets/tudn.png`,         streamUrl: 'http://200.115.120.1:8000/play/ca039/index.m3u8', category: 'Deportes' },
 
  // ─── Infantil ───
  { id: 'ki1', name: 'Canela Kids',     logo: `${BASE}/assets/canelakids.png`,   streamUrl: 'https://amg00658-amg00658c47-canelatv-international-7222.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-canelakids-canelatvinternational/playlist.m3u8', category: 'Infantil' },
  { 
    id: 'f01', 
    name: 'Disney Channel',  
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/2024_Disney_Channel_text_logo.svg', 
    streamUrl: 'http://45.134.141.161:2200/ARG/Disney_Channel/index.m3u8', 
    category: 'Infantil', 
    country: 'Latinoamérica',
    backups: ['http://138.121.15.230:9002/DISNEY-CHANNEL/index.m3u8', 'http://45.134.141.161:2200/ARG/Disney_Channel/index.m3u8']
  },
  { id: 'f02', name: 'Disney Jr.',      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/2024_Disney_Jr._Logo.svg', streamUrl: 'http://179.60.51.134:8888/DISNEY-JR/index.m3u8', category: 'Infantil', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/DISNEY-JR/index.m3u8', 'http://45.134.141.161:2200/ARG/Disney_Junior/index.m3u8'] },
  { id: 'f03', name: 'Nickelodeon',     logo: 'https://i.imgur.com/E84jnP8.png', streamUrl: 'http://179.60.51.134:8888/NICK/index.m3u8', category: 'Infantil', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/NICK/index.m3u8', 'http://45.134.141.161:2200/ARG/Nickelodeon/index.m3u8'] },
  { id: 'f04', name: 'Nick Jr.',        logo: 'https://i.imgur.com/KT4tdQs.png', streamUrl: 'http://179.60.51.134:8888/NICK-JR/index.m3u8', category: 'Infantil', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/NICK-JR/index.m3u8', 'http://45.134.141.161:2200/ARG/Nick_Jr/index.m3u8'] },
 
  // ─── Novelas ───
  { id: 'nv1', name: 'Novelas Turcas',  logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Canela.TV_logo.png', streamUrl: 'https://amg00658-amg00658c102-canelatv-international-7231.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-novelasturcas-canelatvinternational/playlist.m3u8', category: 'Novelas' },
  { id: 'nv2', name: 'Las Estrellas',   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_Las_Estrellas.svg/320px-Logo_Las_Estrellas.svg.png', streamUrl: 'http://138.121.15.230:9002/LAS-ESTRELLAS/index.m3u8', category: 'Novelas', country: 'México', backups: ['http://179.60.51.134:8888/LAS-ESTRELLAS/index.m3u8'] },
  // { id: 'nv3', name: 'TL Novelas',      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Tlnovelas_logo.svg/320px-Tlnovelas_logo.svg.png', streamUrl: 'http://138.121.15.230:9002/TL-NOVELAS/index.m3u8', category: 'Novelas', country: 'México', backups: ['http://179.60.51.134:8888/TL-NOVELAS/index.m3u8', 'http://45.134.141.161:2200/ARG/TL_Novelas/index.m3u8'] },
 
  // ─── Entretenimiento ───
  { id: 'f05', name: 'MTV',             logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/MTV_2021_%28brand_version%29.svg/960px-MTV_2021_%28brand_version%29.svg.png', streamUrl: 'http://179.60.51.134:8888/MTV/index.m3u8', category: 'Entretenimiento', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/MTV/index.m3u8'] },
  { id: 'f06', name: 'Comedy Central',  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Comedy_Central_2018.svg/960px-Comedy_Central_2018.svg.png', streamUrl: 'http://181.119.93.83:8000/play/a1di/index.m3u8', category: 'Entretenimiento', country: 'Latinoamérica' },
 
  // ─── Cine ───
  { 
    id: 'f07', 
    name: 'Star Channel',    
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Star_Channel_2020.svg', 
    streamUrl: 'http://179.60.51.134:8888/STAR-CHANNEL/index.m3u8', 
    category: 'Cine', 
    country: 'Latinoamérica',
    backups: [
      'http://138.121.15.230:9002/STAR-CHANNEL/index.m3u8',
      'https://novastream-resolver.vercel.app/api/gambeta?ref=122'
    ]
  },
  { 
    id: 'f13', 
    name: 'Cinecanal',       
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/CinecanalLA.png', 
    streamUrl: 'http://138.121.15.230:9002/CINECANAL/index.m3u8', 
    category: 'Cine', 
    country: 'Latinoamérica',
    backups: [
      'http://179.60.51.134:8888/CINECANAL/index.m3u8',
      'https://novastream-resolver.vercel.app/api/gambeta?ref=119'
    ]
  },
  { 
    id: 'f08', 
    name: 'Studio Universal', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/74/StudioUniversal2016.png', 
    streamUrl: 'http://138.121.15.230:9002/STUDIO-UNIVERSAL/index.m3u8', 
    category: 'Cine', 
    country: 'Latinoamérica',
    backups: [
      'http://179.60.51.134:8888/STUDIO-UNIVERSAL/index.m3u8',
      'https://novastream-resolver.vercel.app/api/gambeta?ref=6806'
    ]
  },
  { id: 'f09', name: 'Universal TV', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Universal_TV_logo.svg', streamUrl: 'http://138.121.15.230:9002/UNIVERSAL-CHANNEL/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/UNIVERSAL/index.m3u8'] },
  { id: 'f12', name: 'AXN', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/AXN_logo_%282015%29.svg', streamUrl: 'http://138.121.15.230:9002/AXN/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/AXN/index.m3u8'] },
  { id: 'f14', name: 'Universal Premiere', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Universal_TV_logo.svg', streamUrl: 'http://179.60.51.134:8888/UNIVERSAL/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/UNIVERSAL-CHANNEL/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=126'] },
  { id: 'f15', name: 'Golden', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Golden_logo.svg', streamUrl: 'http://138.121.15.230:9002/GOLDEN/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/GOLDEN/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=6781'] },
  { id: 'f16', name: 'Warner Channel', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Warner_Channel_2017.svg', streamUrl: 'http://181.119.93.83:8000/play/a1dv/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/WARNER/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=7397'] },
  { id: 'f17', name: 'FX', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/FX_Logo.svg', streamUrl: 'http://138.121.15.230:9002/FX/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/FX/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=120'] },
  { id: 'f18', name: 'HBO', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg', streamUrl: 'http://45.134.141.161:2200/ARG/HBO_HD/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://45.134.141.161:2200/ARG/HBO_Signature/index.m3u8'] },
 
  // ─── Documentales ───
  // { id: 'f10', name: 'A&E',             logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/A%26E_Network_logo.svg', streamUrl: 'http://138.121.15.230:9002/A%26E/index.m3u8', category: 'Documentales', country: 'Latinoamérica' },
  { id: 'f11', name: 'History Channel', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/01/History_%282021%29.svg', streamUrl: 'http://138.121.15.230:9002/HISTORY-CHANNEL/index.m3u8', category: 'Documentales', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/HISTORY/index.m3u8'] },

  // ── NUEVOS CANALES PREMIUM ──────────────────────────────────
  // Deportes Premium
  { id: 'dp1', name: 'Fox Sports', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Fox_Sports_Logo_2024.svg', streamUrl: 'http://85.237.89.160:9590/usa-s/FOX-SPORTS-1/index.m3u8', category: 'Deportes', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/FOX-SPORTS/index.m3u8'] },
  { id: 'dp2', name: 'Fox Sports 2', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Fox_Sports_Logo_2024.svg', streamUrl: 'http://200.115.120.1:8000/play/ca044/index.m3u8', category: 'Deportes', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/FOXSPORTS2/index.m3u8'] },
  { id: 'dp3', name: 'GolTV', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/32/GolTV_2021_logo.svg', streamUrl: 'http://179.60.51.134:8888/GOLTV/index.m3u8', category: 'Deportes', country: 'Ecuador', backups: ['http://138.121.15.230:9002/GOLTV/index.m3u8'] },
  { id: 'dp4', name: 'TyC Sports', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/TyC_Sports_logo.svg', streamUrl: 'http://45.181.87.106/TYCSPORTSHD/index.m3u8', category: 'Deportes', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/TYCSPORTS/index.m3u8'] },

  { id: 'dp6', name: 'Red Bull TV', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Red_Bull_TV.svg', streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8', category: 'Deportes', country: 'Internacional' },
  // Cine Premium
  { id: 'cp1', name: 'TNT', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/TNT_Logo_2016.svg', streamUrl: 'http://179.60.51.134:8888/TNT/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/TNT/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=145'] },
  { id: 'cp2', name: 'TNT Series', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/TNT_Logo_2016.svg', streamUrl: 'http://179.60.51.134:8888/TNT-SERIES/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/TNT-SERIES/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=146'] },
  { id: 'cp7', name: 'TNT Novelas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/TNT_Logo_2016.svg', streamUrl: 'http://179.60.51.134:8888/TNT-NOVELAS/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/TNT-NOVELAS/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=106'] },
  { id: 'cp3', name: 'Space', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Space_%28Latin_American_TV_channel%29_Logo.svg', streamUrl: 'http://45.134.141.161:2200/ARG/Space_HD/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/SPACE/index.m3u8', 'http://179.60.51.134:8888/SPACE/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=139'] },
  { id: 'cp4', name: 'Cinemax', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Cinemax_%28Yellow%29.svg', streamUrl: 'http://179.60.51.134:8888/CINEMAX/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['http://138.121.15.230:9002/CINEMAX/index.m3u8', 'https://novastream-resolver.vercel.app/api/gambeta?ref=6558'] },
  { id: 'cp5', name: 'Sony Channel', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Sony_Channel_2021.svg', streamUrl: 'http://138.121.15.230:9002/SONY/index.m3u8', category: 'Cine', country: 'Latinoamérica', backups: ['https://novastream-resolver.vercel.app/api/gambeta?ref=121'] },
  // Infantil Premium
  { id: 'ki2', name: 'Cartoon Network', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/500px-Cartoon_Network_2010_logo.svg.png', streamUrl: 'http://179.60.51.134:8888/CARTOON-NETWORK/index.m3u8', category: 'Infantil', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/CARTOON-NETWORK/index.m3u8', 'http://138.121.15.230:9002/CARTOON-NETWORK/index.m3u8'] },
  { id: 'ki3', name: 'Discovery Kids', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Discovery_Kids_2024.svg/500px-Discovery_Kids_2024.svg.png', streamUrl: 'http://179.60.51.134:8888/DISCOVERY-KIDS/index.m3u8', category: 'Infantil', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/DISCOVERY-KIDS/index.m3u8', 'http://45.134.141.161:2200/ARG/Discovery_Kids/index.m3u8'] },
  // Documentales Premium
  { id: 'dc1', name: 'National Geographic', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Natgeo_logo.svg/500px-Natgeo_logo.svg.png', streamUrl: 'http://138.121.15.230:9002/NAT-GEO/index.m3u8', category: 'Documentales', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/NATGEO/index.m3u8', 'http://138.121.15.230:9002/NAT-GEO/index.m3u8'] },
  { id: 'dc2', name: 'Animal Planet', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Animal_Planet_logo_%282018%29.svg/500px-Animal_Planet_logo_%282018%29.svg.png', streamUrl: 'http://179.60.51.134:8888/ANIMAL-PLANET/index.m3u8', category: 'Documentales', country: 'Latinoamérica', backups: ['http://179.60.51.134:8888/ANIMAL-PLANET/index.m3u8', 'http://138.121.15.230:9002/ANIMAL-PLANET/index.m3u8'] },
  // Noticias
  { id: 'nw1', name: 'CNN en Español', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CNN_en_Espa%C3%B1ol.svg/500px-CNN_en_Espa%C3%B1ol.svg.png', streamUrl: 'http://179.60.51.134:8888/CNN/index.m3u8', category: 'Noticias', country: 'Internacional', backups: ['http://179.60.51.134:8888/CNN/index.m3u8', 'http://138.121.15.230:9002/CNN-ESPANOL/index.m3u8'] },
  { id: 'nw2', name: 'Telemundo', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Telemundo_logo_2018.svg/500px-Telemundo_logo_2018.svg.png', streamUrl: 'http://138.121.15.230:9002/TELEMUNDO/index.m3u8', category: 'Noticias', country: 'Estados Unidos', backups: ['http://179.60.51.134:8888/TELEMUNDO/index.m3u8', 'http://138.121.15.230:9002/TELEMUNDO/index.m3u8'] },
  // Canales Internacionales
  { id: 'in1', name: 'Caracol TV', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Logo_de_Caracol_Televisi%C3%B3n_%282017-present%29.svg/500px-Logo_de_Caracol_Televisi%C3%B3n_%282017-present%29.svg.png', streamUrl: 'http://45.171.108.253:8888/CARACOL/index.m3u8', category: 'Internacionales', country: 'Colombia', backups: ['http://179.60.51.134:8888/CARACOL/index.m3u8', 'http://138.121.15.230:9002/CARACOL/index.m3u8'] },
  { id: 'in2', name: 'RCN', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/RCN_Televisi%C3%B3n_logo.svg/500px-RCN_Televisi%C3%B3n_logo.svg.png', streamUrl: 'http://138.121.15.230:9002/RCN/index.m3u8', category: 'Internacionales', country: 'Colombia', backups: ['http://179.60.51.134:8888/RCN/index.m3u8', 'http://138.121.15.230:9002/RCN/index.m3u8'] },
  { id: 'in3', name: 'Telefe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Logo_Telefe.svg/500px-Logo_Telefe.svg.png', streamUrl: 'http://45.134.141.161:2200/ARG/TELEFE_HD/index.m3u8', category: 'Internacionales', country: 'Argentina', backups: ['http://179.60.51.134:8888/TELEFE/index.m3u8'] },
  { id: 'in4', name: 'El Trece', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/El_Trece_logo.svg/500px-El_Trece_logo.svg.png', streamUrl: 'https://livetrx01.vodgc.net/eltrecetv/index.m3u8', category: 'Internacionales', country: 'Argentina' },
  { id: 'in5', name: 'Azteca Internacional', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Logo_TV_Azteca_%282022%29.svg/500px-Logo_TV_Azteca_%282022%29.svg.png', streamUrl: 'https://azt-mun.otteravision.com/azt/mun/mun.m3u8', category: 'Internacionales', country: 'México', backups: ['http://179.60.51.134:8888/AZTECA/index.m3u8'] },
 
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

        // Intentar resolver HTML interno de iframe para extraer m3u8 directo
        try {
          console.log('[Resolver] Resolviendo HTML interno de iframe:', iframeUrl);
          const innerHtml = await fetchPageHtml(iframeUrl, url);

          const innerPlayback = innerHtml.match(/var playbackURL\s*=\s*"([^"]+)"/);
          if (innerPlayback && innerPlayback[1]) {
            console.log('[Resolver] m3u8 resuelto en HTML interno:', innerPlayback[1]);
            return innerPlayback[1];
          }

          const innerM3u8 = innerHtml.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
          if (innerM3u8 && innerM3u8[0]) {
            console.log('[Resolver] m3u8 directo resuelto en HTML interno:', innerM3u8[0]);
            return innerM3u8[0];
          }

          const innerSource = innerHtml.match(/source:\s*"([^"]+)"/i);
          if (innerSource && innerSource[1]) {
            console.log('[Resolver] source resuelto en HTML interno:', innerSource[1]);
            return innerSource[1];
          }

          const matchInnerIframe = innerHtml.match(/<iframe[^>]+src="([^"]+)"/i);
          if (matchInnerIframe && matchInnerIframe[1]) {
            let nestedUrl = matchInnerIframe[1];
            if (nestedUrl.startsWith('/')) {
              nestedUrl = `${new URL(iframeUrl).origin}${nestedUrl}`;
            }
            console.log('[Resolver] Iframe anidado resuelto:', nestedUrl);
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


// ── Parser de listas M3U públicas ──────────────────────────
async function parseM3UFromUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4 segundos máx
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return {};
    const text = await res.text();
    const lines = text.split('\n');
    const channelsMap = {};

    let currentInfo = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        currentInfo = line;
      } else if (line.startsWith('http') && currentInfo) {
        // Extraer nombre del canal después de la última coma del EXTINF
        const nameMatch = currentInfo.match(/,\s*(.+)$/);
        const name = nameMatch ? nameMatch[1].trim().toLowerCase() : '';
        
        // Extraer tvg-id si existe
        const idMatch = currentInfo.match(/tvg-id="([^"]+)"/i);
        const tvgId = idMatch ? idMatch[1].trim().toLowerCase() : '';

        if (name) {
          channelsMap[name] = line;
        }
        if (tvgId) {
          channelsMap[tvgId] = line;
        }
        currentInfo = null;
      }
    }
    return channelsMap;
  } catch (err) {
    console.warn(`[IPTV AutoUpdate] Falló descarga/parseo de ${url}:`, err.message);
    return {};
  }
}

// Mapeo de canales que queremos actualizar dinámicamente con iptv-org
// { id_canal_estatico: [lista de nombres clave en iptv-org] }
const DYNAMIC_MAPPINGS = {
  ec1: ['ecuavisa', 'ecuavisa.ec'],
  ec2: ['teleamazonas', 'teleamazonas.ec'],
  ec3: ['oromar tv', 'oromartv.ec'],
  ec7: ['rts', 'rtsecuador.ec'],
  es1: ['la 1', 'la1.es'],
  es2: ['la 2', 'la2.es'],
  es3: ['canal 24h', '24h.es'],
  es5: ['teledeporte', 'tdp.es'],
  es6: ['real madrid tv', 'realmadridtv.es'],
};

// ── Función principal para obtener datos IPTV (zl) ─────────
export const fetchIPTVData = async () => {
  try {
    console.log('[IPTV AutoUpdate] Obteniendo canales en tiempo real desde el resolvedor Vercel...');
    
    // 1. Intentar siempre obtener los canales más recientes del servidor puente (evitando cache agresiva)
    const response = await fetch(`${BRIDGE_SERVER}/api/iptv?t=${Date.now()}`);
    if (response.ok) {
      const serverChannels = await response.json();
      if (serverChannels && Array.isArray(serverChannels) && serverChannels.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: serverChannels,
          timestamp: Date.now(),
        }));
        return serverChannels;
      }
    }
  } catch (error) {
    console.warn('[IPTV Service] Error obteniendo canales en vivo de la API, usando caché:', error.message);
  }

  // 2. Fallback a caché local si no hay conexión a internet
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { data } = JSON.parse(cached);
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {}
  }

  // 3. Fallback a lista de canales estáticos locales
  return CHANNELS;
};


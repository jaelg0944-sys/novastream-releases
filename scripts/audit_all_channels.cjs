const fs = require('fs');

const channels = [
  // Nacionales Ecuador
  { id: 'ec1', name: 'Ecuavisa', streamUrl: 'https://dai.google.com/linear/hls/event/GyPkTVDZSXGhpOvxPK7m2g/master.m3u8' },
  { id: 'ec2', name: 'Teleamazonas', streamUrl: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8' },
  { id: 'ec3', name: 'Oromar TV', streamUrl: 'https://stream.oromar.tv/hls/oromartv_hi/index.m3u8' },
  { id: 'ec4', name: 'TVC', streamUrl: 'https://library-getafix.fireclip.tv/56e2d24bfdcf13ab4a321867/live/live_1.m3u8' },
  { id: 'ec5', name: 'Gamavisión', streamUrl: 'http://45.224.97.181:9999/Gamavision/index.m3u8' },
  { id: 'ec6', name: 'TC Televisión', streamUrl: 'http://179.60.51.134:8888/TC/index.m3u8' },
  { id: 'ec7', name: 'RTS', streamUrl: 'http://179.60.51.134:8888/RTS/index.m3u8' },
  { id: 'ec8', name: 'Canal Uno', streamUrl: 'https://stmv6.voxtvhd.com.br/sonorama/sonorama/playlist.m3u8' },
  { id: 'ec9', name: 'Ecuador TV', streamUrl: 'http://45.224.97.181:9999/EcuadorTV/index.m3u8' },
  { id: 'ec10', name: 'RTU', streamUrl: 'https://video1.makrodigital.com/rtu/rtu/chunks.m3u8' },
  { id: 'ec11', name: 'Telerama', streamUrl: 'https://play.once.net.ec/telerama/live.tv/538.m3u8' },

  // Nacionales España & Deportes España
  { id: 'es1', name: 'La 1 (España)', streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8' },
  { id: 'es2', name: 'La 2 (España)', streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la2/la2_main_dvr.m3u8' },
  { id: 'es3', name: 'Canal 24H', streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/24h/24h_main_dvr.m3u8' },
  { id: 'es5', name: 'Teledeporte', streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8' },
  { id: 'es6', name: 'Real Madrid TV', streamUrl: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8' },

  // Deportes & DirecTV
  { id: 'dsports', name: 'DSports (DirecTV)', streamUrl: 'https://otte-qw.live.pv-cdn.net/pdx-nitro/live/clients/dash/enc/3gg2jnixjn/out/v1/e1840e01f3f14563b66bbb944d5cc54c/cenc.mpd', type: 'DASH' },
  { id: 'rd1', name: 'ESPN', streamUrl: 'http://200.115.120.1:8000/play/ca040/index.m3u8', backups: ['http://179.60.51.134:8888/ESPN/index.m3u8', 'http://138.121.15.230:9002/ESPN/index.m3u8'] },
  { id: 'rd2', name: 'ESPN 2', streamUrl: 'http://200.115.120.1:8000/play/ca041/index.m3u8', backups: ['http://179.60.51.134:8888/ESPN2/index.m3u8', 'http://138.121.15.230:9002/ESPN2/index.m3u8'] },
  { id: 'rd3', name: 'ESPN 3', streamUrl: 'http://200.115.120.1:8000/play/ca042/index.m3u8', backups: ['http://179.60.51.134:8888/ESPN3/index.m3u8', 'http://138.121.15.230:9002/ESPN3/index.m3u8'] },
  { id: 'rd14', name: 'TUDN', streamUrl: 'http://200.115.120.1:8000/play/ca039/index.m3u8' },

  // Infantil & Novelas & Entretenimiento
  { id: 'ki1', name: 'Canela Kids', streamUrl: 'https://amg00658-amg00658c47-canelatv-international-7222.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-canelakids-canelatvinternational/playlist.m3u8' },
  { id: 'f01', name: 'Disney Channel', streamUrl: 'http://45.185.163.75:8000/play/a02j/index.m3u8', backups: ['http://179.60.51.134:8888/DISNEY/index.m3u8', 'http://138.121.15.230:9002/DISNEY/index.m3u8'] },
  { id: 'f02', name: 'Disney Jr.', streamUrl: 'http://45.185.163.75:8000/play/a016/index.m3u8' },
  { id: 'f03', name: 'Nickelodeon', streamUrl: 'http://179.60.51.134:8888/NICK/index.m3u8' },
  { id: 'f04', name: 'Nick Jr.', streamUrl: 'http://179.60.51.134:8888/NICK-JR/index.m3u8' },
  { id: 'nv1', name: 'Novelas Turcas', streamUrl: 'https://amg00658-amg00658c102-canelatv-international-7231.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-novelasturcas-canelatvinternational/playlist.m3u8' },
  { id: 'nv2', name: 'Las Estrellas', streamUrl: 'http://bantel-cdn1.iptvperu.tv:1935/btnscrtn/Canal_Las_Estrellas.stream/playlist.m3u8' },
  { id: 'nv3', name: 'TL Novelas', streamUrl: 'http://bantel-cdn1.iptvperu.tv:1935/btnscrtn/TL_Novelas.stream/playlist.m3u8' },
  { id: 'f05', name: 'MTV', streamUrl: 'http://179.60.51.134:8888/MTV/index.m3u8' },
  { id: 'f06', name: 'Comedy Central', streamUrl: 'http://181.119.93.83:8000/play/a1di/index.m3u8' },

  // Cine & Documentales
  { id: 'f07', name: 'Star Channel', streamUrl: 'http://bantel-cdn1.iptvperu.tv:1935/btnscrtn/StarChannel.stream/playlist.m3u8', backups: ['http://179.60.51.134:8888/STAR-CHANNEL/index.m3u8', 'http://138.121.15.230:9002/STAR-CHANNEL/index.m3u8'] },
  { id: 'f12', name: 'AXN', streamUrl: 'http://177.234.249.178:8888/AXN/index.m3u8' },
  { id: 'f13', name: 'Cinecanal', streamUrl: 'http://138.121.15.230:9002/CINECANAL/index.m3u8', backups: ['http://179.60.51.134:8888/CINECANAL/index.m3u8'] },
  { id: 'f08', name: 'Studio Universal', streamUrl: 'http://138.121.15.230:9002/STUDIO-UNIVERSAL/index.m3u8' },
  { id: 'f09', name: 'Universal TV', streamUrl: 'http://138.121.15.230:9002/UNIVERSAL-CHANNEL/index.m3u8' },
  { id: 'f10', name: 'A&E', streamUrl: 'http://138.121.15.230:9002/A&E/index.m3u8' },
  { id: 'f11', name: 'History Channel', streamUrl: 'http://138.121.15.230:9002/HISTORY-CHANNEL/index.m3u8' },

  // Canales Premium
  { id: 'dp1', name: 'Fox Sports', streamUrl: 'https://jmp2.uk/plu-5a74b8e1e22a61737979c6bf.m3u8' },
  { id: 'dp2', name: 'Fox Sports 2', streamUrl: 'http://200.115.120.1:8000/play/ca044/index.m3u8' },
  { id: 'dp3', name: 'GolTV', streamUrl: 'http://179.60.51.134:8888/GOLTV/index.m3u8' },
  { id: 'dp4', name: 'TyC Sports', streamUrl: 'http://45.181.87.106/TYCSPORTSHD/index.m3u8' },
  { id: 'dp5', name: 'DSports 2', streamUrl: 'https://streamvidex.qzz.io/videx/dsports2/index.m3u8' },
  { id: 'dp6', name: 'Red Bull TV', streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8' },
  { id: 'cp1', name: 'TNT', streamUrl: 'http://179.60.51.134:8888/TNT/index.m3u8' },
  { id: 'cp2', name: 'TNT Series', streamUrl: 'http://138.121.15.230:9002/TNT-SERIES/index.m3u8' },
  { id: 'cp3', name: 'Space', streamUrl: 'http://179.60.51.134:8888/SPACE/index.m3u8' },
  { id: 'cp4', name: 'Cinemax', streamUrl: 'http://179.60.51.134:8888/CINEMAX/index.m3u8' },
  { id: 'cp5', name: 'Sony Channel', streamUrl: 'http://138.121.15.230:9002/SONY/index.m3u8' },
  { id: 'ki2', name: 'Cartoon Network', streamUrl: 'http://179.60.51.134:8888/CARTOON-NETWORK/index.m3u8' },
  { id: 'ki3', name: 'Discovery Kids', streamUrl: 'http://179.60.51.134:8888/DISCOVERY-KIDS/index.m3u8' },
  { id: 'dc1', name: 'National Geographic', streamUrl: 'http://138.121.15.230:9002/NAT-GEO/index.m3u8' },
  { id: 'dc2', name: 'Animal Planet', streamUrl: 'http://179.60.51.134:8888/ANIMAL-PLANET/index.m3u8' },
  { id: 'nw1', name: 'CNN en Español', streamUrl: 'http://179.60.51.134:8888/CNN/index.m3u8' },
  { id: 'nw2', name: 'Telemundo', streamUrl: 'http://138.121.15.230:9002/TELEMUNDO/index.m3u8' },
  { id: 'in1', name: 'Caracol TV', streamUrl: 'http://45.171.108.253:8888/CARACOL/index.m3u8' },
  { id: 'in2', name: 'RCN', streamUrl: 'http://138.121.15.230:9002/RCN/index.m3u8' },
  { id: 'in3', name: 'Telefe', streamUrl: 'http://45.134.141.161:2200/ARG/TELEFE_HD/index.m3u8' },
  { id: 'in4', name: 'El Trece', streamUrl: 'https://livetrx01.vodgc.net/eltrecetv/index.m3u8' },
  { id: 'in5', name: 'Azteca Internacional', streamUrl: 'https://azt-mun.otteravision.com/azt/mun/mun.m3u8' }
];

async function checkUrl(url, type) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return { ok: false, status: res.status };
    const text = await res.text();
    if (type === 'DASH') {
      return { ok: text.includes('<MPD') || text.includes('urn:mpeg:dash'), status: res.status };
    }
    return { ok: text.includes('#EXTM3U'), status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function audit() {
  const results = [];
  console.log(`Auditing ${channels.length} channels...`);

  for (const ch of channels) {
    const primary = await checkUrl(ch.streamUrl, ch.type);
    let workingUrl = primary.ok ? ch.streamUrl : null;
    let workingBackup = null;

    if (!workingUrl && ch.backups && ch.backups.length > 0) {
      for (const b of ch.backups) {
        const bRes = await checkUrl(b, ch.type);
        if (bRes.ok) {
          workingUrl = b;
          workingBackup = b;
          break;
        }
      }
    }

    results.push({
      id: ch.id,
      name: ch.name,
      primaryUrl: ch.streamUrl,
      primaryOk: primary.ok,
      primaryError: primary.error || (primary.ok ? 'OK' : `HTTP ${primary.status}`),
      workingUrl: workingUrl,
      workingBackup: workingBackup,
      hasBackups: !!(ch.backups && ch.backups.length > 0)
    });
  }

  console.log('\n--- AUDIT RESULTS JSON ---');
  console.log(JSON.stringify(results, null, 2));
}

audit();

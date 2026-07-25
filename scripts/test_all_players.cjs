const testCases = [
  // 1. HLS Channels
  { name: 'Ecuavisa (HLS)', type: 'HLS', url: 'https://dai.google.com/linear/hls/event/GyPkTVDZSXGhpOvxPK7m2g/master.m3u8' },
  { name: 'Teleamazonas (HLS)', type: 'HLS', url: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8' },
  { name: 'Oromar TV (HLS)', type: 'HLS', url: 'https://stream.oromar.tv/hls/oromartv_hi/index.m3u8' },
  { name: 'TVC (HLS)', type: 'HLS', url: 'https://library-getafix.fireclip.tv/56e2d24bfdcf13ab4a321867/live/live_1.m3u8' },
  { name: 'La 1 España (HLS)', type: 'HLS', url: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8' },
  { name: 'ESPN 1 (HLS)', type: 'HLS', url: 'http://200.115.120.1:8000/play/ca040/index.m3u8' },
  { name: 'Canela Kids (HLS)', type: 'HLS', url: 'https://amg00658-amg00658c47-canelatv-international-7222.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-canelakids-canelatvinternational/playlist.m3u8' },

  // 2. DASH DRM Channels
  { name: 'DSports DirecTV (DASH MPD)', type: 'DASH', url: 'https://otte-qw.live.pv-cdn.net/pdx-nitro/live/clients/dash/enc/3gg2jnixjn/out/v1/e1840e01f3f14563b66bbb944d5cc54c/cenc.mpd' },

  // 3. Web Embed Resolvers
  { name: 'RTS (Ecuaplay Resolver)', type: 'RESOLVER', url: 'https://novastream-resolver.vercel.app/api/resolve?url=https://www.ecuaplay.online/rts.html&type=ecuaplay' }
];

async function runAudit() {
  console.log('=== AUDITORÍA COMPLETA DE REPRODUCTORES DE TV EN VIVO ===\n');

  for (const tc of testCases) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(tc.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: controller.signal
      });
      clearTimeout(timeout);

      const text = await res.text();
      let statusStr = 'OK';
      let details = '';

      if (tc.type === 'HLS') {
        const isM3U8 = text.includes('#EXTM3U');
        statusStr = isM3U8 ? '✅ OPERATIVO (M3U8)' : '❌ ERROR MANIFIESTO';
        details = text.slice(0, 60).replace(/\n/g, ' ');
      } else if (tc.type === 'DASH') {
        const isMPD = text.includes('<MPD') || text.includes('urn:mpeg:dash');
        statusStr = isMPD ? '✅ OPERATIVO (DASH MPD)' : '❌ ERROR MPD';
        details = text.slice(0, 60).replace(/\n/g, ' ');
      } else if (tc.type === 'RESOLVER') {
        try {
          const json = JSON.parse(text);
          statusStr = json.streamUrl ? '✅ OPERATIVO (RESOLVED)' : '❌ FALLÓ RESOLVER';
          details = json.streamUrl || text;
        } catch(e) {
          statusStr = '❌ RESPUESTA NO JSON';
          details = text.slice(0, 60);
        }
      }

      console.log(`[${statusStr}] ${tc.name}\n  Detalle: ${details}\n`);
    } catch (err) {
      console.log(`[❌ ERROR CONEXIÓN] ${tc.name}: ${err.message}\n`);
    }
  }
}

runAudit();

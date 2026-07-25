const paths = [
  'UNIVERSAL/index.m3u8',
  'UNIVERSAL-CHANNEL/index.m3u8',
  'UNIVERSAL-TV/index.m3u8',
  'TNT/index.m3u8',
  'TNT-SERIES/index.m3u8',
  'TNT-NOVELAS/index.m3u8',
  'CINECANAL/index.m3u8',
  'STUDIO-UNIVERSAL/index.m3u8',
  'STAR-CHANNEL/index.m3u8',
  'SPACE/index.m3u8',
  'CINEMAX/index.m3u8',
  'SONY/index.m3u8',
  'WARNER/index.m3u8',
  'AXN/index.m3u8'
];

async function scanServers() {
  const hosts = ['http://138.121.15.230:9002/', 'http://179.60.51.134:8888/'];
  for (const h of hosts) {
    console.log(`\nTesting host ${h}...`);
    for (const p of paths) {
      try {
        const res = await fetch(h + p);
        if (res.ok) {
          console.log(`[OK 200] ${h}${p}`);
        }
      } catch(e) {}
    }
  }
}

scanServers();

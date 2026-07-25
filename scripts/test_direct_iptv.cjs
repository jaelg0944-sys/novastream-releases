const streams = [
  { name: 'Golden 138', url: 'http://138.121.15.230:9002/GOLDEN/index.m3u8' },
  { name: 'Golden 179', url: 'http://179.60.51.134:8888/GOLDEN/index.m3u8' },
  { name: 'FX 138', url: 'http://138.121.15.230:9002/FX/index.m3u8' },
  { name: 'FX 179', url: 'http://179.60.51.134:8888/FX/index.m3u8' },
  { name: 'Universal Premiere 138', url: 'http://138.121.15.230:9002/UNIVERSAL-PREMIERE/index.m3u8' },
  { name: 'Universal Premiere 179', url: 'http://179.60.51.134:8888/UNIVERSAL-PREMIERE/index.m3u8' }
];

async function testStreams() {
  for (const s of streams) {
    try {
      const res = await fetch(s.url);
      console.log(`${s.name}: Status ${res.status}`);
    } catch(e) {
      console.log(`${s.name}: Error ${e.message}`);
    }
  }
}

testStreams();

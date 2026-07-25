

const candidates = [
  // ESPN HTTPS candidates
  { name: 'ESPN HTTPS 1', url: 'https://streamvidex.qzz.io/videx/espn1/index.m3u8' },
  { name: 'ESPN HTTPS 2', url: 'https://jmp2.uk/plu-5a74b8e1e22a61737979c6b8.m3u8' },
  { name: 'ESPN 2 HTTPS 1', url: 'https://streamvidex.qzz.io/videx/espn2/index.m3u8' },
  { name: 'ESPN 3 HTTPS 1', url: 'https://streamvidex.qzz.io/videx/espn3/index.m3u8' },
  
  // Fox Sports HTTPS candidates
  { name: 'Fox Sports 1 HTTPS', url: 'https://streamvidex.qzz.io/videx/fox1/index.m3u8' },
  { name: 'Fox Sports 2 HTTPS', url: 'https://streamvidex.qzz.io/videx/fox2/index.m3u8' },

  // Disney / Cartoon / TNT HTTPS candidates
  { name: 'Disney Channel HTTPS', url: 'https://streamvidex.qzz.io/videx/disney/index.m3u8' },
  { name: 'Cartoon Network HTTPS', url: 'https://streamvidex.qzz.io/videx/cn/index.m3u8' },
  { name: 'TNT HTTPS', url: 'https://streamvidex.qzz.io/videx/tnt/index.m3u8' },

  // IPTV org candidates
  { name: 'Ecuavisa Official', url: 'https://dai.google.com/linear/hls/event/GyPkTVDZSXGhpOvxPK7m2g/master.m3u8' },
  { name: 'Teleamazonas Official', url: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8' },
];

async function testAll() {
  console.log('Testing HTTPS stream candidates...\n');
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      const isM3U8 = text.includes('#EXTM3U');
      console.log(`[${isM3U8 ? 'VALID HTTPS M3U8' : 'FAIL ' + res.status}] ${c.name}: ${c.url}`);
    } catch(e) {
      console.log(`[ERR] ${c.name}: ${e.message}`);
    }
  }
}

testAll();

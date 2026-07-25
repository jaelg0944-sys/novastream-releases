const list = [
  'https://streamvidex.qzz.io/videx/espn1/index.m3u8',
  'https://streamvidex.qzz.io/videx/espn2/index.m3u8',
  'https://streamvidex.qzz.io/videx/espn3/index.m3u8',
  'https://streamvidex.qzz.io/videx/espne/index.m3u8',
  'https://streamvidex.qzz.io/videx/espn4/index.m3u8',
  'https://streamvidex.qzz.io/videx/fox1/index.m3u8',
  'https://streamvidex.qzz.io/videx/fox2/index.m3u8',
  'https://streamvidex.qzz.io/videx/fox3/index.m3u8',
  'https://streamvidex.qzz.io/videx/dsports/index.m3u8',
  'https://streamvidex.qzz.io/videx/dsports2/index.m3u8',
  'https://streamvidex.qzz.io/videx/dsports+/index.m3u8',
  'https://streamvidex.qzz.io/videx/tnt/index.m3u8',
  'https://streamvidex.qzz.io/videx/starchannel/index.m3u8'
];

async function run() {
  for (const url of list) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log(`[${text.includes('#EXTM3U') ? 'VALID M3U8' : 'FAIL ' + res.status}] ${url}`);
    } catch(e) {
      console.log(`[ERR] ${url}: ${e.message}`);
    }
  }
}
run();

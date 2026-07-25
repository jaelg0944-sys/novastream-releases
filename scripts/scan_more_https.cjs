const names = [
  'foxsports', 'foxsports2', 'foxsports3', 'fox1', 'fox2', 'fox3', 'fox',
  'goltv', 'goltv-ecuador', 'space', 'space-latam', 'cinemax', 'star', 'starchannel',
  'caracol', 'rcn', 'disney', 'disneychannel', 'nick', 'nickelodeon', 'cartoon', 'cartoonnetwork',
  'hbo', 'hbomax', 'max', 'univision', 'telemundo'
];

async function run() {
  for (const n of names) {
    const urls = [
      `https://streamvidex.qzz.io/videx/${n}/index.m3u8`,
      `https://streamvidex.qzz.io/live/${n}/index.m3u8`,
      `https://streamvidex.qzz.io/hls/${n}/index.m3u8`
    ];
    for (const u of urls) {
      try {
        const res = await fetch(u);
        const text = await res.text();
        if (text.includes('#EXTM3U')) {
          console.log(`[VALID HTTPS M3U8] ${n} -> ${u}`);
        }
      } catch(e) {}
    }
  }
}

run();

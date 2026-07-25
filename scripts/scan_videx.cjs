const names = [
  'espn', 'espn1', 'espn-1', 'espnar', 'espn-ar', 'espncol', 'espn-col', 'espnperu', 'espn-peru',
  'foxsports', 'foxsports1', 'foxsports2', 'foxsports3', 'foxsportsar', 'fox-sports-1',
  'tnt', 'tntsports', 'tnt-sports', 'space', 'cinemax', 'star', 'star-channel',
  'caracol', 'rcn', 'telefe', 'eltrece', 'azteca', 'goltv', 'tyc', 'tycsports'
];

async function check() {
  for (const n of names) {
    const url = `https://streamvidex.qzz.io/videx/${n}/index.m3u8`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (text.includes('#EXTM3U')) {
        console.log(`[VALID M3U8] ${n} -> ${url}`);
      }
    } catch(e) {}
  }
}
check();

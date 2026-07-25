async function testAnimeFlv() {
  const sites = [
    'https://animeflv.net/browse?genre[]=latino',
    'https://jkanime.net/',
    'https://animeonline.ninja/'
  ];

  for (const site of sites) {
    console.log('Testing:', site);
    try {
      const res = await fetch(site, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log(`[Status ${res.status}] ${site}`);
      const text = await res.text();
      if (res.status === 200) {
        console.log(`[SUCCESS] ${site} HTML length: ${text.length}`);
      }
    } catch(e) {
      console.log(`[ERR] ${site}: ${e.message}`);
    }
  }
}

testAnimeFlv();

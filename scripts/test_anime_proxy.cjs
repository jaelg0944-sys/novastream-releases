async function testBypass() {
  const animeUrl = 'https://ww3.animeonline.ninja/genero/audio-latino/';
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(animeUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(animeUrl)}`,
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(animeUrl)}`
  ];

  for (let i = 0; i < proxies.length; i++) {
    console.log(`Testing Proxy ${i+1}: ${proxies[i]}`);
    try {
      const res = await fetch(proxies[i]);
      const html = await res.text();
      console.log(`Proxy ${i+1} Status:`, res.status, 'HTML length:', html.length);
      if (html.includes('Just a moment')) {
        console.log(`Proxy ${i+1}: Blocked by Cloudflare.`);
      } else {
        console.log(`Proxy ${i+1} SUCCESS! First 500 chars:\n`, html.slice(0, 500));
        // Match anime titles
        const matches = [...html.matchAll(/<article[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)="([^"]+)"[\s\S]*?alt="([^"]+)"/gi)];
        console.log(`Proxy ${i+1} Anime Matches:`, matches.length);
        if (matches.length > 0) {
          console.log('Sample anime match:', matches[0][1], matches[0][2], matches[0][3]);
        }
      }
    } catch(e) {
      console.error(`Proxy ${i+1} Error:`, e.message);
    }
  }
}

testBypass();

async function testJkAnime() {
  const res = await fetch('https://jkanime.net/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('JKAnime HTML snippet:\n', html.slice(0, 1500));
  
  // Match anime cards on JKAnime
  const matches = [...html.matchAll(/<a[^>]+href="(https:\/\/jkanime\.net\/[^"]+\/)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<h3>([^<]+)<\/h3>/gi)];
  console.log('\nFound JKAnime matches:', matches.length);
  matches.slice(0, 5).forEach(m => {
    console.log(`- ${m[3].trim()}: ${m[1]} (Image: ${m[2]})`);
  });
}
testJkAnime();

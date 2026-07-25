async function testEpisodeServers() {
  const url = 'https://jkanime.net/dragon-ball-super/1/';
  console.log('Testing episode page:', url);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    console.log('Episode HTML length:', html.length);
    
    // Look for video server iframes or video players in HTML
    const iframes = [...html.matchAll(/<iframe[^>]+src="([^"]+)"/gi)];
    console.log('Iframes found:', iframes.length);
    iframes.forEach((f, i) => console.log(`  Iframe ${i+1}:`, f[1]));
    
    // Look for video server script variables
    const scripts = [...html.matchAll(/video\[\d+\]\s*=\s*'([^']+)'/gi)];
    console.log('Video scripts found:', scripts.length);
    scripts.forEach((s, i) => console.log(`  Server ${i+1}:`, s[1]));
  } catch(e) {
    console.error('Error:', e.message);
  }
}
testEpisodeServers();

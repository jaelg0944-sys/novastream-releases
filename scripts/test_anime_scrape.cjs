

async function testAnimeScrape() {
  const url = 'https://ww3.animeonline.ninja/genero/audio-latino/page/1/';
  console.log('Fetching animeonline.ninja page 1...');
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    console.log('HTTP Status:', res.status);
    const html = await res.text();
    console.log('HTML Length:', html.length);
    
    // Look for post cards or anime list items
    const matches = [...html.matchAll(/<article[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)="([^"]+)"[\s\S]*?alt="([^"]+)"[\s\S]*?<\/article>/gi)];
    console.log('Matches found (Pattern 1):', matches.length);
    
    if (matches.length > 0) {
      console.log('Sample 1:', matches[0][1], matches[0][2], matches[0][3]);
    } else {
      // Print first 2000 chars of HTML to inspect structure
      console.log('Sample HTML snippet:\n', html.slice(0, 2000));
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testAnimeScrape();

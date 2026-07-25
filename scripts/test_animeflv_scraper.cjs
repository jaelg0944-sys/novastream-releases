async function parseAnimeFlv() {
  const url = 'https://animeflv.net/browse?genre[]=latino';
  console.log('Parsing AnimeFLV Latino page...');
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const html = await res.text();
    
    // Match AnimeFLV catalog items: <article class="Anime alt B">...<a href="/anime/...">...<img src="...">...<h3 class="Title">...</h3>
    const matches = [...html.matchAll(/<article[^>]*class="Anime[^"]*"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)="([^"]+)"[\s\S]*?<h3[^>]*class="Title"[^>]*>([^<]+)<\/h3>/gi)];
    
    console.log(`Found ${matches.length} Latino Animes on AnimeFLV:`);
    matches.forEach(m => {
      console.log(`- Title: ${m[3].trim()}`);
      console.log(`  Url: https://animeflv.net${m[1]}`);
      console.log(`  Cover: ${m[2]}`);
    });

    if (matches.length > 0) {
      // Test fetching episode list & servers for the first anime!
      const animePageUrl = `https://animeflv.net${matches[0][1]}`;
      console.log(`\nFetching episode list & servers for: ${animePageUrl}`);
      const animeRes = await fetch(animePageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const animeHtml = await animeRes.text();
      
      // AnimeFLV stores episodes and servers in inline JS variables `episodes = [...]` and `servers = [...]`
      const epMatch = animeHtml.match(/var episodes = (\[.*?\]);/s);
      const servMatch = animeHtml.match(/var servers = (\[.*?\]);/s);
      
      if (epMatch) console.log('Episodes JS array length:', JSON.parse(epMatch[1]).length);
      if (servMatch) console.log('Servers JS array snippet:', servMatch[1].slice(0, 300));
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
}

parseAnimeFlv();

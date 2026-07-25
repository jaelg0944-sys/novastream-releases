const { LATINO_ANIMES } = require('../src/services/animeService.js');

async function fixPosters() {
  const fixed = [];
  for (const item of LATINO_ANIMES) {
    try {
      // Query TMDB or Jikan API
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(item.slug.replace(/-/g, ' '))}&limit=1`);
      const data = await res.json();
      if (data.data && data.data[0] && data.data[0].images && data.data[0].images.jpg) {
        const img = data.data[0].images.jpg.large_image_url || data.data[0].images.jpg.image_url;
        fixed.push({ ...item, poster: img });
        console.log(`[FIXED] ${item.title} -> ${img}`);
      } else {
        fixed.push(item);
        console.log(`[KEEP] ${item.title}`);
      }
    } catch(e) {
      console.log(`[ERR] ${item.title}: ${e.message}`);
      fixed.push(item);
    }
    await new Promise(r => setTimeout(r, 800)); // Rate limit Jikan API
  }

  console.log('\n--- VERIFYING ALL FIXED POSTERS ---');
  for (const f of fixed) {
    const res = await fetch(f.poster);
    console.log(`[${res.status}] ${f.title} -> ${f.poster}`);
  }
}

fixPosters();

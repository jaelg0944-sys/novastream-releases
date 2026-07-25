const { LATINO_ANIMES } = require('../src/services/animeService.js');

async function testAnimePosters() {
  console.log(`Testing ${LATINO_ANIMES.length} anime posters...`);
  for (const item of LATINO_ANIMES) {
    try {
      const res = await fetch(item.poster, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${res.status}] ${item.title} -> ${item.poster}`);
    } catch(e) {
      console.log(`[ERROR] ${item.title} -> ${e.message}`);
    }
  }
}

testAnimePosters();

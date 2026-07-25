const { LATINO_ANIMES } = require('../src/services/animeService.js');

async function getAniListPosters() {
  const fixed = [];
  const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
          large
        }
      }
    }
  `;

  for (const item of LATINO_ANIMES) {
    const searchTerm = item.title.replace(/\(Latino\)|\(Audio Latino\)|Serie Original|\/ Attack on Titan/gi, '').trim();
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { search: searchTerm } })
      });
      const data = await res.json();
      if (data.data && data.data.Media && data.data.Media.coverImage) {
        const poster = data.data.Media.coverImage.extraLarge || data.data.Media.coverImage.large;
        fixed.push({ ...item, poster });
        console.log(`[OK] ${item.title} -> ${poster}`);
      } else {
        fixed.push(item);
        console.log(`[NOT FOUND] ${item.title}`);
      }
    } catch(e) {
      console.log(`[ERR] ${item.title}: ${e.message}`);
      fixed.push(item);
    }
  }

  console.log('\n--- VERIFYING ALL ANILIST POSTERS ---');
  for (const f of fixed) {
    const check = await fetch(f.poster);
    console.log(`[${check.status}] ${f.title} -> ${f.poster}`);
  }

  console.log('\n--- FULL ARRAY CODE FOR animeService.js ---');
  console.log(JSON.stringify(fixed, null, 2));
}

getAniListPosters();

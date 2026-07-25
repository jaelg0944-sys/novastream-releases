const extraAnimes = [
  'Dragon Ball',
  'Naruto',
  'Tokyo Ghoul',
  'Black Clover',
  'One Punch Man',
  'Spy x Family',
  'Fullmetal Alchemist Brotherhood',
  'Overlord',
  'Boruto',
  'Inuyasha',
  'Digimon Adventure',
  'Ranma 1/2'
];

async function fetchExtra() {
  const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          extraLarge
        }
        averageScore
        startDate { year }
        episodes
        genres
      }
    }
  `;

  const results = [];
  for (const title of extraAnimes) {
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { search: title } })
      });
      const data = await res.json();
      if (data.data && data.data.Media) {
        const m = data.data.Media;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        results.push({
          id: slug,
          slug: slug,
          title: `${title} (Latino)`,
          poster: m.coverImage.extraLarge,
          synopsis: m.description ? m.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : 'Anime popular en Audio Latino.',
          rating: m.averageScore ? (m.averageScore / 10).toFixed(1) : '9.0',
          year: m.startDate && m.startDate.year ? m.startDate.year.toString() : '2020',
          episodesCount: m.episodes || 24,
          genre: m.genres ? m.genres.slice(0, 3).join(', ') : 'Anime',
          audio: 'Español Latino',
          type: 'tv'
        });
      }
    } catch(e) {}
  }

  console.log(JSON.stringify(results, null, 2));
}

fetchExtra();

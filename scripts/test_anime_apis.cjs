async function testAnimeApis() {
  console.log('Testing Jikan API (Anime)...');
  try {
    const res = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
    const data = await res.json();
    console.log('Jikan API Top Anime count:', data.data ? data.data.length : 0);
    if (data.data && data.data.length > 0) {
      console.log('Sample anime from Jikan:', data.data[0].title, data.data[0].images.jpg.image_url);
    }
  } catch(e) {
    console.error('Jikan error:', e.message);
  }

  console.log('\nTesting Consumet Anime API...');
  try {
    const res = await fetch('https://api.consumet.org/anime/gogoanime/top-airing');
    const data = await res.json();
    console.log('Consumet API Top Airing count:', data.results ? data.results.length : 0);
    if (data.results && data.results.length > 0) {
      console.log('Sample anime from Consumet:', data.results[0].title, data.results[0].image);
    }
  } catch(e) {
    console.error('Consumet error:', e.message);
  }
}

testAnimeApis();

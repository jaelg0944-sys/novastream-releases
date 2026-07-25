async function testApiAnime() {
  const testUrl = 'https://novastream-resolver.vercel.app/api/anime?slug=dragon-ball-super&episode=1&nume=1';
  console.log('Testing Anime Resolver API:', testUrl);
  try {
    const res = await fetch(testUrl);
    const data = await res.json();
    console.log('Response:\n', JSON.stringify(data, null, 2));
  } catch(e) {
    console.error('Error:', e.message);
  }
}
testApiAnime();

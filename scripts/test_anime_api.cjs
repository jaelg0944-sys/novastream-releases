async function testAnimeApi() {
  const url = 'https://novastream-resolver.vercel.app/api/anime?slug=dragon-ball-super&episode=1&nume=1';
  console.log('Testing:', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('API Response:', data);
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testAnimeApi();

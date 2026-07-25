async function testFreshGambetaToken() {
  try {
    const res = await fetch('https://gambeta.vip/api/k.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://gambeta.vip/'
      }
    });
    console.log(`k.php Status: ${res.status}`);
    const token = (await res.text()).trim();
    console.log(`Fresh Token: ${token}`);

    const m3u8Url = `https://cdn.gambeta.vip/xt/6806.m3u8?k=${encodeURIComponent(token)}`;
    const m3u8Res = await fetch(m3u8Url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://gambeta.vip/'
      }
    });
    console.log(`M3U8 Status: ${m3u8Res.status}`);
    const body = await m3u8Res.text();
    console.log(`M3U8 Body:\n${body.substring(0, 300)}`);
  } catch(e) {
    console.log(`Error: ${e.message}`);
  }
}

testFreshGambetaToken();

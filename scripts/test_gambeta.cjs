async function testGambetaToken() {
  console.log('Testing Gambeta token fetch...');
  try {
    const res = await fetch('https://gambeta.vip/api/k.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://gambeta.vip/canal/studio-universal'
      }
    });
    console.log('Status:', res.status);
    const token = (await res.text()).trim();
    console.log('Token received:', token);
    
    if (token) {
      const channelRef = '6806'; // Studio Universal
      const m3u8Url = `https://cdn.gambeta.vip/xt/${channelRef}.m3u8?k=${encodeURIComponent(token)}`;
      console.log('Testing M3U8 URL:', m3u8Url);
      
      const m3u8Res = await fetch(m3u8Url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://gambeta.vip/'
        }
      });
      console.log('M3U8 Status:', m3u8Res.status);
      const m3u8Text = await m3u8Res.text();
      console.log('M3U8 Sample content:\n', m3u8Text.slice(0, 500));
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testGambetaToken();

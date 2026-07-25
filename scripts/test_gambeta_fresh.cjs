async function testFreshSegment() {
  // 1. Get fresh token
  const tokenRes = await fetch('https://gambeta.vip/api/k.php', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': 'https://gambeta.vip/canal/studio-universal' }
  });
  const token = (await tokenRes.text()).trim();
  console.log('Fresh token:', token);

  // 2. Fetch M3U8
  const m3u8Url = `https://cdn.gambeta.vip/xt/6806.m3u8?k=${token}`;
  const m3u8Res = await fetch(m3u8Url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': 'https://gambeta.vip/' }
  });
  const text = await m3u8Res.text();
  const segmentLine = text.split('\n').find(line => line.startsWith('/s?'));
  console.log('Segment line:', segmentLine);

  if (segmentLine) {
    const fullSegUrl = `https://cdn.gambeta.vip${segmentLine}`;
    console.log('Fetching Segment with Referer https://gambeta.vip/...');
    const segRes = await fetch(fullSegUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://gambeta.vip/',
        'Origin': 'https://gambeta.vip'
      }
    });
    console.log('Segment HTTP status:', segRes.status);
    console.log('Segment Content-Type:', segRes.headers.get('content-type'));
    console.log('Segment Content-Length:', segRes.headers.get('content-length'));
  }
}

testFreshSegment();

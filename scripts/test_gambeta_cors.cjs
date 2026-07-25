async function testSegmentFetch() {
  const token = '0fc7bea92b57da3fca41e955';
  const m3u8Url = `https://cdn.gambeta.vip/xt/6806.m3u8?k=${token}`;
  const m3u8Res = await fetch(m3u8Url);
  const text = await m3u8Res.text();
  const segmentPath = text.split('\n').find(line => line.startsWith('/s?'));
  
  if (segmentPath) {
    const fullSegUrl = `https://cdn.gambeta.vip${segmentPath}`;
    console.log('Testing segment URL:', fullSegUrl);
    const segRes = await fetch(fullSegUrl, {
      headers: {
        'Origin': 'https://novastreamtv-plum.vercel.app',
        'Referer': 'https://gambeta.vip/'
      }
    });
    console.log('Segment HTTP status:', segRes.status);
    console.log('CORS Header Access-Control-Allow-Origin:', segRes.headers.get('access-control-allow-origin'));
  }
}

testSegmentFetch();

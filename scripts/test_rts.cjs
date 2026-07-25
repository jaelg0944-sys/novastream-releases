async function testRTS() {
  const urls = [
    'http://179.60.51.134:8888/RTS/index.m3u8',
    'http://200.115.120.1:8000/play/ca043/index.m3u8',
    'https://d2w3o8zn50cs1k.cloudfront.net/ts:abr.m3u8'
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u);
      const text = await res.text();
      console.log(`[${text.includes('#EXTM3U') ? 'OK' : 'FAIL ' + res.status}] RTS candidate: ${u}`);
    } catch(e) {
      console.log(`[ERR] ${u}: ${e.message}`);
    }
  }
}
testRTS();

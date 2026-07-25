const testUrls = [
  'http://179.60.51.134:8888/FOX-SPORTS-2/index.m3u8',
  'http://138.121.15.230:9002/FOX-SPORTS-2/index.m3u8',
  'http://200.115.120.1:8000/play/ca044/index.m3u8',
  'https://jmp2.uk/plu-5a74b8e1e22a61737979c6c0.m3u8'
];

async function run() {
  for (const url of testUrls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      console.log(`[${text.includes('#EXTM3U') ? 'OK' : 'FAIL ' + res.status}] ${url}`);
    } catch(e) {
      console.log(`[ERR] ${url}: ${e.message}`);
    }
  }
}

run();

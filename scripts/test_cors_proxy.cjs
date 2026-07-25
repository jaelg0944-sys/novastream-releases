async function testCorsProxy() {
  const httpUrl = 'http://200.115.120.1:8000/play/ca040/index.m3u8';
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(httpUrl)}`,
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(httpUrl)}`
  ];

  for (const p of proxies) {
    try {
      const res = await fetch(p);
      const text = await res.text();
      console.log(`[${res.status}] ${p.slice(0, 35)}... -> ${text.slice(0, 60).replace(/\n/g, ' ')}`);
    } catch (e) {
      console.log(`[ERR] ${p.slice(0, 35)}... -> ${e.message}`);
    }
  }
}

testCorsProxy();

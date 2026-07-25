const fs = require('fs');

async function analyzeHar() {
  const path = 'C:\\Users\\Geo\\Desktop\\gambeta.vip joder.har';
  console.log('Reading HAR file...');
  const content = fs.readFileSync(path, 'utf8');
  console.log(`HAR file size: ${content.length} chars`);

  const har = JSON.parse(content);
  const entries = har.log ? har.log.entries : [];
  console.log(`Total HTTP entries in HAR: ${entries.length}`);

  const endpoints = new Set();
  const m3u8Urls = [];
  const apiCalls = [];
  const keyCalls = [];

  for (const entry of entries) {
    const url = entry.request.url;
    endpoints.add(new URL(url).pathname);

    if (url.includes('.m3u8')) {
      m3u8Urls.push({
        url,
        status: entry.response.status,
        headers: entry.request.headers.map(h => `${h.name}: ${h.value}`)
      });
    }

    if (url.includes('/api/')) {
      apiCalls.push({
        url,
        method: entry.request.method,
        status: entry.response.status,
        responseSample: entry.response.content ? (entry.response.content.text || '').substring(0, 150) : ''
      });
    }

    if (url.includes('k.php') || url.includes('token') || url.includes('key')) {
      keyCalls.push({
        url,
        status: entry.response.status,
        response: entry.response.content ? (entry.response.content.text || '').substring(0, 150) : ''
      });
    }
  }

  console.log('\n--- API Calls found ---');
  console.log(apiCalls.slice(0, 25));

  console.log('\n--- Token / Key Calls found ---');
  console.log(keyCalls.slice(0, 20));

  console.log('\n--- M3U8 Stream URLs found ---');
  console.log(m3u8Urls.slice(0, 20));
}

analyzeHar();

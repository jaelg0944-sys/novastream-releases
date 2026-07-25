async function testApiIptv() {
  console.log('Fetching https://novastream-resolver.vercel.app/api/iptv ...');
  try {
    const res = await fetch('https://novastream-resolver.vercel.app/api/iptv');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Channel count returned by API:', data.length);
    console.log('Channel names returned:');
    data.forEach((c, idx) => console.log(`${idx + 1}. [${c.category}] ${c.name} (${c.streamUrl})`));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testApiIptv();

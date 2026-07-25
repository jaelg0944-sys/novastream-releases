async function testGambetaToken() {
  const url = 'https://novastream-resolver.vercel.app/api/proxy?url=' + encodeURIComponent('https://cdn.gambeta.vip/xt/6806.m3u8?k=131eab73663cd50b62896aca');
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Body excerpt:\n${text.substring(0, 300)}`);
  } catch(e) {
    console.log(`Error: ${e.message}`);
  }
}

testGambetaToken();

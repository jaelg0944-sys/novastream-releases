async function testStudioUniversalDirect() {
  const url = 'http://138.121.15.230:9002/STUDIO-UNIVERSAL/index.m3u8';
  try {
    const res = await fetch(url);
    console.log(`Direct Studio Universal Status: ${res.status}`);
    const text = await res.text();
    console.log(`Body excerpt:\n${text.substring(0, 300)}`);
  } catch(e) {
    console.log(`Error: ${e.message}`);
  }
}

testStudioUniversalDirect();

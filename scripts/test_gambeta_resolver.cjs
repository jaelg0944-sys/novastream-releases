async function testGambetaResolver() {
  const url = 'https://novastream-resolver.vercel.app/api/gambeta?ref=6806';
  try {
    const res = await fetch(url);
    console.log(`Resolver Status: ${res.status}`);
    const text = await res.text();
    console.log(`Resolver Body excerpt:\n${text.substring(0, 300)}`);
  } catch(e) {
    console.log(`Resolver Error: ${e.message}`);
  }
}

testGambetaResolver();

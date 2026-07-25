async function discoverGambetaChannels() {
  console.log('Discovering Gambeta channels...');
  const tokenRes = await fetch('https://gambeta.vip/api/k.php', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': 'https://gambeta.vip/' }
  });
  const token = (await tokenRes.text()).trim();
  console.log('Token:', token);

  const knownRefs = [
    { ref: '6806', name: 'Studio Universal' },
    { ref: '122', name: 'Star Channel' },
    { ref: '6558', name: 'Cinemax' },
    { ref: '119', name: 'Cinecanal' },
    { ref: '139', name: 'Space' },
    { ref: '121', name: 'Sony Channel' },
    { ref: '120', name: 'FX' },
    { ref: '146', name: 'TNT Series' },
    { ref: '106', name: 'TNT Novelas' },
    { ref: '7397', name: 'Warner Channel' },
    { ref: '126', name: 'Universal Premiere' },
    { ref: '6781', name: 'Golden' },
    { ref: '145', name: 'TNT' }
  ];

  for (const ch of knownRefs) {
    const url = `https://cdn.gambeta.vip/xt/${ch.ref}.m3u8?k=${token}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://gambeta.vip/' }
      });
      console.log(`Ref ${ch.ref} (${ch.name}): HTTP ${res.status}`);
    } catch(e) {
      console.log(`Ref ${ch.ref} (${ch.name}): Error ${e.message}`);
    }
  }
}

discoverGambetaChannels();

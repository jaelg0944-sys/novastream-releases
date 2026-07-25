const testDirectLogos = [
  { name: 'Star Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Star_Channel_2020.svg' },
  { name: 'Cinecanal', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/CinecanalLA.png' },
  { name: 'Studio Universal', url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/StudioUniversal2016.png' },
  { name: 'Universal TV', url: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Universal_TV_logo.svg' },
  { name: 'AXN', url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/AXN_logo_%282015%29.svg' },
  { name: 'Universal Premiere', url: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Universal_TV_logo.svg' },
  { name: 'Golden', url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Golden_logo.svg' },
  { name: 'Warner Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Warner_Channel_2017.svg' },
  { name: 'FX', url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/FX_Logo.svg' },
  { name: 'TNT', url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/TNT_Logo_2016.svg' },
  { name: 'Space', url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Space_%28Latin_American_TV_channel%29_Logo.svg' },
  { name: 'Cinemax', url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Cinemax_%28Yellow%29.svg' },
  { name: 'Sony Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Sony_Channel_2021.svg' }
];

async function runDirectTest() {
  for (const l of testDirectLogos) {
    try {
      const res = await fetch(l.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      console.log(`${l.name}: HTTP ${res.status}`);
    } catch(e) {
      console.log(`${l.name}: Error ${e.message}`);
    }
  }
}

runDirectTest();

const testLogos = [
  { name: 'Star Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Star_Channel_2020.svg/512px-Star_Channel_2020.svg.png' },
  { name: 'Cinecanal', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/CinecanalLA.png/512px-CinecanalLA.png' },
  { name: 'Studio Universal', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/StudioUniversal2016.png/512px-StudioUniversal2016.png' },
  { name: 'Universal TV', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Universal_TV_logo.svg/512px-Universal_TV_logo.svg.png' },
  { name: 'AXN', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/512px-AXN_logo_%282015%29.svg.png' },
  { name: 'Golden', url: 'https://i.imgur.com/E84jnP8.png' },
  { name: 'Warner Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Warner_Channel_2017.svg/512px-Warner_Channel_2017.svg.png' },
  { name: 'FX', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/FX_Logo.svg/512px-FX_Logo.svg.png' },
  { name: 'TNT', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/TNT_Logo_2016.svg/512px-TNT_Logo_2016.svg.png' },
  { name: 'Space', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Space_%28Latin_American_TV_channel%29_Logo.svg/512px-Space_%28Latin_American_TV_channel%29_Logo.svg.png' },
  { name: 'Cinemax', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Cinemax_%28Yellow%29.svg/512px-Cinemax_%28Yellow%29.svg.png' },
  { name: 'Sony Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sony_Channel_2021.svg/512px-Sony_Channel_2021.svg.png' }
];

async function runTest() {
  for (const l of testLogos) {
    try {
      const res = await fetch(l.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      console.log(`${l.name}: HTTP ${res.status}`);
    } catch(e) {
      console.log(`${l.name}: Error ${e.message}`);
    }
  }
}

runTest();

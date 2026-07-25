const logos = [
  { name: 'Star Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Star_Channel_2020.svg/512px-Star_Channel_2020.svg.png' },
  { name: 'Cinecanal', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/CinecanalLA.png/512px-CinecanalLA.png' },
  { name: 'Studio Universal', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/StudioUniversal2016.png/512px-StudioUniversal2016.png' },
  { name: 'Universal TV', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Universal_TV_logo.svg/512px-Universal_TV_logo.svg.png' },
  { name: 'AXN', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AXN_logo_%282015%29.svg/512px-AXN_logo_%282015%29.svg.png' },
  { name: 'Universal Premiere', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Universal_TV_logo.svg/512px-Universal_TV_logo.svg.png' },
  { name: 'Golden', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Golden_logo.svg/512px-Golden_logo.svg.png' },
  { name: 'Warner Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Warner_Channel_2017.svg/512px-Warner_Channel_2017.svg.png' },
  { name: 'FX', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/FX_Logo.svg/512px-FX_Logo.svg.png' },
  { name: 'TNT', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/TNT_Logo_2016.svg/512px-TNT_Logo_2016.svg.png' },
  { name: 'TNT Series', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/TNT_Logo_2016.svg/512px-TNT_Logo_2016.svg.png' },
  { name: 'TNT Novelas', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/TNT_Logo_2016.svg/512px-TNT_Logo_2016.svg.png' },
  { name: 'Space', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Space_%28Latin_American_TV_channel%29_Logo.svg/512px-Space_%28Latin_American_TV_channel%29_Logo.svg.png' },
  { name: 'Cinemax', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Cinemax_%28Yellow%29.svg/512px-Cinemax_%28Yellow%29.svg.png' },
  { name: 'Sony Channel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sony_Channel_2021.svg/512px-Sony_Channel_2021.svg.png' }
];

async function checkLogos() {
  for (const item of logos) {
    try {
      const res = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`${item.name}: Status ${res.status}`);
    } catch (e) {
      console.log(`${item.name}: Error ${e.message}`);
    }
  }
}

checkLogos();

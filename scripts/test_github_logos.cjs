const githubLogos = [
  { name: 'Star Channel', url: 'https://iptv-org.github.io/iptv/logos/StarChannel.lat.png' },
  { name: 'Cinecanal', url: 'https://iptv-org.github.io/iptv/logos/Cinecanal.lat.png' },
  { name: 'Studio Universal', url: 'https://iptv-org.github.io/iptv/logos/StudioUniversal.lat.png' },
  { name: 'Universal TV', url: 'https://iptv-org.github.io/iptv/logos/UniversalTV.lat.png' },
  { name: 'AXN', url: 'https://iptv-org.github.io/iptv/logos/AXN.lat.png' },
  { name: 'Golden', url: 'https://iptv-org.github.io/iptv/logos/Golden.mx.png' },
  { name: 'Warner Channel', url: 'https://iptv-org.github.io/iptv/logos/WarnerChannel.lat.png' },
  { name: 'FX', url: 'https://iptv-org.github.io/iptv/logos/FX.lat.png' },
  { name: 'TNT', url: 'https://iptv-org.github.io/iptv/logos/TNT.lat.png' },
  { name: 'Space', url: 'https://iptv-org.github.io/iptv/logos/Space.lat.png' },
  { name: 'Cinemax', url: 'https://iptv-org.github.io/iptv/logos/Cinemax.lat.png' },
  { name: 'Sony Channel', url: 'https://iptv-org.github.io/iptv/logos/SonyChannel.lat.png' }
];

async function runGithubTest() {
  for (const l of githubLogos) {
    try {
      const res = await fetch(l.url);
      console.log(`${l.name}: HTTP ${res.status}`);
    } catch(e) {
      console.log(`${l.name}: Error ${e.message}`);
    }
  }
}

runGithubTest();

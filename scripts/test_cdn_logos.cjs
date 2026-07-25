const cdnLogos = [
  { name: 'Star Channel', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/StarChannelLatinAmerica.png' },
  { name: 'Cinecanal', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/CinecanalLatinAmerica.png' },
  { name: 'Studio Universal', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/StudioUniversalLatinAmerica.png' },
  { name: 'Universal TV', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/UniversalTVLatinAmerica.png' },
  { name: 'AXN', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/AXNLatinAmerica.png' },
  { name: 'Golden', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/GoldenLatinAmerica.png' },
  { name: 'Warner Channel', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/WarnerChannelLatinAmerica.png' },
  { name: 'FX', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/FXLatinAmerica.png' },
  { name: 'TNT', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/TNTLatinAmerica.png' },
  { name: 'Space', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/SpaceLatinAmerica.png' },
  { name: 'Cinemax', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/CinemaxLatinAmerica.png' },
  { name: 'Sony Channel', url: 'https://cdn.jsdelivr.net/gh/iptv-org/iptv/logos/SonyChannelLatinAmerica.png' }
];

async function runCdnTest() {
  for (const l of cdnLogos) {
    try {
      const res = await fetch(l.url);
      console.log(`${l.name}: HTTP ${res.status}`);
    } catch(e) {
      console.log(`${l.name}: Error ${e.message}`);
    }
  }
}

runCdnTest();

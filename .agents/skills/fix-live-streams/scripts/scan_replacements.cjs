/**
 * scan_replacements.js - Busca URLs de reemplazo para canales muertos
 * Uso: node .agents/skills/fix-live-streams/scripts/scan_replacements.js "HBO" "Cinemax" "Star Channel"
 */

const SERVERS = [
  { base: 'http://179.60.51.134:8888', slugFormat: 'UPPER-DASH' },
  { base: 'http://138.121.15.230:9002', slugFormat: 'UPPER-DASH' },
  { base: 'http://45.134.141.161:2200/ARG', slugFormat: 'Title_Underscore' },
  { base: 'http://181.119.93.83:8000/play', slugFormat: 'code' },
  { base: 'http://45.181.87.106', slugFormat: 'UPPERNODASH' },
  { base: 'http://200.115.120.1:8000/play', slugFormat: 'code' },
];

function generateSlugs(name) {
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const upper = clean.toUpperCase().replace(/\s+/g, '-');
  const upperNoDash = clean.toUpperCase().replace(/\s+/g, '');
  const title = clean.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('_');
  const titleHD = title + '_HD';
  return {
    'UPPER-DASH': [upper, upper + '-HD', upper.replace(/-/g, '')],
    'Title_Underscore': [title, titleHD, clean.replace(/\s+/g, '_')],
    'UPPERNODASH': [upperNoDash, upperNoDash + 'HD'],
  };
}

async function checkUrl(url, timeout = 4000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeout);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t);
    if (!r.ok) return false;
    const text = await r.text();
    return text.includes('#EXTM3U') || text.includes('#EXT-X-');
  } catch { clearTimeout(t); return false; }
}

async function main() {
  const names = process.argv.slice(2);
  if (names.length === 0) {
    console.log('Uso: node scan_replacements.js "HBO" "Star Channel" "Sundance"');
    process.exit(1);
  }

  for (const name of names) {
    console.log(`\n--- Buscando: ${name} ---`);
    const slugSets = generateSlugs(name);
    let found = false;

    for (const server of SERVERS) {
      if (server.slugFormat === 'code') continue; // codes need manual mapping
      const slugs = slugSets[server.slugFormat] || [];
      for (const slug of slugs) {
        const url = `${server.base}/${slug}/index.m3u8`;
        const ok = await checkUrl(url);
        if (ok) {
          console.log(`  🟢 ${url}`);
          found = true;
        }
      }
    }

    if (!found) console.log(`  🔴 Sin reemplazo encontrado`);
  }
}

main().catch(console.error);

/**
 * audit_channels.js - Script de auditoría completa de canales IPTV
 * Uso: node .agents/skills/fix-live-streams/scripts/audit_channels.js [categoria]
 * Ejemplo: node .agents/skills/fix-live-streams/scripts/audit_channels.js Cine
 */

const fs = require('fs');
const path = require('path');

// Leer iptvService.js y extraer canales
function parseChannels() {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'src', 'services', 'iptvService.js');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const channels = [];
  // Regex para extraer objetos de canales
  const regex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'[^}]*streamUrl:\s*'([^']+)'[^}]*category:\s*'([^']+)'[^}]*?(?:backups:\s*\[([^\]]*)\])?\s*\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const backups = match[5] 
      ? match[5].match(/'([^']+)'/g)?.map(b => b.replace(/'/g, '')) || []
      : [];
    channels.push({
      id: match[1],
      name: match[2],
      streamUrl: match[3],
      category: match[4],
      backups
    });
  }
  return channels;
}

async function checkStream(url, timeout = 6000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeout);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t);
    if (!r.ok) return { ok: false, status: r.status };
    const text = await r.text();
    const hasM3u8 = text.includes('#EXTM3U') || text.includes('#EXT-X-');
    return { ok: true, status: r.status, hasM3u8, size: text.length };
  } catch (e) { clearTimeout(t); return { ok: false, error: e.message.substring(0, 40) }; }
}

async function deepProbe(url, timeout = 6000) {
  const manifest = await checkStream(url, timeout);
  if (!manifest.ok || !manifest.hasM3u8) return { ...manifest, segments: 0, tsSize: 0 };

  // Fetch manifest text to find variant/segments
  const c1 = new AbortController();
  const t1 = setTimeout(() => c1.abort(), timeout);
  try {
    const r = await fetch(url, { signal: c1.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t1);
    const text = await r.text();
    const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    if (lines.length === 0) return { ...manifest, segments: 0, tsSize: 0 };

    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    let variantUrl = lines[0].trim();
    if (!variantUrl.startsWith('http')) variantUrl = baseUrl + variantUrl;

    // Fetch variant
    const c2 = new AbortController();
    const t2 = setTimeout(() => c2.abort(), timeout);
    const r2 = await fetch(variantUrl, { signal: c2.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t2);
    const varText = await r2.text();
    const tsLines = varText.split('\n').filter(l => l.trim() && !l.startsWith('#') && l.trim().length > 0);

    if (tsLines.length === 0) return { ...manifest, segments: 0, tsSize: 0 };

    // Download first .ts
    const varBase = variantUrl.substring(0, variantUrl.lastIndexOf('/') + 1);
    let tsUrl = tsLines[0].trim();
    if (!tsUrl.startsWith('http')) tsUrl = varBase + tsUrl;

    const c3 = new AbortController();
    const t3 = setTimeout(() => c3.abort(), timeout);
    const r3 = await fetch(tsUrl, { signal: c3.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t3);
    const buf = await r3.arrayBuffer();
    
    return { ...manifest, segments: tsLines.length, tsSize: buf.byteLength };
  } catch (e) { return { ...manifest, segments: 0, tsSize: 0, probeError: e.message }; }
}

async function main() {
  const filterCategory = process.argv[2] || null;
  const deepMode = process.argv.includes('--deep');
  const channels = parseChannels();
  
  const filtered = filterCategory 
    ? channels.filter(c => c.category.toLowerCase() === filterCategory.toLowerCase())
    : channels;

  console.log(`\n=== AUDITORÍA DE ${filtered.length} CANALES ${filterCategory ? `(${filterCategory})` : '(TODOS)'} ===\n`);

  const results = { active: 0, unstable: 0, dead: 0 };

  for (const ch of filtered) {
    if (deepMode) {
      const r = await deepProbe(ch.streamUrl);
      if (r.ok && r.hasM3u8 && r.tsSize > 1000) {
        console.log(`🟢 ${ch.name} (${ch.id}): ${r.segments} seg, ${(r.tsSize/1024).toFixed(0)}KB`);
        results.active++;
      } else if (r.ok && r.hasM3u8) {
        console.log(`🟡 ${ch.name} (${ch.id}): M3U8 OK pero TS=${r.tsSize}B (${r.segments} seg)`);
        results.unstable++;
      } else {
        console.log(`🔴 ${ch.name} (${ch.id}): ${r.status || r.error}`);
        results.dead++;
        // Check backups
        for (const b of ch.backups) {
          const br = await checkStream(b);
          if (br.ok && br.hasM3u8) {
            console.log(`   ↳ backup OK: ${b}`);
            break;
          }
        }
      }
    } else {
      const r = await checkStream(ch.streamUrl);
      if (r.ok && r.hasM3u8) {
        console.log(`🟢 ${ch.name} (${ch.id}): OK [${r.size}B]`);
        results.active++;
      } else if (r.ok) {
        console.log(`🟡 ${ch.name} (${ch.id}): ${r.status} sin M3U8`);
        results.unstable++;
      } else {
        console.log(`🔴 ${ch.name} (${ch.id}): ${r.status || r.error}`);
        results.dead++;
        for (const b of ch.backups) {
          const br = await checkStream(b);
          if (br.ok && br.hasM3u8) { console.log(`   ↳ backup OK: ${b}`); break; }
        }
      }
    }
  }

  console.log(`\n--- RESUMEN ---`);
  console.log(`🟢 Activos: ${results.active}`);
  console.log(`🟡 Inestables: ${results.unstable}`);
  console.log(`🔴 Muertos: ${results.dead}`);
  console.log(`Total: ${filtered.length}\n`);
}

main().catch(console.error);

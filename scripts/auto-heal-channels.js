// scripts/auto-heal-channels.js
// Script autónomo para verificar canales y auto-reparar la lista si el stream principal está caído.
// Si el stream principal falla, busca en los backups. Si encuentra uno activo, los intercambia.

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const servicePath = path.join(__dirname, '../src/services/iptvService.js');

// ── Probar conexión de un stream ───────────────────────────
function testUrl(urlStr) {
  return new Promise((resolve) => {
    if (!urlStr) return resolve(false);
    
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, 5000); // 5 segundos de timeout

    try {
      const parsedUrl = new URL(urlStr);
      const requester = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = requester.request({
        method: 'GET',
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      }, (res) => {
        clearTimeout(timer);
        if (resolved) return;
        resolved = true;
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });

      req.on('error', () => {
        clearTimeout(timer);
        if (resolved) return;
        resolved = true;
        resolve(false);
      });

      req.end();
    } catch (e) {
      clearTimeout(timer);
      resolve(false);
    }
  });
}

// ── Analizar y procesar los canales ────────────────────────
async function main() {
  console.log('=== INICIANDO AUTO-HEAL DE CANALES IPTV ===');
  let content = fs.readFileSync(servicePath, 'utf8');

  // Buscar el array CHANNELS
  const match = content.match(/const CHANNELS = \[\s*([\s\S]+?)\s*\];/);
  if (!match) {
    console.error('No se pudo encontrar el array CHANNELS.');
    process.exit(1);
  }

  const channelsBlock = match[1];
  
  // Vamos a parsear los objetos JSON-like de manera robusta
  // Buscaremos cada bloque {} dentro del array
  const rawChannels = [];
  const bracketRegex = /\{([\s\S]*?)\}/g;
  let blockMatch;
  
  while ((blockMatch = bracketRegex.exec(channelsBlock)) !== null) {
    const blockContent = blockMatch[0];
    
    // Extraer campos usando expresiones regulares individuales
    const idM = blockContent.match(/id:\s*['"]([^'"]+)['"]/);
    const nameM = blockContent.match(/name:\s*['"]([^'"]+)['"]/);
    const streamM = blockContent.match(/streamUrl:\s*['"]([^'"]+)['"]/);
    
    // Extraer backups
    const backupsM = blockContent.match(/backups:\s*\[([\s\S]*?)\]/);
    let backups = [];
    if (backupsM) {
      backups = backupsM[1]
        .split(',')
        .map(u => u.replace(/['"\s]/g, ''))
        .filter(u => u.startsWith('http'));
    }

    if (idM && nameM && streamM) {
      rawChannels.push({
        rawBlock: blockContent,
        id: idM[1],
        name: nameM[1],
        streamUrl: streamM[1],
        backups: backups
      });
    }
  }

  console.log(`Se cargaron ${rawChannels.length} canales para revisión.`);
  let modified = false;

  for (const ch of rawChannels) {
    console.log(`Verificando canal: ${ch.name}...`);
    const isPrimaryLive = await testUrl(ch.streamUrl);

    if (isPrimaryLive) {
      console.log(`  🟢 Principal online.`);
      continue;
    }

    console.log(`  🔴 Principal caído: ${ch.streamUrl}`);
    if (ch.backups.length === 0) {
      console.log(`  ⚠️ Sin respaldos configurados.`);
      continue;
    }

    // Probar los respaldos en orden
    let workingBackupIndex = -1;
    for (let i = 0; i < ch.backups.length; i++) {
      console.log(`  Probar respaldo ${i+1}/${ch.backups.length}: ${ch.backups[i]}`);
      const isBackupLive = await testUrl(ch.backups[i]);
      if (isBackupLive) {
        workingBackupIndex = i;
        break;
      }
    }

    if (workingBackupIndex !== -1) {
      const deadPrimary = ch.streamUrl;
      const workingBackup = ch.backups[workingBackupIndex];
      
      console.log(`  ✅ ¡Señal activa encontrada en respaldo! Promoviendo a principal.`);
      
      // Armar nueva lista de backups (quitar el que ahora es principal y meter el dañado al final)
      const newBackups = ch.backups.filter((_, idx) => idx !== workingBackupIndex);
      newBackups.push(deadPrimary);

      // Reemplazar en el archivo
      const escapedOldUrl = deadPrimary.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const escapedOldBlock = ch.rawBlock.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

      // Generar bloque de reemplazo
      let newBlock = ch.rawBlock
        .replace(`streamUrl: '${deadPrimary}'`, `streamUrl: '${workingBackup}'`)
        .replace(`streamUrl: "${deadPrimary}"`, `streamUrl: '${workingBackup}'`);

      // Actualizar backups en el bloque
      const backupsStr = newBackups.map(u => `'${u}'`).join(', ');
      if (ch.rawBlock.includes('backups:')) {
        newBlock = newBlock.replace(/backups:\s*\[([\s\S]*?)\]/, `backups: [${backupsStr}]`);
      } else {
        // Si por alguna razón no tenía array backups en texto original
        newBlock = newBlock.replace(`streamUrl: '${workingBackup}'`, `streamUrl: '${workingBackup}',\n    backups: [${backupsStr}]`);
      }

      content = content.replace(ch.rawBlock, newBlock);
      modified = true;
    } else {
      console.log(`  ❌ Todos los respaldos fallaron.`);
    }
  }

  if (modified) {
    fs.writeFileSync(servicePath, content, 'utf8');
    console.log('💾 ¡Canales auto-reparados y archivo iptvService.js guardado con éxito!');
    process.exit(0); // Código 0 indica cambios guardados
  } else {
    console.log('😎 Todos los canales principales están estables. No se requirieron cambios.');
    process.exit(1); // Código 1 indica que no hubo modificaciones
  }
}

main().catch(err => {
  console.error('Error fatal en ejecutor de auto-heal:', err);
  process.exit(2);
});

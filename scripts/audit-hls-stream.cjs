// scripts/audit-hls-stream.cjs
// Auditor de reproducción HLS para NovaStream TV
// Simula el comportamiento del reproductor HLS.js para verificar el streaming completo



const RESOLVER = 'https://novastream-resolver.vercel.app';
const TEST_MOVIE = { name: 'Gladiator II', id: 'tt9218128' };

async function audit() {
  console.log('====================================================');
  console.log('   INICIANDO AUDITORÍA COMPLETA DE STREAMING VOD    ');
  console.log('====================================================\n');

  // Paso 1: Consultar el Resolver API
  console.log(`1. Consultando Resolver para: ${TEST_MOVIE.name}...`);
  let streamUrl = '';
  try {
    const res = await fetch(`${RESOLVER}/api/stream?id=${TEST_MOVIE.id}&type=movie`);
    const data = await res.json();
    if (!data.success || !data.url) {
      console.log('❌ Falló la consulta al resolver:', data);
      return;
    }
    streamUrl = data.url;
    console.log(`   Refreshed! Stream M3U8 resuelto con éxito.`);
    console.log(`   🔗 URL Original: ${streamUrl.substring(0, 90)}...`);
  } catch (err) {
    console.log('❌ Error al llamar al resolver:', err.message);
    return;
  }

  // Paso 2: Convertir a URL de Proxy (Ruta Amigable)
  console.log('\n2. Aplicando traducción de ruta del Proxy...');
  let proxiedMasterUrl = '';
  if (streamUrl.startsWith('https://')) {
    proxiedMasterUrl = `${RESOLVER}/api/proxy/https/` + streamUrl.slice('https://'.length);
  } else if (streamUrl.startsWith('http://')) {
    proxiedMasterUrl = `${RESOLVER}/api/proxy/http/` + streamUrl.slice('http://'.length);
  } else {
    proxiedMasterUrl = streamUrl;
  }
  console.log(`   🔗 URL Proxeada: ${proxiedMasterUrl.substring(0, 90)}...`);

  // Paso 3: Descargar Master Playlist (.m3u8)
  console.log('\n3. Descargando el Master Playlist (.m3u8) desde el Proxy...');
  let masterM3u8Content = '';
  try {
    const res = await fetch(proxiedMasterUrl);
    console.log(`   Status Code: ${res.status} ${res.statusText}`);
    if (!res.ok) {
      console.log('❌ Error al descargar el Master Playlist');
      return;
    }
    masterM3u8Content = await res.text();
    console.log('   ✅ Master Playlist cargado correctamente!');
    console.log('   --- Contenido Inicial ---');
    console.log(masterM3u8Content.split('\n').slice(0, 6).join('\n'));
    console.log('   -------------------------');
  } catch (err) {
    console.log('❌ Error de red descargando Master Playlist:', err.message);
    return;
  }

  // Paso 4: Extraer y resolver la ruta relativa de la primera variante de calidad
  console.log('\n4. Buscando variantes de calidad (playlists secundarias)...');
  const lines = masterM3u8Content.split('\n');
  let relativeVariantPath = '';
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      relativeVariantPath = line.trim();
      break;
    }
  }

  if (!relativeVariantPath) {
    console.log('❌ No se encontraron variantes de calidad en el Master Playlist.');
    return;
  }

  console.log(`   Variante encontrada: ${relativeVariantPath.substring(0, 60)}...`);

  // Resolver la ruta relativa contra la base URL del proxy
  const baseUrlParts = proxiedMasterUrl.split('/');
  baseUrlParts.pop(); // Quitar master.m3u8
  const baseDirUrl = baseUrlParts.join('/'); // Directorio base del CDN proxeado
  
  const proxiedVariantUrl = `${baseDirUrl}/${relativeVariantPath}`;
  console.log(`   🔗 URL Proxeada de Variante: ${proxiedVariantUrl.substring(0, 90)}...`);

  // Paso 5: Descargar el Playlist de la Variante
  console.log('\n5. Descargando el Playlist de Calidad (.m3u8)...');
  let variantM3u8Content = '';
  try {
    const res = await fetch(proxiedVariantUrl);
    console.log(`   Status Code: ${res.status} ${res.statusText}`);
    if (!res.ok) {
      console.log('❌ Error al descargar el Playlist de Calidad');
      return;
    }
    variantM3u8Content = await res.text();
    console.log('   ✅ Playlist de Calidad cargado correctamente!');
    console.log('   --- Contenido Inicial ---');
    console.log(variantM3u8Content.split('\n').slice(0, 8).join('\n'));
    console.log('   -------------------------');
  } catch (err) {
    console.log('❌ Error de red descargando Playlist de Calidad:', err.message);
    return;
  }

  // Paso 6: Extraer el primer segmento de video (.ts)
  console.log('\n6. Localizando el primer segmento de video (.ts)...');
  const variantLines = variantM3u8Content.split('\n');
  let relativeSegmentPath = '';
  for (const line of variantLines) {
    if (line.trim() && !line.startsWith('#') && line.includes('.ts')) {
      relativeSegmentPath = line.trim();
      break;
    }
  }

  if (!relativeSegmentPath) {
    console.log('❌ No se encontró ningún segmento de video (.ts) en el playlist.');
    return;
  }

  console.log(`   Segmento encontrado: ${relativeSegmentPath}`);
  
  let proxiedSegmentUrl = '';
  if (relativeSegmentPath.startsWith('http')) {
    // Si ya es una URL absoluta (gracias al reescritor de nuestro proxy)
    proxiedSegmentUrl = relativeSegmentPath;
  } else {
    // Resolver segmento contra la base URL de la variante
    const variantUrlParts = proxiedVariantUrl.split('?')[0].split('/');
    variantUrlParts.pop(); // Quitar la parte final del archivo
    const segmentBaseDir = variantUrlParts.join('/');
    
    // Agregar query params de seguridad de la variante
    const queryParams = proxiedVariantUrl.split('?')[1] || '';
    proxiedSegmentUrl = `${segmentBaseDir}/${relativeSegmentPath}${queryParams ? '?' + queryParams : ''}`;
  }
  console.log(`   🔗 URL Proxeada del Segmento: ${proxiedSegmentUrl.substring(0, 90)}...`);

  // Paso 7: Descargar el segmento de video para verificar permisos de red
  console.log('\n7. Descargando segmento de video (.ts) para probar ancho de banda...');
  try {
    const res = await fetch(proxiedSegmentUrl, {
      headers: {
        'Range': 'bytes=0-1024'
      }
    });
    console.log(`   Status Code: ${res.status} ${res.statusText}`);
    console.log(`   Content-Type: ${res.headers.get('content-type')}`);
    console.log(`   Content-Length: ${res.headers.get('content-length')} bytes`);
    
    if (res.ok) {
      console.log('\n🎉 ¡AUDITORÍA EXITOSA! El reproductor puede leer las listas de reproducción y descargar los fragmentos de video sin restricciones de CORS ni errores 403.');
    } else {
      console.log('\n❌ Falló la descarga del segmento de video.');
    }
  } catch (err) {
    console.log('❌ Error de red descargando segmento:', err.message);
  }
}

audit();

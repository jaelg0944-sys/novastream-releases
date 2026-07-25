---
name: fix-live-streams
description: Diagnostica y repara canales de TV en vivo que no reproducen, se entrecortan o tienen señal muerta. Audita todos los streams IPTV, encuentra reemplazos, y despliega las correcciones automáticamente.
---

# Fix Live Streams - Reparador de Canales IPTV

## Scripts incluidos
```bash
# Auditoría rápida de una categoría
node .agents/skills/fix-live-streams/scripts/audit_channels.cjs Cine

# Auditoría profunda (descarga .ts para verificar)
node .agents/skills/fix-live-streams/scripts/audit_channels.cjs Cine --deep

# Auditoría de TODOS los canales
node .agents/skills/fix-live-streams/scripts/audit_channels.cjs

# Buscar reemplazos para canales muertos
node .agents/skills/fix-live-streams/scripts/scan_replacements.cjs "HBO" "Star Channel"
```

> **IMPORTANTE**: Los scripts usan `.cjs` porque el proyecto tiene `"type": "module"` en package.json.

## Cuándo usar este skill
Activa este skill cuando el usuario reporta:
- Canales que no reproducen / pantalla negra
- Señal que se pausa, entrecorta o congela
- Canales sin señal o con error
- Solicitud de auditoría general de canales

## Arquitectura del proyecto
- **Canales IPTV**: `src/services/iptvService.js` — Array de objetos con `id`, `name`, `streamUrl`, `category`, `backups[]`
- **Player**: `src/pages/Player.jsx` — HLS.js para reproducción, stall detection, failover automático
- **Proxy**: `../novastream-resolver/api/proxy.js` — Proxy CORS que reescribe M3U8 y retransmite .ts
- **Deploy web**: Vercel (`novastreamtv-plum.vercel.app`)
- **Deploy proxy**: Vercel (`novastream-resolver.vercel.app`)
- **App Android**: Capacitor (`npx cap sync android`)

## Procedimiento de diagnóstico

### Paso 1: Auditar canales
Crear y ejecutar un script Node.js que:
1. Importa/parsea todos los canales de `iptvService.js`
2. Para cada canal, hace fetch al `streamUrl` principal
3. Si responde 200, verifica que contenga `#EXTM3U` o `#EXT-X-`
4. Si el master playlist es válido, descarga el variant playlist y luego intenta descargar el primer segmento .ts
5. Clasifica cada canal como:
   - 🟢 **ACTIVO**: M3U8 válido + segmentos .ts descargables (>1KB)
   - 🟡 **INESTABLE**: M3U8 válido pero .ts muy pequeños (<1KB) o lentos (>5s)
   - 🔴 **MUERTO**: HTTP error, timeout, o sin M3U8 válido

```javascript
// Plantilla de auditoría rápida
async function checkStream(url, timeout = 5000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeout);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t);
    if (!r.ok) return { ok: false, status: r.status };
    const text = await r.text();
    const hasM3u8 = text.includes('#EXTM3U') || text.includes('#EXT-X-');
    return { ok: true, status: r.status, hasM3u8, size: text.length };
  } catch (e) { clearTimeout(t); return { ok: false, error: e.message }; }
}
```

### Paso 2: Buscar reemplazos para canales muertos
Servidores IPTV conocidos para escanear:
```
http://179.60.51.134:8888/{SLUG}/index.m3u8
http://138.121.15.230:9002/{SLUG}/index.m3u8
http://45.134.141.161:2200/ARG/{Slug_Con_Underscore}/index.m3u8
http://181.119.93.83:8000/play/{code}/index.m3u8
http://45.181.87.106/{SLUG}/index.m3u8
http://200.115.120.1:8000/play/{code}/index.m3u8
```

Probar variantes del nombre del canal: `HBO`, `HBO-HD`, `HBO_HD`, `HBO_Plus`, etc.

También probar refs de Gambeta como backup final:
```
https://novastream-resolver.vercel.app/api/gambeta?ref={ref_number}
```

### Paso 3: Aplicar correcciones
- Actualizar URLs en `iptvService.js`
- Agregar backups donde falten
- Cada canal debe tener al menos 1 backup

### Paso 4: Verificar configuración de HLS.js
Si el problema es buffering/stalling (no URLs muertas), revisar `Player.jsx`:
- `maxBufferHole`: debe ser 0.3-0.5 (no más alto, causa saltos)
- `fragLoadingTimeOut`: 20000-25000ms para streams proxy
- `fragLoadingMaxRetry`: 6-8
- `liveSyncDurationCount`: 3-4
- Stall detection: mínimo 5 segundos antes de actuar, NO saltar posición
- `lowLatencyMode: false` para priorizar estabilidad

### Paso 5: Deploy
```bash
# 1. Build frontend
cmd /c "npm run build"

# 2. Deploy frontend a Vercel
cmd /c "npx vercel --prod --yes"

# 3. Sync Android
cmd /c "npx cap sync android"

# 4. Si se modificó el proxy:
cd ../novastream-resolver
cmd /c "npx vercel --prod --yes"
```

## Reglas importantes
- En PowerShell usar `cmd /c "comando"` para evitar errores de ejecución
- Los streams HTTP necesitan proxy en web HTTPS (mixed content)
- En app nativa (Capacitor) los streams HTTP van directo sin proxy
- El proxy NO debe cachear M3U8 (usar `no-cache` para live playlists)
- Segmentos .ts se cachean máx 60s
- Responder de forma CONCISA para ahorrar tokens

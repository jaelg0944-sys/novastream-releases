# NovaStream TV - Contexto del Proyecto e Historial de Trabajo

Este documento contiene un resumen completo del estado actual del proyecto, la arquitectura, los cambios realizados y los pasos pendientes. Está diseñado para que cualquier nueva instancia del asistente de IA (Antigravity u otros) pueda leerlo y continuar el desarrollo de inmediato con total conocimiento de causa.

---

## 📌 Estado Actual del Proyecto
NovaStream es una aplicación de IPTV y Streaming VOD (Películas y Series) que corre como Web App en React/Vite y se compila a móvil (Android/iOS) usando Capacitor.
* **Frontend Web:** [https://novastreamtv-plum.vercel.app](https://novastreamtv-plum.vercel.app)
* **Backend Resolver Proxy:** [https://server-sigma-cyan.vercel.app](https://server-sigma-cyan.vercel.app) (Repositorio: `novastream-proxy-temp`)
* **Repositorio Frontend:** `novastream_tv` en GitHub (`jaelg0944-sys/novastream-releases`)

---

## 🛠️ Arquitectura y Flujo de Reproducción VOD

### 1. Catálogo Dinámico (Stremio Cinemeta API)
Para evitar el scraping inestable y con anuncios de Repelis24, el catálogo consulta de forma limpia y directa la base de datos de **Stremio Cinemeta**:
* **Endpoint de Películas:** `https://v3-cinemeta.strem.io/catalog/movie/top/page={page}.json`
* **Endpoint de Series:** `https://v3-cinemeta.strem.io/catalog/series/top/page={page}.json`
* **Detalles y Episodios:** `https://v3-cinemeta.strem.io/meta/{movie|series}/{imdbId}.json`
* **Imágenes de Portadas (Metahub):** `https://images.metahub.space/poster/medium/{imdbId}/img`

### 2. Reproductor y Resolución de Video (VidLink)
El reproductor nativo de VOD de películas y series utiliza el resolutor libre del cliente **VidLink** para evitar bloqueos de IP geolocalizados por parte de servidores de almacenamiento intermedios (como Nupload/Vidsrc):
* **Películas URL:** `https://vidlink.pro/movie/{imdbId}?primaryColor=ff3366&autoplay=true`
* **Series URL:** `https://vidlink.pro/tv/{imdbId}/{season}/{episode}?primaryColor=ff3366&autoplay=true`
* El reproductor en `src/pages/Player.jsx` carga estas URLs de forma limpia mediante un iframe sin restricciones de `sandbox` (ya que VidLink requiere acceso a almacenamiento/cookies del navegador para verificar el token Cloudflare del cliente).

### 3. Redirección SPA en Vercel
Se creó el archivo `vercel.json` en la raíz del frontend para solucionar los errores 404 al recargar las subpáginas en Vercel, forzando la redirección de rutas a `index.html`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📂 Archivos Clave del Proyecto
* [src/services/vodService.js](file:///c:/Users/Geo/Desktop/TV%20en%20Vivo/novastream_tv/src/services/vodService.js) - Contiene la lógica del catálogo integrada con Cinemeta API y las URL de reproducción.
* [src/pages/Player.jsx](file:///c:/Users/Geo/Desktop/TV%20en%20Vivo/novastream_tv/src/pages/Player.jsx) - Lógica de renderizado del reproductor de video HLS (Shaka/Hls.js) e Iframe.
* [src/pages/Catalog.jsx](file:///c:/Users/Geo/Desktop/TV%20en%20Vivo/novastream_tv/src/pages/Catalog.jsx) - Componente visual del catálogo, pestañas y carga rápida de capítulos para series.
* [vercel.json](file:///c:/Users/Geo/Desktop/TV%20en%20Vivo/novastream_tv/vercel.json) - Configuración del enrutamiento SPA para Vercel.

---

## 🚀 Cómo Continuar el Trabajo en la Nueva Instancia
Cuando inicies el chat con el nuevo agente de Antigravity:
1. Indícale que lea el archivo `PROJECT_CONTEXT.md` en la raíz del proyecto para que entienda todo el historial.
2. Si requieres compilar cambios y subirlos, indícale usar los siguientes comandos en la terminal de la raíz del proyecto:
   * **Para compilar y publicar OTA en Supabase:** `node scripts/publish-ota.cjs`
   * **Para desplegar el frontend a Vercel:** `npx vercel --prod --yes`

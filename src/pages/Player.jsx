import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Maximize, Settings, Volume2, VolumeX, AlertCircle, X, SkipBack, SkipForward } from 'lucide-react';
import Hls from 'hls.js';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { toast } from '../components/Toast';
import { BACKEND_URL } from '../services/config';
import './Player.css';

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const channelName = location.state?.channelName || location.state?.title || 'NovaStream TV';
  const channelCategory = location.state?.category || 'En Vivo';
  const isIframe = location.state?.isIframe || false;
  const isDashed = location.state?.isDashed || false;
  const drm = location.state?.drm || null;
  const postParam = location.state?.post;
  const defaultRepelisServers = [
    { nume: '1', server: 'Vimeos (Español Latino)', lang: 'Latino' },
    { nume: '2', server: 'Waaw/Netu (Español Latino)', lang: 'Latino' },
    { nume: '3', server: 'Vimeos (Español España)', lang: 'Castellano' },
    { nume: '4', server: 'Vimeos (Inglés Subtitulado)', lang: 'Subtitulado' },
    { nume: '5', server: 'VidSrc (Multi-Idioma)', lang: 'Inglés/Sub' },
  ];

  const rawOptions = location.state?.options || [];
  const options = (rawOptions && rawOptions.length > 0) ? rawOptions : defaultRepelisServers;
  const currentOptionNume = location.state?.currentOptionNume || '1';

  const backups = location.state?.backups || [];
  const [currentBackupIndex, setCurrentBackupIndex] = useState(-1);
  const [failoverMsg, setFailoverMsg] = useState('');

  const isApiUrl = (url) => url && (url.includes('/api/stream') || url.includes('/api/anime'));
  const isNeedsResolving = (url) => url && (isApiUrl(url) || url.includes('rudo.video') || url.includes('dps.live'));

  const initialUrl = location.state?.streamUrl || '';
  const initialNeedsResolving = isNeedsResolving(initialUrl);

  const [currentStreamUrl, setCurrentStreamUrl] = useState(initialUrl);
  const [resolvedStreamUrl, setResolvedStreamUrl] = useState(initialNeedsResolving ? '' : initialUrl);
  const [activeOptionNume, setActiveOptionNume] = useState(currentOptionNume);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [isLoadingServer, setIsLoadingServer] = useState(true);
  const [isResolvingVod, setIsResolvingVod] = useState(initialNeedsResolving);
  const [shouldUseIframeState, setShouldUseIframeState] = useState(initialNeedsResolving ? false : isIframe);
  const shakaPlayerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── VOD progress state ──
  const [isVod, setIsVod] = useState(location.state?.isVod || false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const stallTimerRef = useRef(null);

  // ── Helpers de tiempo ──
  const formatTime = useCallback((seconds) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // ── Saltar 10 segundos ──
  const skipForward = useCallback((e) => {
    e.stopPropagation();
    if (videoRef.current && isVod) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
    }
  }, [isVod]);

  const skipBackward = useCallback((e) => {
    e.stopPropagation();
    if (videoRef.current && isVod) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  }, [isVod]);

  // ── Seek por click/drag en la barra de progreso ──
  const handleProgressSeek = useCallback((e) => {
    if (!progressBarRef.current || !videoRef.current || !isVod) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  }, [isVod]);

  const handleProgressMouseDown = useCallback((e) => {
    e.stopPropagation();
    setIsSeeking(true);
    handleProgressSeek(e);
  }, [handleProgressSeek]);

  const handleProgressMouseMove = useCallback((e) => {
    if (isSeeking) handleProgressSeek(e);
  }, [isSeeking, handleProgressSeek]);

  const handleProgressMouseUp = useCallback(() => {
    setIsSeeking(false);
  }, []);

  // ── Touch seek para móviles ──
  const handleProgressTouchStart = useCallback((e) => {
    e.stopPropagation();
    setIsSeeking(true);
    const touch = e.touches[0];
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    videoRef.current.currentTime = (x / rect.width) * videoRef.current.duration;
  }, []);

  const handleProgressTouchMove = useCallback((e) => {
    if (!isSeeking || !progressBarRef.current || !videoRef.current) return;
    const touch = e.touches[0];
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    videoRef.current.currentTime = (x / rect.width) * videoRef.current.duration;
  }, [isSeeking]);

  const handleProgressTouchEnd = useCallback(() => {
    setIsSeeking(false);
  }, []);

  // Intentar cambiar automáticamente al siguiente stream de respaldo en caso de error
  const triggerFailover = () => {
    if (backups.length > 0 && currentBackupIndex < backups.length - 1) {
      const nextIndex = currentBackupIndex + 1;
      setCurrentBackupIndex(nextIndex);
      const nextUrl = backups[nextIndex];
      console.log(`[Player Failover] Signal failed. Trying backup stream ${nextIndex + 1}/${backups.length}: ${nextUrl}`);
      setFailoverMsg(`Señal inestable. Buscando conexión de respaldo (${nextIndex + 1}/${backups.length})...`);
      setIsLoadingServer(true);
      setError(false);

      if (shakaPlayerRef.current) {
        try {
          shakaPlayerRef.current.destroy();
        } catch (e) {
          console.warn('[Player Failover] Error destroying Shaka Player:', e);
        }
        shakaPlayerRef.current = null;
      }

      setCurrentStreamUrl(nextUrl);
    } else {
      setError(true);
      setFailoverMsg('');
    }
  };

  // Safety timeout: solo como último recurso si todo falla (20s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingServer(false);
      setIsResolvingVod(false);
    }, 20000);
    return () => clearTimeout(timer);
  }, [currentStreamUrl]);

  // Efecto para interceptar y resolver enlaces VOD dinámicamente mediante el proxy
  useEffect(() => {
    let isMounted = true;

    const resolveVodUrl = async () => {
      if (!currentStreamUrl) return;

      // ── CASO ANIME: el API ya devuelve la URL del iframe directamente ──
      if (currentStreamUrl.includes('/api/anime')) {
        setIsResolvingVod(true);
        setIsLoadingServer(true);
        setError(false);
        try {
          console.log('[Player Anime] Resolviendo servidor de anime:', currentStreamUrl);
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(currentStreamUrl, { signal: controller.signal });
          clearTimeout(timeout);
          const data = await response.json();
          if (data.success && data.url && isMounted) {
            console.log('[Player Anime] ✅ Servidor extraído:', data.url.slice(0, 80));
            setResolvedStreamUrl(data.url);
            setShouldUseIframeState(true);
          } else {
            throw new Error(data.error || 'Sin URL de servidor');
          }
        } catch (err) {
          console.warn('[Player Anime] Falló, usando JKAnime directo:', err.message);
          const urlParams = new URLSearchParams(currentStreamUrl.split('?')[1] || '');
          const slug = urlParams.get('slug') || 'dragon-ball-super';
          const episode = urlParams.get('episode') || '1';
          if (isMounted) {
            setResolvedStreamUrl(`https://jkanime.net/${slug}/${episode}/`);
            setShouldUseIframeState(true);
          }
        } finally {
          if (isMounted) {
            setIsResolvingVod(false);
            setIsLoadingServer(false);
          }
        }
        return;
      }

      // ── CASO RUDO.VIDEO / REDIRECTOR (Ecuavisa, etc.) ──
      if (currentStreamUrl.includes('rudo.video') || currentStreamUrl.includes('dps.live')) {
        setIsResolvingVod(true);
        setIsLoadingServer(true);
        setError(false);
        try {
          console.log('[Player Rudo] Resolviendo redirección de Rudo Video:', currentStreamUrl);
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);
          const response = await fetch(currentStreamUrl, { redirect: 'follow', signal: controller.signal });
          clearTimeout(timeout);
          if (response.ok && response.url && isMounted) {
            console.log('[Player Rudo] ✅ URL final resuelta:', response.url.slice(0, 80));
            setResolvedStreamUrl(response.url);
            setShouldUseIframeState(false);
          } else {
            throw new Error('Respuesta no válida del redirector');
          }
        } catch (err) {
          console.warn('[Player Rudo] Falló resolución directa, usando URL base:', err.message);
          if (isMounted) {
            setResolvedStreamUrl(currentStreamUrl);
            setShouldUseIframeState(false);
          }
        } finally {
          if (isMounted) {
            setIsResolvingVod(false);
            setIsLoadingServer(false);
          }
        }
        return;
      }

      const isResolvable = 
        postParam ||
        currentStreamUrl.includes('/api/stream') ||
        currentStreamUrl.includes('vidsrc.to/embed/movie/') || 
        currentStreamUrl.includes('vidsrc.to/embed/tv/') ||
        currentStreamUrl.includes('vidsrcme.ru/embed/movie/') ||
        currentStreamUrl.includes('vidsrcme.ru/embed/tv/') ||
        currentStreamUrl.includes('2embed.cc/embed/') ||
        currentStreamUrl.includes('vixsrc.to/embed/');

      if (isResolvable) {
        setIsResolvingVod(true);
        setIsLoadingServer(true);
        setError(false);

        let resolverApiUrl = '';
        if (postParam) {
          const selectedNume = activeOptionNume || currentOptionNume || '1';
          resolverApiUrl = `https://novastream-resolver.vercel.app/api/stream?post=${postParam}&nume=${selectedNume}&type=movie`;
        } else if (currentStreamUrl.includes('/api/stream')) {
          resolverApiUrl = currentStreamUrl;
        } else {
          let tmdbId = '';
          let type = 'movie';
          let season = '';
          let episode = '';

          if (currentStreamUrl.includes('/movie/')) {
            const parts = currentStreamUrl.split('/');
            tmdbId = parts[parts.indexOf('movie') + 1]?.split('?')[0];
            type = 'movie';
          } else if (currentStreamUrl.includes('/tv/')) {
            const parts = currentStreamUrl.split('/');
            const tvIndex = parts.indexOf('tv');
            tmdbId = parts[tvIndex + 1]?.split('?')[0];
            season = parts[tvIndex + 2]?.split('?')[0];
            episode = parts[tvIndex + 3]?.split('?')[0];
            type = 'tv';
          } else if (currentStreamUrl.includes('2embed.cc/embed/')) {
            if (currentStreamUrl.includes('/series/')) {
              const parts = currentStreamUrl.split('/');
              const sIndex = parts.indexOf('series');
              tmdbId = parts[sIndex + 1];
              season = parts[sIndex + 2];
              episode = parts[sIndex + 3];
              type = 'tv';
            } else {
              const parts = currentStreamUrl.split('/');
              tmdbId = parts[parts.length - 1]?.split('?')[0];
              type = 'movie';
            }
          }
          resolverApiUrl = `https://novastream-resolver.vercel.app/api/stream?id=${tmdbId}&type=${type}${season ? `&season=${season}` : ''}${episode ? `&episode=${episode}` : ''}`;
        }

        try {
          console.log('[Player Resolver] Resolviendo vía:', resolverApiUrl);
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000); // 8s para Vercel cold start

          const response = await fetch(resolverApiUrl, { signal: controller.signal });
          clearTimeout(timeout);
          const data = await response.json();

          if (data.success && data.url && isMounted) {
            console.log(`[Player Resolver] ✅ Stream resuelto vía ${data.source}: ${data.url.slice(0,80)}`);
            setResolvedStreamUrl(data.url);
            
            // Si es m3u8 o mp4, reproducir nativo. Si es URL de embed/iframe, usar iframe.
            const isNativeVideo = data.url.includes('.m3u8') || data.url.includes('.mp4') || data.url.includes('/api/proxy/');
            setShouldUseIframeState(!isNativeVideo);
          } else {
            throw new Error(data.message || 'No se pudo extraer stream directo');
          }
        } catch (err) {
          console.warn('[Player Resolver] Falló o expiró resolution:', err.message);
          if (isMounted) {
            if (!isApiUrl(currentStreamUrl)) {
              setResolvedStreamUrl(currentStreamUrl);
              setShouldUseIframeState(true);
            } else {
              setError(true);
            }
          }
        } finally {
          if (isMounted) {
            setIsResolvingVod(false);
            setIsLoadingServer(false);
          }
        }
      } else {
        const checkIframe = isIframe || 
          currentStreamUrl.includes('.php') || 
          currentStreamUrl.includes('ecuaplay') || 
          currentStreamUrl.includes('tvhd2') ||
          currentStreamUrl.includes('dailymotion.com') ||
          currentStreamUrl.includes('youtube.com') ||
          currentStreamUrl.includes('vimeo.com') ||
          currentStreamUrl.includes('vimeos.net') ||
          currentStreamUrl.includes('rojadirectaa.net');

        if (isMounted) {
          setResolvedStreamUrl(currentStreamUrl);
          setShouldUseIframeState(checkIframe);
          setIsResolvingVod(false);
          setIsLoadingServer(false);
        }
      }
    };

    resolveVodUrl();

    return () => {
      isMounted = false;
    };
  }, [currentStreamUrl]);


  // Cambiar de servidor en tiempo real sin salir del reproductor
  const handleSwitchServer = async (opt) => {
    setIsLoadingServer(true);
    setShowServerMenu(false);
    setActiveOptionNume(opt.nume);
    const postParam = location.state?.post;
    const tmdbId = location.state?.tmdbId;

    try {
      let nextUrl = '';
      if (opt.embedUrl) {
        nextUrl = opt.embedUrl;
      } else if (postParam) {
        nextUrl = `https://novastream-resolver.vercel.app/api/stream?post=${postParam}&nume=${opt.nume}&type=movie`;
      } else if (tmdbId) {
        nextUrl = `https://novastream-resolver.vercel.app/api/stream?id=${tmdbId}&type=movie`;
      }

      if (nextUrl) {
        console.log(`[Player] Cambiando a servidor ${opt.server} (${opt.nume}): ${nextUrl}`);
        setCurrentStreamUrl(nextUrl);
      } else {
        toast.error('Este servidor no está disponible actualmente.');
        setIsLoadingServer(false);
      }
    } catch (err) {
      console.error('Error al cambiar de servidor:', err);
      setIsLoadingServer(false);
    }
  };

  useEffect(() => {
    if (shouldUseIframeState || isResolvingVod) return;
    if (!resolvedStreamUrl || !videoRef.current || isApiUrl(resolvedStreamUrl)) return;

    let hls;

    const initPlayer = async () => {
      const isDashUrl = resolvedStreamUrl.includes('.mpd');
      if (isDashed || isDashUrl) {
        try {
          console.log('[Player] Inicializando Shaka Player para DASH...');
          if (!window.shaka) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/shaka-player.compiled.js';
              script.onload = resolve;
              script.onerror = () => reject(new Error('No se pudo cargar Shaka Player CDN'));
              document.head.appendChild(script);
            });
          }

          window.shaka.polyfill.installAll();
          if (window.shaka.Player.isBrowserSupported()) {
            const shakaPlayer = new window.shaka.Player(videoRef.current);
            shakaPlayerRef.current = shakaPlayer;

            if (drm && drm.clearKeys) {
              shakaPlayer.configure({
                drm: {
                  clearKeys: drm.clearKeys
                }
              });
            }

            // Configuraciones de rendimiento para evitar congelamientos y buffering
            shakaPlayer.configure({
              streaming: {
                bufferingGoal: 6,           // Cargar hasta 6 segundos por adelantado
                rebufferingGoal: 2,         // Reanudar la reproducción con solo 2 segundos de buffer
                bufferBehind: 10,           // Mantener 10 segundos de historial atrás en memoria
                lowLatencyMode: true,       // Modo de baja latencia para transmisiones en vivo
                retryParameters: {
                  maxAttempts: 5,           // Reintentar solicitudes de red fallidas hasta 5 veces
                  baseDelay: 1000,          // Retraso base de 1 segundo entre reintentos
                  backoffFactor: 2          // Multiplicar el retraso de reintento en cada fallo
                }
              }
            });

            // Filtro de red para saltar CORS en dispositivos móviles proxyando a través de Vercel
            shakaPlayer.getNetworkingEngine().registerRequestFilter((type, request) => {
              if (request.uris[0] && request.uris[0].includes('pv-cdn.net')) {
                const originalUrl = request.uris[0];
                request.uris[0] = `${BACKEND_URL}/api/proxy?url=${encodeURIComponent(originalUrl)}`;
              }
            });

            shakaPlayer.addEventListener('error', (event) => {
              console.error('Shaka Player error:', event.detail);
              triggerFailover();
            });

            await shakaPlayer.load(resolvedStreamUrl);
            videoRef.current.play().catch(err => {
              console.error("Auto-play prevented (DASH):", err);
              setIsPlaying(false);
            });
          } else {
            console.error('El navegador no soporta Shaka Player.');
            triggerFailover();
          }
        } catch (err) {
          console.error('Error cargando DASH en Shaka Player:', err);
          triggerFailover();
        }
        return;
      }

      let rawSource = resolvedStreamUrl || currentStreamUrl;
      const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const isNativeApp = Capacitor.isNativePlatform();

      // Si el stream es de Gambeta.vip, Vimeos (requiere Referer/Origin especial) o si es HTTP en web HTTPS, usar el proxy
      const needsProxy = rawSource.includes('gambeta.vip') || rawSource.includes('vimeos') || (!isNativeApp && rawSource.startsWith('http://') && isHttpsPage);

      const finalSource = (needsProxy && !rawSource.includes('api/proxy') && !rawSource.includes('api/gambeta'))
        ? `${BACKEND_URL}/api/proxy?url=${encodeURIComponent(rawSource)}`
        : rawSource;

      // HLS normal
      if (Hls.isSupported()) {
        console.log('[Player] Inicializando Hls.js optimizado para:', finalSource);
        hls = new Hls({
          maxBufferLength: 12,             // Buffer ligero de 12s para evitar saturar la cola de descargas
          maxMaxBufferLength: 24,          // Buffer máximo de 24s
          maxBufferHole: 0.3,              // Tolera pequeños huecos de 0.5s sin pausar
          enableWorker: true,
          lowLatencyMode: false,
          progressive: true,
          backBufferLength: 15,            // Mantener 15s en memoria trasera
          startLevel: -1,                  // Auto-seleccionar calidad según velocidad
          capLevelToPlayerSize: true,      // Ajustar resolución al tamaño del reproductor para máximo rendimiento
          liveSyncDurationCount: 3,        // Iniciar reproducción rápido con solo 2 segmentos de buffer
          liveMaxLatencyDurationCount: 8,  // Margen de latencia flexible
          manifestLoadingTimeOut: 15000,
          manifestLoadingMaxRetry: 5,
          manifestLoadingRetryDelay: 1000,
          levelLoadingTimeOut: 15000,
          levelLoadingMaxRetry: 4,
          fragLoadingTimeOut: 25000,
          fragLoadingMaxRetry: 8,
          fragLoadingRetryDelay: 1000,
        });
        
        hls.loadSource(finalSource);
        hls.attachMedia(videoRef.current);
        
        const safePlayVideo = (videoEl) => {
          if (!videoEl) return;
          videoEl.play()
            .then(() => {
              console.log('[Player] Reproducción iniciada con éxito.');
              setIsPlaying(true);
            })
            .catch((err) => {
              console.warn('[Player] Auto-play con audio prevenido por el navegador, intentando reproducción silenciada...', err.message);
              videoEl.muted = true;
              setIsMuted(true);
              videoEl.play()
                .then(() => {
                  console.log('[Player] Reproducción silenciada iniciada con éxito.');
                  setIsPlaying(true);
                })
                .catch((err2) => {
                  console.error('[Player] Auto-play falló totalmente:', err2.message);
                  setIsPlaying(false);
                  setShowControls(true);
                });
            });
        };

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('[Player] Manifest parsed con éxito, ocultando spinner y reproduciendo...');
          setIsLoadingServer(false);
          setIsResolvingVod(false);
          safePlayVideo(videoRef.current);
        });
        
        let networkRetryCount = 0;
        let mediaRetryCount = 0;
        let stallCount = 0;

        // Auto-reconectar si el video se congela (stall detection suave)
        // Solo actúa después de 5s congelado para no interrumpir buffering normal
        stallTimerRef.current = setInterval(() => {
          if (videoRef.current && !videoRef.current.paused && videoRef.current.readyState < 3) {
            stallCount++;
            if (stallCount >= 5) { // ~5 segundos congelado → reconectar suavemente
              console.log(`[Player] Stream congelado ${stallCount}s, recargando buffer...`);
              stallCount = 0;
              // Reconexión suave: solo reiniciar la carga sin saltar posición
              hls.startLoad(-1);
            }
          } else {
            stallCount = 0;
          }
        }, 1000);

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("[Player HLS Fatal Error]:", data);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              if (networkRetryCount < 2) {
                networkRetryCount++;
                console.log(`[Player] Reintentando conexión de red (${networkRetryCount}/2)...`);
                hls.startLoad();
              } else {
                clearInterval(stallTimerRef.current);
                triggerFailover();
              }
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              if (mediaRetryCount < 2) {
                mediaRetryCount++;
                console.log(`[Player] Recuperando error de media (${mediaRetryCount}/2)...`);
                hls.recoverMediaError();
              } else {
                clearInterval(stallTimerRef.current);
                triggerFailover();
              }
            } else {
              clearInterval(stallTimerRef.current);
              triggerFailover();
            }
          } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details === 'fragLoadError') {
            // Non-fatal fragment load error — auto-recover silently
            console.warn('[Player] Fragmento perdido, recuperando silenciosamente...');
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        console.log(`[Player] Cargando fuente HLS nativa en el móvil: ${finalSource}`);
        videoRef.current.src = finalSource;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setIsLoadingServer(false);
          setIsResolvingVod(false);
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('[Player Nativo] Reproducción iniciada con éxito.');
                setIsPlaying(true);
              })
              .catch(err => {
                console.warn('[Player Nativo] Auto-play prevenido, intentando silenciado...', err.message);
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  setIsMuted(true);
                  videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                    setIsPlaying(false);
                    setShowControls(true);
                  });
                }
              });
          }
        });
        videoRef.current.addEventListener('error', (err) => {
          console.error('[Player Nativo] Error de reproducción:', err);
          triggerFailover();
        });
      }
    };

    initPlayer();

    return () => {
      console.log('[Player] Destruyendo instancias de reproductor...');
      if (hls) {
        hls.destroy();
      }
      // Clear stall timer if exists
      if (stallTimerRef.current) {
        clearInterval(stallTimerRef.current);
      }
      if (shakaPlayerRef.current) {
        shakaPlayerRef.current.destroy();
        shakaPlayerRef.current = null;
      }
      ScreenOrientation.unlock().catch(() => {});
    };
  }, [resolvedStreamUrl, shouldUseIframeState, isResolvingVod]);

  // Handle Fullscreen Exit via system back or ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        ScreenOrientation.unlock().catch(() => {});
      } else {
        setIsFullscreen(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ── Detectar VOD vs Live y trackear progreso ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldUseIframeState) return;

    // Si no es VOD (TV en Vivo), no registrar listeners de barra de progreso ni sobrescribir isVod
    if (!isVod) return;

    const onLoadedMetadata = () => {
      const dur = video.duration;
      if (dur && isFinite(dur) && dur > 0) {
        setDuration(dur);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
      }
      // Buffer info
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const onDurationChange = () => {
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
    };
  }, [resolvedStreamUrl, shouldUseIframeState, isVod]);

  // Mouse/touch up global listener for seek drag
  useEffect(() => {
    const handleUp = () => setIsSeeking(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (shouldUseIframeState) return;
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !error && !isSeeking) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3500);
    } else {
      setShowControls(true);
    }
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [isPlaying, showControls, error, shouldUseIframeState, isSeeking]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('[Player] Error al dar play con audio, intentando silenciado:', err.message);
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullScreen = async (e) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen({ navigationUI: 'hide' });
        await ScreenOrientation.lock({ orientation: 'landscape' });
        setIsFullscreen(true);
      } catch (err) {
        console.error(`Error full-screen: ${err.message}`);
      }
    } else {
      try {
        await document.exitFullscreen();
        await ScreenOrientation.unlock();
        setIsFullscreen(false);
      } catch (err) {
        console.error(`Error exiting full-screen: ${err.message}`);
      }
    }
  };

  // ── Modo Iframe Directo (Sin cortinas ni temporizadores) ───
  const iframeSrc = resolvedStreamUrl || currentStreamUrl;
  const isCurrentApiUrl = isApiUrl(iframeSrc);

  if (shouldUseIframeState && !isResolvingVod && !isCurrentApiUrl) {

    return (
      <div className={`player-container ${isFullscreen ? 'is-fullscreen' : ''}`} ref={containerRef} onMouseMove={handleMouseMove} onClick={handleMouseMove}>
        {/* Loader ligero mientras carga la URL */}
        {isLoadingServer && (
          <div className="netflix-loader-container">
            <div className="netflix-spinner"></div>
            <p className="netflix-loader-text">Cargando servidor...</p>
            <p className="netflix-loader-subtitle">{channelName}</p>
          </div>
        )}

        {/* Header con botón de volver y cambiar servidor */}
        <div className={`player-overlay ${showControls ? 'show' : ''}`} style={{ pointerEvents: 'none' }}>
          <div className="player-header" style={{ pointerEvents: 'auto' }}>
            <button className="icon-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={32} />
            </button>
            <div className="player-title">
              <h2>{channelName}</h2>
              <p>{channelCategory} • Transmisión</p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {options && options.length > 0 && (
                <button className="btn-netflix-server" onClick={() => setShowServerMenu(!showServerMenu)}>
                  <Settings size={20} />
                  <span>Servidores ({activeOptionNume})</span>
                </button>
              )}
              
              <button className="icon-btn" onClick={toggleFullScreen}>
                <Maximize size={28} />
              </button>
            </div>
          </div>

          {/* Panel de servidores estilo Netflix glassmorphism */}
          {showServerMenu && (
            <div className="netflix-server-panel" style={{ pointerEvents: 'auto' }}>
              <div className="netflix-server-panel-header">
                <h3>Seleccionar Servidor</h3>
                <button onClick={() => setShowServerMenu(false)} className="close-panel-btn">
                  <X size={18} />
                </button>
              </div>
              <div className="netflix-server-list">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`netflix-server-item ${activeOptionNume === opt.nume ? 'active' : ''}`}
                    onClick={() => handleSwitchServer(opt)}
                  >
                    <div className="server-dot"></div>
                    <div className="server-info">
                      <span className="server-name">{opt.server}</span>
                      <span className="server-lang">{opt.lang}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <iframe
          src={iframeSrc}
          className="player-iframe"
          allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *; clipboard-write; web-share"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          frameBorder="0"
          scrolling="no"
          onLoad={() => {
            setIsLoadingServer(false);
            setIsResolvingVod(false);
          }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            border: 'none',
            zIndex: 1,
          }}
        />
        {/* Escudo Anti-Clic Inteligente (Compatible con Celulares y PC) */}
        <div
          className="ad-click-shield"
          onTouchStart={(e) => {
            const shield = e.currentTarget;
            shield.style.pointerEvents = 'none';
            setTimeout(() => {
              if (shield) shield.style.pointerEvents = 'auto';
            }, 4000);
          }}
          onMouseDown={(e) => {
            const shield = e.currentTarget;
            shield.style.pointerEvents = 'none';
            setTimeout(() => {
              if (shield) shield.style.pointerEvents = 'auto';
            }, 4000);
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            cursor: 'pointer',
            background: 'transparent',
          }}
        />
      </div>
    );
  }

  // ── Modo HLS Normal ────────────────────────────────────────
  return (
    <div className={`player-container ${isFullscreen ? 'is-fullscreen' : ''}`} ref={containerRef} onMouseMove={handleMouseMove} onClick={handleMouseMove}>
      {(isLoadingServer || isResolvingVod) && (
        <div className="netflix-loader-container" style={{ zIndex: 10 }}>
          <div className="netflix-spinner"></div>
          <p className="netflix-loader-text">
            {failoverMsg || (isResolvingVod ? 'Resolviendo fuente segura...' : 'Cargando contenido...')}
          </p>
          <p className="netflix-loader-subtitle">{channelName}</p>
        </div>
      )}

      {error ? (
        <div className="player-error">
          <AlertCircle size={48} color="#ff3366" />
          <h3>Señal Inestable o Interrumpida</h3>
          <p>Reconectando con la transmisión en vivo...</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
            <button
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              onClick={() => { setError(false); setIsLoadingServer(true); window.location.reload(); }}
            >
              Reintentar Conexión
            </button>
            <button
              className="btn-outline"
              style={{ borderRadius: '20px', padding: '10px 20px', fontSize: '0.9rem' }}
              onClick={() => navigate(-1)}
            >
              Volver a Canales
            </button>
          </div>
        </div>
      ) : (
        <video 
          ref={videoRef}
          className="mock-video" 
          autoPlay 
          playsInline
        />
      )}
      
      {!error && (
        <div className={`player-overlay ${showControls ? 'show' : ''}`}>
          
          {/* Top Controls */}
          <div className="player-header">
            <button className="icon-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={32} />
            </button>
            <div className="player-title">
              <h2>{channelName}</h2>
              <p>{channelCategory} • Transmisión en vivo</p>
            </div>
            <div style={{ width: 32 }}></div>
          </div>

          {/* Center Play/Pause + Skip Controls */}
          <div className="player-center">
            {isVod && (
              <button className="skip-btn skip-back" onClick={skipBackward} title="Retroceder 10s">
                <SkipBack size={32} />
                <span className="skip-label">10</span>
              </button>
            )}
            <button 
              className="play-pause-huge" 
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={64} /> : <Play fill="currentColor" size={64} />}
            </button>
            {isVod && (
              <button className="skip-btn skip-forward" onClick={skipForward} title="Adelantar 10s">
                <SkipForward size={32} />
                <span className="skip-label">10</span>
              </button>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="player-footer">
            {isVod ? (
              /* ── Barra de progreso estilo Netflix para VOD ── */
              <div className="vod-progress-wrapper">
                <span className="vod-time">{formatTime(currentTime)}</span>
                <div
                  className="vod-progress-bar"
                  ref={progressBarRef}
                  onMouseDown={handleProgressMouseDown}
                  onMouseMove={handleProgressMouseMove}
                  onMouseUp={handleProgressMouseUp}
                  onTouchStart={handleProgressTouchStart}
                  onTouchMove={handleProgressTouchMove}
                  onTouchEnd={handleProgressTouchEnd}
                >
                  {/* Buffer bar */}
                  <div
                    className="vod-progress-buffered"
                    style={{ width: duration > 0 ? `${(buffered / duration) * 100}%` : '0%' }}
                  />
                  {/* Progress bar */}
                  <div
                    className="vod-progress-fill"
                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                  >
                    <div className="vod-progress-thumb" />
                  </div>
                </div>
                <span className="vod-time">{formatTime(duration - currentTime)}</span>
              </div>
            ) : (
              /* ── Indicador EN VIVO para live ── */
              <div className="progress-container live-indicator">
                <div className="live-dot"></div>
                <span>EN VIVO</span>
              </div>
            )}

            <div className="controls-row">
              <div className="controls-left">
                <button className="icon-btn" onClick={togglePlay}>
                  {isPlaying ? <Pause size={28} /> : <Play fill="currentColor" size={28} />}
                </button>
                <button className="icon-btn" onClick={toggleMute}>
                  {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                </button>
              </div>

              <div className="controls-right">
                {isVod && options && options.length > 0 && (
                  <button className="btn-netflix-server" onClick={() => setShowServerMenu(!showServerMenu)}>
                    <Settings size={20} />
                    <span>Servidores ({activeOptionNume})</span>
                  </button>
                )}
                <button className="icon-btn" onClick={toggleFullScreen}><Maximize size={28} /></button>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

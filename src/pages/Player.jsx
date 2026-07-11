import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Maximize, Settings, Subtitles, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import Hls from 'hls.js';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import './Player.css';

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const streamUrl = location.state?.streamUrl || '';
  const channelName = location.state?.channelName || 'Live TV';
  const channelCategory = location.state?.category || 'En Vivo';
  const isIframe = location.state?.isIframe || false;

  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detectar si la URL debe reproducirse como iframe
  const shouldUseIframe = isIframe || 
    streamUrl.includes('.php') || 
    streamUrl.includes('ecuaplay') || 
    streamUrl.includes('tvhd2') ||
    streamUrl.includes('dailymotion.com') ||
    streamUrl.includes('youtube.com') ||
    streamUrl.includes('vimeo.com');

  useEffect(() => {
    // Si es un iframe, no necesitamos inicializar HLS
    if (shouldUseIframe) return;
    if (!streamUrl || !videoRef.current) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 5,
        maxMaxBufferLength: 10,
        maxBufferSize: 3 * 1000 * 1000,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 4,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 0,
        startLevel: -1,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play().catch(err => {
          console.error("Auto-play prevented:", err);
          setIsPlaying(false);
        });
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS fatal error:", data);
          setError(true);
        }
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Para Safari / iOS
      videoRef.current.src = streamUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play().catch(err => {
          console.error("Auto-play prevented:", err);
          setIsPlaying(false);
        });
      });
      videoRef.current.addEventListener('error', () => {
        setError(true);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      ScreenOrientation.unlock().catch(() => {});
    };
  }, [streamUrl, shouldUseIframe]);

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

  // Auto-hide controls
  useEffect(() => {
    if (shouldUseIframe) return; // No auto-hide en modo iframe
    let timeout;
    if (isPlaying && !error) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls, error, shouldUseIframe]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  // ── Modo Iframe ────────────────────────────────────────────
  if (shouldUseIframe) {
    return (
      <div className={`player-container ${isFullscreen ? 'is-fullscreen' : ''}`} ref={containerRef}>
        {/* Header con botón de volver */}
        <div className="player-overlay show" style={{ pointerEvents: 'none' }}>
          <div className="player-header" style={{ pointerEvents: 'auto' }}>
            <button className="icon-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={32} />
            </button>
            <div className="player-title">
              <h2>{channelName}</h2>
              <p>{channelCategory} • Transmisión en vivo</p>
            </div>
            <button className="icon-btn" onClick={toggleFullScreen} style={{ pointerEvents: 'auto' }}>
              <Maximize size={28} />
            </button>
          </div>
        </div>

        {/* Iframe de reproducción — sin sandbox para compatibilidad total con reproductores embed */}
        <iframe
          src={streamUrl}
          className="player-iframe"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          frameBorder="0"
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
      </div>
    );
  }

  // ── Modo HLS Normal ────────────────────────────────────────
  return (
    <div className={`player-container ${isFullscreen ? 'is-fullscreen' : ''}`} ref={containerRef} onMouseMove={handleMouseMove} onClick={handleMouseMove}>
      {error ? (
        <div className="player-error">
          <AlertCircle size={48} color="#ff3366" />
          <h3>Señal no disponible</h3>
          <p>El stream de este canal está caído temporalmente.</p>
          <button className="back-btn-error" onClick={() => navigate(-1)}>Volver</button>
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

          {/* Center Play/Pause Overlay */}
          <div className="player-center">
            <button 
              className="play-pause-huge" 
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={64} /> : <Play fill="currentColor" size={64} />}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="player-footer">
            <div className="progress-container live-indicator">
              <div className="live-dot"></div>
              <span>EN VIVO</span>
            </div>

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
                <button className="icon-btn"><Settings size={28} /></button>
                <button className="icon-btn" onClick={toggleFullScreen}><Maximize size={28} /></button>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

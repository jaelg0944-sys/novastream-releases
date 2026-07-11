import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import { Play, Heart, AlertCircle, Loader, Tv } from 'lucide-react';
import { fetchIPTVData, resolveStream } from '../services/iptvService';
import { Browser } from '@capacitor/browser';
import './LiveTV.css';

export default function LiveTV() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(() => {
    return sessionStorage.getItem('novastream_active_category') || 'Todos';
  });
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  // Caché temporal de URLs pre-resueltas
  const [preResolvedCache, setPreResolvedCache] = useState({});

  const categories = [
    'Todos', 'Nacionales', 'Deportes', 'Cine', 'Series', 'Novelas',
    'Anime', 'Infantil', 'Noticias', 'Música', 'Comedia', 'Reality',
    'Documentales', 'Entretenimiento', 'Retro', 'Estilo de Vida'
  ];

  // Cargar canales al montar el componente
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchIPTVData();
        setChannels(data);
        if (data.length > 0) {
          const savedCat = sessionStorage.getItem('novastream_active_category') || 'Todos';
          const filtered = savedCat === 'Todos' ? data : data.filter(c => c.category === savedCat);
          setSelectedChannel(filtered.length > 0 ? filtered[0] : data[0]);
        }
      } catch (err) {
        console.error('Error cargando canales:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Pre-resolver en segundo plano ──────────────────────────
  // Cuando se selecciona un canal, intenta pre-resolver su URL
  // con un retraso de 300ms para evitar peticiones innecesarias
  useEffect(() => {
    if (!selectedChannel) return;

    // Si ya tenemos una URL pre-resuelta válida (menos de 45 segundos), no re-resolver
    if (preResolvedCache[selectedChannel.id]) {
      const cached = preResolvedCache[selectedChannel.id];
      if (Date.now() - cached.timestamp < 45000) return;
    }

    const timeout = setTimeout(async () => {
      const channel = selectedChannel;
      try {
        if (channel.resolveType) {
          // Marcar como resolviendo
          setPreResolvedCache(prev => ({
            ...prev,
            [channel.id]: { url: '', timestamp: Date.now(), isResolving: true },
          }));

          const resolvedUrl = await resolveStream(channel.resolveType, channel.streamUrl);

          setPreResolvedCache(prev => ({
            ...prev,
            [channel.id]: { url: resolvedUrl, timestamp: Date.now(), isResolving: false },
          }));
        } else if (channel.streamUrl) {
          setPreResolvedCache(prev => ({
            ...prev,
            [channel.id]: { url: channel.streamUrl, timestamp: Date.now(), isResolving: false },
          }));
        }
      } catch (err) {
        console.warn(`[Pre-Resolver] Error al pre-resolver ${channel.name}:`, err);
        // Eliminar entrada fallida de la caché
        setPreResolvedCache(prev => {
          const copy = { ...prev };
          delete copy[channel.id];
          return copy;
        });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedChannel, preResolvedCache]);

  // Filtrar canales por categoría activa
  const activeChannels = activeCategory === 'Todos'
    ? channels
    : channels.filter(c => c.category === activeCategory);

  // ── Reproducir canal ───────────────────────────────────────
  const handlePlay = async (channel) => {
    const ch = channel || selectedChannel;
    if (!ch) return;

    // Verificar si hay un enlace pre-resuelto en caché
    const cached = preResolvedCache[ch.id];
    if (cached && cached.url && Date.now() - cached.timestamp < 45000) {
      const url = cached.url;
      if (url.includes('.php') || url.includes('tvhd2.com')) {
        await Browser.open({ url });
        return;
      }
      navigate('/player', {
        state: { streamUrl: url, channelName: ch.name, category: ch.category },
      });
      return;
    }

    // Si no hay caché, resolver en tiempo real
    setResolvingId(ch.id);
    try {
      let finalUrl = ch.streamUrl;
      if (ch.resolveType) {
        finalUrl = await resolveStream(ch.resolveType, ch.streamUrl);
      }
      setResolvingId(null);

      if (finalUrl) {
        if (finalUrl.includes('.php') || finalUrl.includes('tvhd2.com')) {
          await Browser.open({ url: finalUrl });
          return;
        }
        navigate('/player', {
          state: { streamUrl: finalUrl, channelName: ch.name, category: ch.category },
        });
      }
    } catch (err) {
      console.error('Error al reproducir canal en tiempo real:', err);
      setResolvingId(null);
      alert('No se pudo conectar a la señal de este canal. Por favor, inténtalo de nuevo.');
    }
  };

  // Comportamiento de clic: si ya está seleccionado, reproducir; si no, seleccionar
  const handleChannelClick = (channel) => {
    if (selectedChannel?.id === channel.id) {
      handlePlay(channel);
    } else {
      setSelectedChannel(channel);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <MobileHeader />
      <main className="main-content live-tv-container">

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem', color: 'white' }}>
            <Loader size={48} className="spin" color="#ff3366" />
            <p>Cargando canales en vivo...</p>
          </div>
        ) : error ? (
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem', color: 'white' }}>
            <AlertCircle size={48} color="#ff3366" />
            <p>Error al cargar los canales. Intenta de nuevo más tarde.</p>
          </div>
        ) : (
          <>
            {/* Background Preview */}
            <div className="channel-preview-bg" style={{ backgroundImage: `url(${selectedChannel?.logo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
              <div className="preview-gradient"></div>
            </div>

            <div className="live-content animate-fade-in">
              <div className="top-preview-info">
                <span className="live-badge">EN VIVO</span>
                <h1 className="preview-channel-name">{selectedChannel?.name}</h1>
                <h2 className="preview-show-name">{selectedChannel?.category} • {selectedChannel?.country}</h2>
                <p className="preview-time">Transmisión 24/7</p>

                <div className="preview-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handlePlay()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    disabled={resolvingId !== null}
                  >
                    {resolvingId === selectedChannel?.id ? (
                      <>
                        <Loader size={20} className="spin" /> Conectando señal...
                      </>
                    ) : (
                      <>
                        <Play fill="currentColor" size={20} /> Ver Canal
                      </>
                    )}
                  </button>
                  <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
                    <Heart size={20} />
                  </button>
                </div>
              </div>

              <div className="epg-container">
                {/* Categorías */}
                <div className="epg-categories">
                  {categories.map(cat => {
                    const count = cat === 'Todos'
                      ? channels.length
                      : channels.filter(c => c.category === cat).length;

                    // No mostrar categorías vacías (excepto "Todos")
                    if (count === 0 && cat !== 'Todos') return null;

                    return (
                      <button
                        key={cat}
                        className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => {
                          setActiveCategory(cat);
                          sessionStorage.setItem('novastream_active_category', cat);
                          const newChannels = cat === 'Todos' ? channels : channels.filter(c => c.category === cat);
                          if (newChannels.length > 0) setSelectedChannel(newChannels[0]);
                        }}
                      >
                        {cat} <span className="cat-count">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Grilla de canales (diseño de tarjetas) */}
                <div className="channels-grid-container">
                  <div className="channels-grid">
                    {activeChannels.map(channel => (
                      <div
                        key={channel.id}
                        className={`channel-card ${selectedChannel?.id === channel.id ? 'selected' : ''} ${resolvingId === channel.id ? 'resolving' : ''}`}
                        onClick={() => handleChannelClick(channel)}
                      >
                        <div className="channel-card-logo">
                          {channel.logo ? (
                            <img
                              src={channel.logo}
                              alt={channel.name}
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="channel-card-fallback"
                            style={{ display: channel.logo ? 'none' : 'flex' }}
                          >
                            <Tv size={28} />
                          </div>
                        </div>
                        <div className="channel-card-info">
                          <span className="channel-card-name">{channel.name}</span>
                          <span className="channel-card-cat">{channel.category}</span>
                        </div>
                        {resolvingId === channel.id && (
                          <div className="channel-card-loading">
                            <Loader size={20} className="spin" />
                          </div>
                        )}
                        {selectedChannel?.id === channel.id && resolvingId !== channel.id && (
                          <div className="channel-card-play">
                            <Play size={16} fill="white" />
                          </div>
                        )}
                      </div>
                    ))}
                    {activeChannels.length === 0 && (
                      <div className="no-channels">No hay canales en esta categoría.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import { fetchAnimeCatalog } from '../services/animeService';
import { Search, Play, X, Server, Globe } from 'lucide-react';
import './Anime.css';

export default function Anime() {
  const navigate = useNavigate();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de Anime Seleccionado
  const [selectedAnime, setSelectedAnime] = useState(null);
  
  // Modal de Selección de Servidor para el Episodio
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  const [liveAnimeServers, setLiveAnimeServers] = useState([]);
  const [loadingAnimeServers, setLoadingAnimeServers] = useState(false);

  const defaultAnimeServers = [
    { nume: '1', name: 'Servidor 1: YourUpload (Latino)', lang: 'Latino', server: 'Servidor 1: YourUpload (Latino)' },
    { nume: '2', name: 'Servidor 2: Voe (Latino)', lang: 'Latino', server: 'Servidor 2: Voe (Latino)' },
    { nume: '3', name: 'Servidor 3: Okru (Latino)', lang: 'Latino', server: 'Servidor 3: Okru (Latino)' },
    { nume: '4', name: 'Servidor 4: Netu (Latino)', lang: 'Latino', server: 'Servidor 4: Netu (Latino)' },
  ];

  // Debounce para la búsqueda en tiempo real mientras el usuario escribe
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await fetchAnimeCatalog(searchQuery);
      setAnimes(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Al seleccionar un anime, cargar sus detalles completos y total de episodios reales
  const handleSelectAnime = async (anime) => {
    setSelectedAnime(anime);
    const animeSlug = anime.slug || anime.id;
    try {
      const res = await fetch(`https://novastream-resolver.vercel.app/api/anime?type=details&slug=${animeSlug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedAnime(prev => ({
            ...prev,
            synopsis: data.synopsis || prev.synopsis,
            episodesCount: data.episodesCount || prev.episodesCount || 12
          }));
        }
      }
    } catch (err) {
      console.warn('[Anime] Error cargando detalles:', err);
    }
  };

  // Al seleccionar episodio, cargar servidores reales del anime
  const handleSelectEpisode = async (anime, episodeNum) => {
    setSelectedEpisode(episodeNum);
    setLoadingAnimeServers(true);
    setLiveAnimeServers([]);

    const animeSlug = anime.slug || anime.id;
    try {
      const res = await fetch(`https://novastream-resolver.vercel.app/api/anime?slug=${animeSlug}&episode=${episodeNum}&action=servers`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.servers && data.servers.length > 0) {
          setLiveAnimeServers(data.servers);
        }
      }
    } catch (err) {
      console.warn('[Anime] Error cargando servidores en vivo:', err);
    } finally {
      setLoadingAnimeServers(false);
    }
  };

  // Iniciar reproducción conectada 100% con el servidor real del anime elegido
  const handleLaunchEpisodeWithServer = (anime, episodeNum, serverOption, availableList = null) => {
    const animeSlug = anime.slug || anime.id;
    const nume = serverOption.nume;
    
    // URL del resolver exclusivo de episodios de anime
    const initialStreamUrl = `https://novastream-resolver.vercel.app/api/anime?slug=${animeSlug}&episode=${episodeNum}&nume=${nume}`;

    const serversToPass = (availableList && availableList.length > 0 ? availableList : liveAnimeServers.length > 0 ? liveAnimeServers : defaultAnimeServers).map(s => ({
      nume: s.nume,
      server: s.server || s.name,
      lang: s.lang || 'Latino'
    }));

    setSelectedAnime(null);
    setSelectedEpisode(null);

    // Navegar al reproductor en Modo Iframe Servidor Directo
    navigate('/player', {
      state: {
        streamUrl: initialStreamUrl,
        seriesId: animeSlug,
        season: 1,
        episode: episodeNum,
        currentOptionNume: String(nume),
        channelName: `${anime.title} - Episodio ${episodeNum}`,
        category: `Anime (${serverOption.server || serverOption.name})`,
        isIframe: false,
        isVod: true,
        options: serversToPass
      }
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <MobileHeader />
      <main className="main-content anime-container">
        
        <div className="anime-header">
          <span className="anime-badge">Sección Animes Latino</span>
          <h1 className="anime-title">Catálogo Anime Audio Latino</h1>
          <p className="anime-subtitle">Elige tu anime favorito y selecciona el servidor de reproducción que prefieras</p>

          <div className="anime-search-bar" style={{ position: 'relative' }}>
            <Search size={18} color="#8a8a9e" />
            <input
              type="text"
              placeholder="Escribe el nombre de cualquier anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: searchQuery ? '40px' : '16px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>
            Buscando animes en tiempo real...
          </div>
        ) : animes.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>No se encontraron animes para "{searchQuery}"</p>

            <button
              style={{
                padding: '10px 24px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ff0055, #8c00ff)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
              onClick={() => setSearchQuery('')}
            >
              Ver Todo el Catálogo
            </button>
          </div>
        ) : (
          <div className="anime-grid">
            {animes.map(anime => (
              <div key={anime.id} className="anime-card" onClick={() => handleSelectAnime(anime)}>
                <div className="anime-poster-wrapper">
                  <img
                    src={anime.poster}
                    alt={anime.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21175-97w42aWf21X2.jpg';
                    }}
                  />
                  <span className="anime-card-badge">★ {anime.rating}</span>
                </div>
                <div className="anime-card-info">
                  <h3 className="anime-card-title">{anime.title}</h3>
                  <span className="anime-card-genre">{anime.genre}</span>
                  <button className="anime-play-btn">
                    <Play size={14} fill="currentColor" /> Ver Episodios
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Selección de Episodios */}
        {selectedAnime && !selectedEpisode && (
          <div className="anime-modal-overlay" onClick={() => setSelectedAnime(null)}>
            <div className="anime-modal" onClick={(e) => e.stopPropagation()}>
              <button className="anime-modal-close" onClick={() => setSelectedAnime(null)}>
                <X size={20} />
              </button>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <img
                  src={selectedAnime.poster}
                  alt={selectedAnime.title}
                  style={{ width: '110px', borderRadius: '12px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21175-97w42aWf21X2.jpg';
                  }}
                />
                <div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{selectedAnime.title}</h2>
                  <span className="anime-badge" style={{ fontSize: '0.7rem' }}>{selectedAnime.audio}</span>
                  <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                    {selectedAnime.synopsis}
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Selecciona el Episodio:</h3>
              <div className="episodes-grid" style={{ maxHeight: '45vh', overflowY: 'auto' }}>
                {Array.from({ length: selectedAnime.episodesCount || 12 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    className="episode-btn"
                    onClick={() => handleSelectEpisode(selectedAnime, num)}
                  >
                    <Play size={12} fill="currentColor" /> Ep. {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Selección de Servidor del Anime */}
        {selectedAnime && selectedEpisode && (
          <div className="anime-modal-overlay" onClick={() => setSelectedEpisode(null)}>
            <div className="anime-modal" onClick={(e) => e.stopPropagation()}>
              <button className="anime-modal-close" onClick={() => setSelectedEpisode(null)}>
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Server size={36} color="#ff0055" style={{ marginBottom: '8px' }} />
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.3rem' }}>{selectedAnime.title}</h2>
                <p style={{ color: '#ff0055', fontWeight: 'bold', margin: 0 }}>
                  Episodio {selectedEpisode} — Selecciona Servidor de Reproducción
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                {loadingAnimeServers ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Obteniendo servidores de anime en tiempo real...</p>
                  </div>
                ) : (liveAnimeServers.length > 0 ? liveAnimeServers : defaultAnimeServers).map((server) => (
                  <button
                    key={server.nume}
                    className="episode-btn"
                    style={{
                      padding: '14px',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleLaunchEpisodeWithServer(selectedAnime, selectedEpisode, server)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Globe size={18} color="#ff5588" />
                      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{server.server || server.name}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: '#ff0055', padding: '2px 8px', borderRadius: '12px' }}>
                      {server.lang || 'Latino'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

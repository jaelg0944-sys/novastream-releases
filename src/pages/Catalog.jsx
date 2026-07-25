import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import { Play, Film, Clapperboard, Loader, AlertCircle, X, List, Search, Star } from 'lucide-react';
import { customSeries, fetchRepelisCartelera, searchRepelis, fetchRepelisDetails, fetchMovieServers } from '../services/vodService';
import { resolveStream } from '../services/streamResolverService';
import './Catalog.css';

const GENRES = [
  { key: '', label: 'Todos' },
  { key: 'Action', label: 'Acción' },
  { key: 'Animation', label: 'Animación' },
  { key: 'Adventure', label: 'Aventura' },
  { key: 'Sci-Fi', label: 'Ciencia Ficción' },
  { key: 'Comedy', label: 'Comedia' },
  { key: 'Crime', label: 'Crimen' },
  { key: 'Documentary', label: 'Documental' },
  { key: 'Drama', label: 'Drama' },
  { key: 'Family', label: 'Familia' },
  { key: 'Fantasy', label: 'Fantasía' },
  { key: 'History', label: 'Historia' },
  { key: 'Mystery', label: 'Misterio' },
  { key: 'Romance', label: 'Romance' },
  { key: 'Thriller', label: 'Suspenso' },
  { key: 'Horror', label: 'Terror' }
];

export default function Catalog() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('novastream_catalog_active_tab') || 'peliculas';
  });
  const [activeCatalog, setActiveCatalog] = useState(() => {
    return sessionStorage.getItem('novastream_catalog_active_catalog') || 'top';
  });
  const [activeGenre, setActiveGenre] = useState(() => {
    return sessionStorage.getItem('novastream_catalog_active_genre') || '';
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return sessionStorage.getItem('novastream_catalog_search_query') || '';
  });
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modales de detalles/reproducción
  const [selectedSeries, setSelectedSeries] = useState(() => {
    const saved = sessionStorage.getItem('novastream_catalog_selected_series');
    sessionStorage.removeItem('novastream_catalog_selected_series');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedMovieForServerSelect, setSelectedMovieForServerSelect] = useState(null);
  const [movieServers, setMovieServers] = useState([]);
  const [loadingServers, setLoadingServers] = useState(false);

  // Abrir reproductor con el servidor e idioma elegido por el usuario
  const handleLaunchPlayerWithServer = (item, nume, serverName, serverList = null) => {
    sessionStorage.setItem('novastream_catalog_active_tab', activeTab);
    sessionStorage.setItem('novastream_catalog_search_query', searchQuery);

    const postId = item.postId || item.id;
    const initialStreamUrl = `https://novastream-resolver.vercel.app/api/stream?post=${postId}&nume=${nume}&type=movie`;

    // Construir lista de opciones para el panel de servidores del player
    const availableServers = (serverList && serverList.length > 0 ? serverList : movieServers && movieServers.length > 0 ? movieServers : null) || [
      { nume: '1', server: 'Vimeos (Español Latino)', lang: 'Latino', flag: '🇲🇽' },
      { nume: '2', server: 'Streamwish (Español Latino)', lang: 'Latino', flag: '🇲🇽' },
      { nume: '3', server: 'Filemoon (Español Latino)', lang: 'Latino', flag: '🇲🇽' },
      { nume: '4', server: 'Vidhide (Español Latino)', lang: 'Latino', flag: '🇲🇽' },
      { nume: '7', server: 'Streamwish (Castellano)', lang: 'Castellano', flag: '🇪🇸' },
      { nume: '12', server: 'Streamwish (Subtitulado)', lang: 'Subtitulado', flag: '🇺🇸' },
    ];

    const playerOptions = availableServers.map(s => ({
      nume: s.nume,
      server: s.server,
      lang: s.lang || s.server,
    }));

    setSelectedMovieForServerSelect(null);

    navigate('/player', {
      state: {
        streamUrl: initialStreamUrl,
        post: postId,
        tmdbId: item.id,
        currentOptionNume: String(nume),
        channelName: item.title,
        category: `Película (${serverName})`,
        isIframe: false,
        isVod: true,
        options: playerOptions,
      }
    });
  };


  // Cargar cartelera
  const loadCartelera = async (tab, query = '') => {
    setLoading(true);
    setError(false);
    try {
      if (query.trim() !== '') {
        // Buscar en todo el catálogo
        const results = await searchRepelis(query);
        const filtered = results.filter(item => {
          if (tab === 'peliculas') return item.type === 'movie';
          return item.type === 'series';
        });
        
        if (tab === 'series') {
          const matchedCustom = customSeries.filter(s => 
            s.title.toLowerCase().includes(query.toLowerCase()) || 
            s.description.toLowerCase().includes(query.toLowerCase())
          );
          setItems([...matchedCustom, ...filtered]);
        } else {
          setItems(filtered);
        }
      } else {
        // Cargar cartelera normal
        const type = tab === 'peliculas' ? 'pelicula' : 'serie';
        const data = await fetchRepelisCartelera(type, activeCatalog, activeGenre, 1);
        
        if (tab === 'series') {
          // Unir series custom locales al inicio de las series de repelis
          setItems([...customSeries, ...data]);
        } else {
          setItems(data);
        }
      }
    } catch (err) {
      console.error("Error cargando catálogo:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda instantánea en tiempo real mientras el usuario escribe
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCartelera(activeTab, searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, activeCatalog, activeGenre, searchQuery]);

  // Manejar el submit de la búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('novastream_catalog_search_query', searchQuery);
    loadCartelera(activeTab, searchQuery);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchQuery('');
    sessionStorage.removeItem('novastream_catalog_search_query');
    loadCartelera(activeTab, '');
  };

  // Click en ítem del catálogo
  const handleItemClick = async (item) => {
    // Caso 1: Serie personalizada con episodios pre-cargados
    if (item.type === 'series' && item.episodes) {
      setSelectedSeries(item);
      return;
    }

    // Caso 2: Serie de Repelis24
    if (item.type === 'series' || item.type === 'tv') {
      setLoadingDetail(true);
      try {
        const details = await fetchRepelisDetails(item.id, item.type, item.url);
        if (details && details.episodes && details.episodes.length > 0) {
          setSelectedSeries(details);
        } else {
          handleLaunchPlayerWithServer(item, '1', 'Vimeos (Español Latino)');
        }
      } catch (err) {
        console.error('[Catalog] Error al cargar detalles:', err);
      } finally {
        setLoadingDetail(false);
      }
      return;
    }

    // Caso 3: Película → Cargar Servidores en Tiempo Real y Abrir Modal
    const postId = item.postId || item.id;
    setSelectedMovieForServerSelect(item);
    setLoadingServers(true);
    setMovieServers([]);
    try {
      const liveServers = await fetchMovieServers(postId);
      if (liveServers && liveServers.length > 0) {
        setMovieServers(liveServers);
      }
    } catch (err) {
      console.warn('[Catalog] Error cargando servidores en vivo:', err);
    } finally {
      setLoadingServers(false);
    }
  };

  // Reproducir un episodio — Navegación INSTANTÁNEA
  const handlePlayEpisode = async (episode, seriesTitle, seriesId) => {
    sessionStorage.setItem('novastream_catalog_selected_series', JSON.stringify(selectedSeries));
    sessionStorage.setItem('novastream_catalog_active_tab', activeTab);
    sessionStorage.setItem('novastream_catalog_search_query', searchQuery);

    navigate('/player', {
      state: {
        streamUrl: episode.streamUrl,
        seriesId: seriesId,
        season: episode.season,
        episode: episode.number,
        channelName: `${seriesTitle} - ${episode.title}`,
        category: 'Series',
        isIframe: episode.isIframe !== false,
        isVod: true
      }
    });
  };



  return (
    <div className="app-layout">
      <Sidebar />
      <MobileHeader />
      <main className="main-content catalog-container">

        <div className="catalog-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>Catálogo</h1>
            <div className="catalog-tabs">
              <button
                className={`catalog-tab ${activeTab === 'peliculas' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('peliculas');
                  sessionStorage.setItem('novastream_catalog_active_tab', 'peliculas');
                }}
              >
                <Film size={18} /> Películas
              </button>
              <button
                className={`catalog-tab ${activeTab === 'series' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('series');
                  sessionStorage.setItem('novastream_catalog_active_tab', 'series');
                }}
              >
                <Clapperboard size={18} /> Series
              </button>
            </div>
            <div className="catalog-sub-tabs">
              <button
                className={`catalog-sub-tab ${activeCatalog === 'top' ? 'active' : ''}`}
                onClick={() => {
                  setActiveCatalog('top');
                  sessionStorage.setItem('novastream_catalog_active_catalog', 'top');
                }}
              >
                Tendencias
              </button>
              <button
                className={`catalog-sub-tab ${activeCatalog === 'imdbRating' ? 'active' : ''}`}
                onClick={() => {
                  setActiveCatalog('imdbRating');
                  sessionStorage.setItem('novastream_catalog_active_catalog', 'imdbRating');
                }}
              >
                Más Valoradas
              </button>
              <button
                className={`catalog-sub-tab ${activeCatalog === 'year' ? 'active' : ''}`}
                onClick={() => {
                  setActiveCatalog('year');
                  sessionStorage.setItem('novastream_catalog_active_catalog', 'year');
                }}
              >
                Estrenos
              </button>
            </div>
            <div className="catalog-genres-scroll">
              {GENRES.map((g) => (
                <button
                  key={g.key}
                  className={`catalog-genre-pill ${activeGenre === g.key ? 'active' : ''}`}
                  onClick={() => {
                    setActiveGenre(g.key);
                    sessionStorage.setItem('novastream_catalog_active_genre', g.key);
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formulario de Búsqueda */}
          <form onSubmit={handleSearchSubmit} className="catalog-search-container">
            <Search size={18} className="catalog-search-icon" />
            <input
              type="text"
              placeholder={`Buscar en ${activeTab === 'peliculas' ? 'Películas' : 'Series'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalog-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} className="catalog-search-clear">
                <X size={18} />
              </button>
            )}
          </form>
        </div>

        {loading || loadingDetail ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: 'white', marginTop: '15vh' }}>
            <Loader size={48} className="spin" color="#ff3366" />
            <p>{loadingDetail ? 'Cargando servidores de video...' : 'Cargando catálogo de películas...'}</p>
          </div>
        ) : error ? (
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: 'white', marginTop: '15vh' }}>
            <AlertCircle size={48} color="#ff3366" />
            <p>Error de conexión al cargar la cartelera.</p>
            <button onClick={() => loadCartelera(activeTab, searchQuery)} className="btn-outline" style={{ marginTop: '10px', padding: '8px 20px', fontSize: '0.9rem' }}>Reintentar</button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: '#aaa', marginTop: '15vh' }}>
            <Search size={48} color="#555" />
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No se encontraron {activeTab === 'peliculas' ? 'películas' : 'series'} para "{searchQuery}"</p>
            <button onClick={handleClearSearch} className="btn-outline" style={{ padding: '10px 24px', fontSize: '0.9rem', borderRadius: '20px', background: 'linear-gradient(135deg, #ff0055, #8c00ff)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              Ver Todo el Catálogo
            </button>
          </div>
        ) : (
          <div className="catalog-grid animate-fade-in">
            {items.map(item => (
              <div key={item.id || item.url} className="catalog-card" onClick={() => handleItemClick(item)}>
                {item.rating && item.rating !== '0' && (
                  <div className="rating-tag">
                    <Star size={10} fill="currentColor" style={{ marginRight: '3px', display: 'inline-block', verticalAlign: 'middle' }} />
                    <span style={{ verticalAlign: 'middle' }}>{item.rating}</span>
                  </div>
                )}
                <img 
                  src={item.poster || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="320"><rect fill="%23222" width="220" height="320"/><text fill="%23666" font-size="14" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Sin Poster</text></svg>'} 
                  alt={item.title} 
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="320"><rect fill="%23222" width="220" height="320"/><text fill="%23666" font-size="14" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Sin Poster</text></svg>';
                  }}
                />
                <div className="catalog-card-overlay">
                  {item.episodes ? <List className="catalog-play-icon" size={36} /> : <Play className="catalog-play-icon" size={36} />}
                </div>
                <div className="catalog-card-info">
                  <h3>{item.title}</h3>
                  <span className="catalog-genre">
                    {item.episodes ? `${item.episodes.length} capítulos` : item.year || 'Ver online'}
                  </span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
               <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                 No se encontraron resultados para "{searchQuery}" en esta categoría.
               </div>
            )}
          </div>
        )}


        {/* ── Modal de episodios (Serie Custom Local) ── */}
        {selectedSeries && (
          <div className="episodes-modal-backdrop" onClick={() => setSelectedSeries(null)}>
            <div className="episodes-modal" onClick={(e) => e.stopPropagation()}>
              <div className="episodes-modal-header">
                <div className="episodes-modal-info">
                  <img src={selectedSeries.poster} alt={selectedSeries.title} className="episodes-poster" />
                  <div>
                    <h2>{selectedSeries.title}</h2>
                    <p className="episodes-desc">{selectedSeries.description}</p>
                    <span className="episodes-count">{selectedSeries.episodes.length} capítulos disponibles</span>
                  </div>
                </div>
                <button className="episodes-close" onClick={() => setSelectedSeries(null)}>
                  <X size={24} />
                </button>
              </div>
              <div className="episodes-list">
                {selectedSeries.episodes.map((ep, idx) => (
                  <div
                    key={idx}
                    className="episode-item"
                    onClick={() => {
                      handlePlayEpisode(ep, selectedSeries.title, selectedSeries.id);
                      setSelectedSeries(null);
                    }}
                  >
                    <div className="episode-number">{ep.season ? `T${ep.season}:E${ep.number}` : ep.number}</div>
                    <div className="episode-info">
                      <h4>{ep.title}</h4>
                    </div>
                    <Play size={22} className="episode-play" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Selección de Servidor e Idioma */}
        {selectedMovieForServerSelect && (
          <div className="server-modal-backdrop" onClick={() => setSelectedMovieForServerSelect(null)}>
            <div className="server-modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <button className="server-modal-close" onClick={() => setSelectedMovieForServerSelect(null)}>
                <X size={20} />
              </button>
              <div className="server-modal-header">
                <img src={selectedMovieForServerSelect.poster} alt={selectedMovieForServerSelect.title} className="server-modal-poster" />
                <div>
                  <h3>{selectedMovieForServerSelect.title}</h3>
                  <p className="server-modal-sub">Selecciona tu servidor e idioma preferido:</p>
                </div>
              </div>

              <div className="server-modal-options" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {loadingServers ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                    <Loader size={28} className="spin" color="#ff3366" style={{ margin: '0 auto 10px' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Obteniendo servidores en tiempo real...</p>
                  </div>
                ) : movieServers && movieServers.length > 0 ? (
                  movieServers.map((srv, idx) => (
                    <button
                      key={idx}
                      className={`server-option-btn ${idx === 0 ? 'primary' : ''}`}
                      onClick={() => handleLaunchPlayerWithServer(selectedMovieForServerSelect, srv.nume, srv.server)}
                    >
                      <span className="server-flag">{srv.flag || '🇲🇽'}</span>
                      <div className="server-opt-text">
                        <strong>{srv.server}</strong>
                        <small>{idx === 0 ? 'Servidor recomendado • Alta velocidad' : `Opción ${srv.nume}`}</small>
                      </div>
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      className="server-option-btn primary"
                      onClick={() => handleLaunchPlayerWithServer(selectedMovieForServerSelect, '1', 'Vimeos (Español Latino)')}
                    >
                      <span className="server-flag">🇲🇽</span>
                      <div className="server-opt-text">
                        <strong>Vimeos (Español Latino)</strong>
                        <small>Recomendado • Alta velocidad HD</small>
                      </div>
                    </button>

                    <button
                      className="server-option-btn"
                      onClick={() => handleLaunchPlayerWithServer(selectedMovieForServerSelect, '2', 'Streamwish (Español Latino)')}
                    >
                      <span className="server-flag">🇲🇽</span>
                      <div className="server-opt-text">
                        <strong>Streamwish (Español Latino)</strong>
                        <small>Servidor 2 Latino</small>
                      </div>
                    </button>

                    <button
                      className="server-option-btn"
                      onClick={() => handleLaunchPlayerWithServer(selectedMovieForServerSelect, '3', 'Filemoon (Español Latino)')}
                    >
                      <span className="server-flag">🇲🇽</span>
                      <div className="server-opt-text">
                        <strong>Filemoon (Español Latino)</strong>
                        <small>Servidor 3 Latino</small>
                      </div>
                    </button>

                    <button
                      className="server-option-btn"
                      onClick={() => handleLaunchPlayerWithServer(selectedMovieForServerSelect, '4', 'Vidhide (Español Latino)')}
                    >
                      <span className="server-flag">🇲🇽</span>
                      <div className="server-opt-text">
                        <strong>Vidhide (Español Latino)</strong>
                        <small>Servidor 4 Latino</small>
                      </div>
                    </button>

                    <button
                      className="server-option-btn"
                      onClick={() => handleLaunchPlayerWithServer(selectedMovieForServerSelect, '7', 'Streamwish (Castellano)')}
                    >
                      <span className="server-flag">🇪🇸</span>
                      <div className="server-opt-text">
                        <strong>Streamwish (Castellano)</strong>
                        <small>Audio en Español España</small>
                      </div>
                    </button>

                    <button
                      className="server-option-btn"
                      onClick={() => handleLaunchPlayerWithServer(selectedMovieForServerSelect, '12', 'Streamwish (Subtitulado)')}
                    >
                      <span className="server-flag">🇺🇸</span>
                      <div className="server-opt-text">
                        <strong>Streamwish (Subtitulado)</strong>
                        <small>Audio original con subtítulos</small>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

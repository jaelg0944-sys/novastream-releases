import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import { Play, Film, Clapperboard, Loader, AlertCircle, X, List, Search, Star } from 'lucide-react';
import { customSeries, fetchRepelisCartelera, searchRepelis, fetchRepelisDetails, fetchRepelisEmbed } from '../services/vodService';
import './Catalog.css';

export default function Catalog() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('novastream_catalog_active_tab') || 'peliculas';
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
  const [selectedRepelisItem, setSelectedRepelisItem] = useState(() => {
    const saved = sessionStorage.getItem('novastream_catalog_selected_repelis_item');
    sessionStorage.removeItem('novastream_catalog_selected_repelis_item');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [resolvingEmbed, setResolvingEmbed] = useState(false);

  const handleCloseRepelisModal = () => {
    setSelectedRepelisItem(null);
    const savedSeries = sessionStorage.getItem('novastream_catalog_selected_series');
    if (savedSeries) {
      setSelectedSeries(JSON.parse(savedSeries));
      sessionStorage.removeItem('novastream_catalog_selected_series');
    }
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
        const data = await fetchRepelisCartelera(type, 1);
        
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

  useEffect(() => {
    loadCartelera(activeTab, searchQuery);
  }, [activeTab]);

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

  // Clic en tarjeta de catálogo
  const handleItemClick = async (item) => {
    // Caso 1: Serie local custom
    if (item.episodes && item.episodes.length > 0) {
      setSelectedSeries(item);
      return;
    }

    // Caso 2: Película o serie de Repelis24
    setLoadingDetail(true);
    try {
      console.log(`[Catalog] Cargando detalles de Repelis24: ${item.title}`);
      const details = await fetchRepelisDetails(item.url);
      if (details) {
        setSelectedRepelisItem({
          ...item,
          postId: details.postId,
          description: details.description || item.description || 'Sin sinopsis disponible.',
          options: details.options || []
        });
      } else {
        alert('No se pudieron obtener las fuentes de reproducción para esta película.');
      }
    } catch (err) {
      console.error('[Catalog] Error al cargar detalles:', err);
      alert('Error de conexión al cargar la película.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Reproducir un episodio (soporta HLS directo e iframe)
  const handlePlayEpisode = (episode, seriesTitle) => {
    sessionStorage.setItem('novastream_catalog_selected_series', JSON.stringify(selectedSeries));
    sessionStorage.setItem('novastream_catalog_active_tab', activeTab);
    sessionStorage.setItem('novastream_catalog_search_query', searchQuery);

    navigate('/player', { 
      state: { 
        streamUrl: episode.streamUrl,
        channelName: `${seriesTitle} - ${episode.title}`,
        category: 'Series',
        isIframe: episode.isIframe || false
      } 
    });
  };

  // Seleccionar servidor y reproducir en Repelis24
  const handlePlayServer = async (opt) => {
    setResolvingEmbed(true);
    try {
      console.log(`[Catalog] Resolviendo enlace embed para: ${selectedRepelisItem.title} en ${opt.server}`);
      const embedUrl = await fetchRepelisEmbed(opt.post, opt.type, opt.nume);
      setResolvingEmbed(false);

      if (embedUrl) {
        sessionStorage.setItem('novastream_catalog_selected_repelis_item', JSON.stringify(selectedRepelisItem));
        sessionStorage.setItem('novastream_catalog_active_tab', activeTab);
        sessionStorage.setItem('novastream_catalog_search_query', searchQuery);

        navigate('/player', {
          state: {
            streamUrl: embedUrl,
            channelName: selectedRepelisItem.title,
            category: activeTab === 'peliculas' ? 'Películas' : 'Series',
            isIframe: true, // Forzar modo Iframe en el Player
            options: selectedRepelisItem.options,
            currentOptionNume: opt.nume
          }
        });
      } else {
        alert('Este servidor no está disponible actualmente. Por favor, elige otro.');
      }
    } catch (err) {
      console.error('[Catalog] Error resolviendo embed:', err);
      setResolvingEmbed(false);
      alert('Error al conectar con el servidor de reproducción.');
    }
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

        {/* ── Modal de Servidores (Repelis24) ── */}
        {selectedRepelisItem && (
          <div className="episodes-modal-backdrop" onClick={() => !resolvingEmbed && handleCloseRepelisModal()}>
            <div className="episodes-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
              
              {resolvingEmbed && (
                <div className="resolving-overlay">
                  <Loader size={36} className="spin" color="#ff3366" />
                  <p>Resolviendo enlace seguro...</p>
                </div>
              )}

              <div className="episodes-modal-header">
                <div className="episodes-modal-info">
                  <img 
                    src={selectedRepelisItem.poster || ''} 
                    alt={selectedRepelisItem.title} 
                    className="episodes-poster" 
                  />
                  <div>
                    <h2>{selectedRepelisItem.title}</h2>
                    <p className="episodes-desc" style={{ WebkitLineClamp: 3 }}>{selectedRepelisItem.description}</p>
                    <span className="episodes-count">{selectedRepelisItem.year} • HD disponible</span>
                  </div>
                </div>
                <button className="episodes-close" onClick={() => handleCloseRepelisModal()} disabled={resolvingEmbed}>
                  <X size={24} />
                </button>
              </div>

              <div className="episodes-list" style={{ padding: '20px' }}>
                <h3 className="servers-title">Reproducir en Servidor:</h3>
                
                {selectedRepelisItem.options && selectedRepelisItem.options.length > 0 ? (
                  <>
                    <div className="servers-grid">
                      {selectedRepelisItem.options.map((opt, idx) => {
                        const cleanLang = opt.lang.toLowerCase();
                        const badgeClass = cleanLang.includes('latino') ? 'latino' : cleanLang.includes('sub') ? 'subtitulado' : 'castellano';
                        
                        return (
                          <button
                            key={idx}
                            className="server-btn"
                            onClick={() => handlePlayServer(opt)}
                            disabled={resolvingEmbed}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Play size={12} fill="white" />
                              {opt.server}
                            </span>
                            <span className={`server-lang-tag ${badgeClass}`}>{opt.lang}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>
                    No hay servidores disponibles para este video actualmente.
                  </p>
                )}
              </div>
            </div>
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
                      if (selectedSeries.id === 'custom-asi-aprenderas') {
                        handlePlayEpisode(ep, selectedSeries.title);
                      } else {
                        // Catalog series: show server selection
                        setSelectedRepelisItem({
                          title: `${selectedSeries.title} - ${ep.title}`,
                          poster: selectedSeries.poster,
                          description: selectedSeries.description,
                          year: selectedSeries.year,
                          options: [
                            {
                              nume: '1',
                              type: `https://vidsrcme.ru/embed/tv?tmdb=${selectedSeries.id}&season=${ep.season}&episode=${ep.number}`,
                              post: selectedSeries.id,
                              server: 'Servidor 1 (vidsrc.me)',
                              lang: 'Latino / Multi-idioma',
                              embedUrl: `https://vidsrcme.ru/embed/tv?tmdb=${selectedSeries.id}&season=${ep.season}&episode=${ep.number}`
                            },
                            {
                              nume: '2',
                              type: `https://www.2embed.cc/embedtv/${selectedSeries.id}&s=${ep.season}&e=${ep.number}`,
                              post: selectedSeries.id,
                              server: 'Servidor 2 (2embed)',
                              lang: 'Latino / Multi-idioma',
                              embedUrl: `https://www.2embed.cc/embedtv/${selectedSeries.id}&s=${ep.season}&e=${ep.number}`
                            },
                            {
                              nume: '3',
                              type: `https://multiembed.mov/?video_id=${selectedSeries.id}&tmdb=1&s=${ep.season}&e=${ep.number}`,
                              post: selectedSeries.id,
                              server: 'Servidor 3 (Multiembed)',
                              lang: 'Latino / Multi-idioma',
                              embedUrl: `https://multiembed.mov/?video_id=${selectedSeries.id}&tmdb=1&s=${ep.season}&e=${ep.number}`
                            },
                            {
                              nume: '4',
                              type: `https://vidsrc.to/embed/tv/${selectedSeries.id}/${ep.season}/${ep.number}`,
                              post: selectedSeries.id,
                              server: 'Servidor 4 (vidsrc.to)',
                              lang: 'Latino / Multi-idioma',
                              embedUrl: `https://vidsrc.to/embed/tv/${selectedSeries.id}/${ep.season}/${ep.number}`
                            }
                          ]
                        });
                        setSelectedSeries(null); // Cerrar modal de episodios para ver el de servidores
                      }
                    }}
                  >
                    <div className="episode-number">{ep.number}</div>
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

      </main>
    </div>
  );
}

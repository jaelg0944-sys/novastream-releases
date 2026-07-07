import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import { Play, Film, Clapperboard, Loader, AlertCircle, X, List } from 'lucide-react';
import { fetchVODData } from '../services/vodService';
import './Catalog.css';

export default function Catalog() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('peliculas');
  
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchVODData();
        setMovies(data.movies || []);
        setSeries(data.series || []);
      } catch (err) {
        console.error("Error cargando catálogo:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const items = activeTab === 'peliculas' ? movies : series;

  const handlePlay = (item) => {
    // Si la serie tiene episodios, mostrar selector
    if (item.episodes && item.episodes.length > 0) {
      setSelectedSeries(item);
      return;
    }
    navigate('/player', { 
      state: { 
        streamUrl: item.streamUrl,
        channelName: item.title,
        category: item.category
      } 
    });
  };

  const handlePlayEpisode = (episode, seriesTitle) => {
    navigate('/player', { 
      state: { 
        streamUrl: episode.streamUrl,
        channelName: `${seriesTitle} - ${episode.title}`,
        category: 'Series'
      } 
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <MobileHeader />
      <main className="main-content catalog-container">

        <div className="catalog-header animate-fade-in">
          <h1>Catálogo</h1>
          <div className="catalog-tabs">
            <button
              className={`catalog-tab ${activeTab === 'peliculas' ? 'active' : ''}`}
              onClick={() => setActiveTab('peliculas')}
            >
              <Film size={18} /> Películas
            </button>
            <button
              className={`catalog-tab ${activeTab === 'series' ? 'active' : ''}`}
              onClick={() => setActiveTab('series')}
            >
              <Clapperboard size={18} /> Series
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: 'white', marginTop: '10vh' }}>
            <Loader size={48} className="spin" color="#ff3366" />
            <p>Cargando catálogo...</p>
          </div>
        ) : error ? (
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: 'white', marginTop: '10vh' }}>
            <AlertCircle size={48} color="#ff3366" />
            <p>Error al cargar el catálogo.</p>
          </div>
        ) : (
          <div className="catalog-grid animate-fade-in">
            {items.map(item => (
              <div key={item.id} className="catalog-card" onClick={() => handlePlay(item)}>
                <img src={item.poster} alt={item.title} />
                <div className="catalog-card-overlay">
                  {item.episodes ? <List className="catalog-play-icon" size={36} /> : <Play className="catalog-play-icon" size={36} />}
                </div>
                <div className="catalog-card-info">
                  <h3>{item.title}</h3>
                  <span className="catalog-genre">
                    {item.episodes ? `${item.episodes.length} capítulos` : item.category}
                  </span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
               <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                 No hay contenido disponible en esta categoría.
               </div>
            )}
          </div>
        )}

        {/* Modal de episodios */}
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
                {selectedSeries.episodes.map((ep) => (
                  <div
                    key={ep.number}
                    className="episode-item"
                    onClick={() => handlePlayEpisode(ep, selectedSeries.title)}
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

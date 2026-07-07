import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import { Play, Info, Loader, AlertCircle, Heart, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchIPTVData, resolveStream } from '../services/iptvService';
import { Browser } from '@capacitor/browser';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchIPTVData();
        if (data.length > 0) {
          const featuredChannel = data[0];
          setFeatured(featuredChannel);
          setTrending(data.slice(0, 10));
          setSports(data.filter(c => c.category === 'Deportes').slice(0, 10));
        }
      } catch (err) {
        console.error('Error cargando Home:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [resolvingId, setResolvingId] = useState(null);

  const handlePlay = async (item) => {
    if (!item || !item.streamUrl) return;

    // Si el canal necesita resolución dinámica
    if (item.resolveType) {
      setResolvingId(item.id);
      try {
        console.log(`[Home] Resolviendo canal dinámico: ${item.name}`);
        const resolvedUrl = await resolveStream(item.resolveType, item.streamUrl);
        setResolvingId(null);

        if (resolvedUrl) {
          // Si es un enlace .php o tvhd2, abrir en el navegador externo
          if (resolvedUrl.includes('.php') || resolvedUrl.includes('tvtvhd.com')) {
            await Browser.open({ url: resolvedUrl });
            return;
          }
          navigate('/player', {
            state: {
              streamUrl: resolvedUrl,
              channelName: item.name,
              category: item.category,
            },
          });
        }
      } catch (err) {
        console.error('[Home] Error resolviendo stream:', err);
        setResolvingId(null);
        alert('No se pudo conectar a la señal en vivo. Por favor, intenta de nuevo.');
      }
    } else {
      // Enlace directo
      if (item.streamUrl.includes('.php') || item.streamUrl.includes('tvtvhd.com')) {
        await Browser.open({ url: item.streamUrl });
        return;
      }
      navigate('/player', {
        state: {
          streamUrl: item.streamUrl,
          channelName: item.name,
          category: item.category,
        },
      });
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <MobileHeader />
      <main className="main-content">

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem', color: 'white' }}>
            <Loader size={48} className="spin" color="#ff3366" />
            <p>Iniciando NovaStream...</p>
          </div>
        ) : error ? (
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem', color: 'white' }}>
            <AlertCircle size={48} color="#ff3366" />
            <p>Error de conexión.</p>
          </div>
        ) : (
          <>
            <div className="hero-banner" style={{ backgroundImage: `url(${featured?.logo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'right' }}>
              <div className="hero-gradient"></div>
              <div className="hero-content animate-fade-in">
                <span style={{ background: '#ff3366', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', display: 'inline-block' }}>DESTACADO EN VIVO</span>
                <h1 className="hero-title" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{featured?.name}</h1>
                <div className="hero-tags">
                  <span className="tag">{featured?.category}</span>
                  <span className="tag">{featured?.country}</span>
                </div>
                <p className="hero-desc">Disfruta de la mejor programación en vivo 24/7 de este canal.</p>
                <div className="hero-buttons">
                  <button className="btn-primary" onClick={() => handlePlay(featured)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play fill="currentColor" size={20} /> Reproducir
                  </button>
                  <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={20} /> Más Info
                  </button>
                </div>
              </div>
            </div>

            <div className="content-rows">
              <section className="content-row">
                <h2 className="row-title">Tendencias Ahora</h2>
                <div className="carousel">
                  {trending.map(item => (
                    <div key={item.id} className="carousel-item" onClick={() => handlePlay(item)}>
                      <img src={item.logo} alt={item.name} />
                      <div className="item-overlay">
                        <Play className="play-icon" size={40} />
                      </div>
                      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(0,0,0,0.8)', padding: '5px', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                         {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {sports.length > 0 && (
                <section className="content-row">
                  <h2 className="row-title">Deportes en Vivo</h2>
                  <div className="carousel">
                    {sports.map(item => (
                      <div key={item.id} className="carousel-item" onClick={() => handlePlay(item)}>
                        <img src={item.logo} alt={item.name} />
                        <div className="item-overlay">
                          <Play className="play-icon" size={40} />
                        </div>
                        <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(0,0,0,0.8)', padding: '5px', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                           {item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

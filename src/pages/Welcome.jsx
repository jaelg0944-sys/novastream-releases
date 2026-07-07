import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import { PlayCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Welcome() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      } else {
        setChecking(false);
      }
    };
    checkSession();
  }, [navigate]);

  if (checking) {
    return (
      <div className="welcome-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <PlayCircle className="logo-icon animate-fade-in" size={64} color="var(--primary-color)" />
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div className="background-overlay"></div>
      <div className="content-wrapper animate-fade-in">
        <div className="logo-container">
          <PlayCircle className="logo-icon" size={64} color="var(--primary-color)" />
          <h1 className="logo-text">NovaStream <span>TV</span></h1>
        </div>
        <p className="subtitle">Entretenimiento Premium Sin Límites</p>
        
        <div className="button-group">
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
          <button className="btn-outline" onClick={() => navigate('/login?mode=register')}>
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

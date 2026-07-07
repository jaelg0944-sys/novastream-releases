import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import {
  User, CreditCard, Smartphone, MonitorPlay, Crown,
  CalendarClock, Shield, LogOut, ChevronRight, Zap
} from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [autoPlay, setAutoPlay] = useState(true);
  const [quality, setQuality] = useState('auto');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario');
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="settings-layout app-layout">
      <Sidebar />
      <main className="settings-container">
        {/* Back button for mobile */}
        <button className="mobile-back-btn" onClick={() => navigate('/home')}>
          <ChevronRight size={22} style={{ transform: 'rotate(180deg)' }} />
        </button>

        <div className="settings-header animate-fade-in">
          <h1>Mi Cuenta</h1>
          <p>Gestiona tu perfil, suscripción y preferencias</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card animate-fade-in">
          <div className="profile-avatar">
            {getInitials(userName)}
          </div>
          <div className="profile-info">
            <h2>{userName}</h2>
            <p className="profile-email">{userEmail}</p>
            <span className="profile-badge active">
              <Zap size={14} /> Suscripción Activa
            </span>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="settings-section animate-fade-in">
          <div className="section-title">
            <Crown size={20} /> Suscripción
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Plan Actual</span>
            <span className="settings-row-value premium">Premium 4K</span>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Precio</span>
            <span className="settings-row-value highlight">$9.99 / mes</span>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Próxima Facturación</span>
            <span className="settings-row-value">
              <CalendarClock size={16} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.6 }} />
              28 Jun, 2026
            </span>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Método de Pago</span>
            <span className="settings-row-value">
              <CreditCard size={16} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.6 }} />
              •••• 4532
            </span>
          </div>
        </div>

        {/* Devices Section */}
        <div className="settings-section animate-fade-in">
          <div className="section-title">
            <Smartphone size={20} /> Dispositivos Conectados
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Pantallas en uso</span>
            <div className="device-bar">
              <div className="device-progress">
                <div className="device-progress-fill" style={{ width: '33%' }}></div>
              </div>
              <span className="device-count">1 de 3</span>
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Dispositivo actual</span>
            <span className="settings-row-value">
              <Smartphone size={14} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.6 }} />
              Android
            </span>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Máx. pantallas simultáneas</span>
            <span className="settings-row-value highlight">3</span>
          </div>
        </div>

        {/* Playback Preferences */}
        <div className="settings-section animate-fade-in">
          <div className="section-title">
            <MonitorPlay size={20} /> Preferencias de Reproducción
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Calidad de video</span>
            <select
              className="quality-select"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option value="auto">Auto</option>
              <option value="1080p">Full HD (1080p)</option>
              <option value="720p">HD (720p)</option>
              <option value="480p">SD (480p)</option>
            </select>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Reproducción automática</span>
            <button
              className={`toggle-switch ${autoPlay ? 'active' : ''}`}
              onClick={() => setAutoPlay(!autoPlay)}
            >
              <div className="toggle-knob"></div>
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="settings-section animate-fade-in">
          <div className="section-title">
            <Shield size={20} /> Seguridad
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Contraseña</span>
            <span className="settings-row-value" style={{ opacity: 0.5 }}>
              ••••••••
            </span>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Verificación en dos pasos</span>
            <span className="settings-row-value" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Próximamente
            </span>
          </div>
        </div>

        {/* Logout */}
        <button className="logout-btn animate-fade-in" onClick={handleLogout} disabled={loggingOut}>
          <LogOut size={22} />
          {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </button>

        <p className="app-version">NovaStream TV v1.1.0 (Actualización Inalámbrica) ✨</p>
      </main>
    </div>
  );
}

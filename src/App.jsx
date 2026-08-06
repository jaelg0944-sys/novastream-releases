import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Home from './pages/Home';
import LiveTV from './pages/LiveTV';
import Player from './pages/Player';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Catalog from './pages/Catalog';
import Anime from './pages/Anime';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { useOTAUpdater } from './hooks/useOTAUpdater';

function NotFound() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0b0b0f', color: 'white', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ fontSize: '3rem', margin: 0 }}>🚧</h1>
      <h2>Sección en Construcción</h2>
      <p style={{ color: '#888' }}>Esta sección estará disponible próximamente.</p>
      <button onClick={() => window.history.back()} style={{ background: '#ff3366', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>
        Volver
      </button>
    </div>
  );
}

function AppRoutes() {
  useAndroidBackButton();
  useOTAUpdater();

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/live" element={<LiveTV />} />
      <Route path="/player" element={<Player />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/anime" element={<Anime />} />
      <Route path="/search" element={<Navigate to="/catalog" />} />
      <Route path="/sports" element={<Navigate to="/live" />} />
      <Route path="/favorites" element={<Navigate to="/catalog" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

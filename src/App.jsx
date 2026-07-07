import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Home from './pages/Home';
import LiveTV from './pages/LiveTV';
import Player from './pages/Player';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Catalog from './pages/Catalog';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { useOTAUpdater } from './hooks/useOTAUpdater';

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

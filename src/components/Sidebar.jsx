import { NavLink } from 'react-router-dom';
import { Home, Tv, Film, Clapperboard, MonitorPlay, Heart, Search, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  // All items for desktop sidebar
  const allMenuItems = [
    { name: 'Buscar', icon: Search, path: '/search' },
    { name: 'Inicio', icon: Home, path: '/home' },
    { name: 'TV en Vivo', icon: Tv, path: '/live' },
    { name: 'Catálogo', icon: Film, path: '/catalog' },
    { name: 'Deportes', icon: MonitorPlay, path: '/sports' },
    { name: 'Favoritos', icon: Heart, path: '/favorites' },
  ];

  // Only essential items for mobile bottom bar (4 items max for better fit)
  const mobileMenuItems = [
    { name: 'Inicio', icon: Home, path: '/home' },
    { name: 'TV en Vivo', icon: Tv, path: '/live' },
    { name: 'Catálogo', icon: Film, path: '/catalog' },
    { name: 'Ajustes', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-initial">N</span>
      </div>
      
      {/* Desktop: all items */}
      <div className="menu-items desktop-menu">
        {allMenuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            title={item.name}
          >
            <item.icon size={24} />
            <span className="menu-text">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Mobile: only 5 essential items */}
      <div className="menu-items mobile-menu">
        {mobileMenuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            title={item.name}
          >
            <item.icon size={24} />
            <span className="menu-label">{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className="menu-item" title="Configuración">
          <Settings size={24} />
          <span className="menu-text">Ajustes</span>
        </NavLink>
      </div>
    </nav>
  );
}

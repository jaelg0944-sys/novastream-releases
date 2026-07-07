import { NavLink } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';
import './MobileHeader.css';

export default function MobileHeader() {
  return (
    <header className="mobile-header">
      <NavLink to="/search" className="header-icon-btn" title="Buscar">
        <Search size={22} />
      </NavLink>

      <div className="header-logo">
        <span className="header-logo-text">Nova<span>Stream</span></span>
      </div>

      <NavLink to="/settings" className="header-icon-btn" title="Mi Cuenta">
        <Settings size={22} />
      </NavLink>
    </header>
  );
}

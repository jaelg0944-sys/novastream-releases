import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Clapperboard, CreditCard, Settings, LogOut, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { title: 'Usuarios Totales', value: '12,450', trend: '+15%' },
    { title: 'Suscripciones Activas', value: '8,234', trend: '+5%' },
    { title: 'Ingresos Mensuales', value: '$16,468', trend: '+12%' },
  ];

  const mockUsers = [
    { id: '1', name: 'Carlos Mendoza', email: 'carlos@example.com', status: 'Activo', deviceCount: 1 },
    { id: '2', name: 'Ana Gómez', email: 'ana.g@example.com', status: 'Expirado', deviceCount: 0 },
    { id: '3', name: 'Luis Pérez', email: 'luis.perez@example.com', status: 'Bloqueado', deviceCount: 2 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="admin-fade-in">
            <h2 className="admin-page-title">Dashboard General</h2>
            <div className="stats-grid">
              {stats.map(stat => (
                <div key={stat.title} className="stat-card">
                  <h3>{stat.title}</h3>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-trend text-success">{stat.trend} este mes</div>
                </div>
              ))}
            </div>
            
            <div className="admin-card mt-4">
              <h3 className="card-title">Actividad Reciente</h3>
              <p className="text-muted">No hay actividad reciente para mostrar.</p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="admin-fade-in">
            <div className="admin-header-actions">
              <h2 className="admin-page-title">Gestión de Usuarios</h2>
              <button className="btn-primary-small"><Plus size={16}/> Nuevo Usuario</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Dispositivos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-badge ${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.deviceCount} / 1</td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn-small edit"><Edit size={16}/></button>
                          <button className="icon-btn-small delete"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="admin-fade-in">
            <div className="admin-header-actions">
              <h2 className="admin-page-title">Gestión de Contenido</h2>
              <button className="btn-primary-small"><Plus size={16}/> Agregar Contenido</button>
            </div>
            <div className="admin-card">
              <p className="text-muted">Aquí podrás gestionar tus listas M3U8, canales en vivo, películas y series.</p>
              
              <div className="mock-form mt-4">
                <div className="form-group">
                  <label>Título</label>
                  <input type="text" className="admin-input" placeholder="Ej: Fox Sports HD" />
                </div>
                <div className="form-group">
                  <label>URL del Stream (M3U8 / HLS)</label>
                  <input type="text" className="admin-input" placeholder="http://..." />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select className="admin-input">
                    <option>TV en Vivo - Deportes</option>
                    <option>TV en Vivo - Noticias</option>
                    <option>Películas</option>
                  </select>
                </div>
                <button className="btn-primary mt-2">Guardar Contenido</button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>En construcción...</div>;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <button className="admin-back-btn" onClick={() => navigate('/home')}>
            <ArrowLeft size={20} />
          </button>
          <h2>NovaAdmin</h2>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={20} /> Usuarios
          </button>
          <button className={`admin-nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
            <Clapperboard size={20} /> Contenido
          </button>
          <button className={`admin-nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            <CreditCard size={20} /> Pagos
          </button>
          <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> Ajustes
          </button>
        </nav>
        <div className="admin-footer">
          <button className="admin-nav-item text-danger" onClick={() => navigate('/')}>
            <LogOut size={20} /> Salir
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {renderContent()}
      </main>
    </div>
  );
}

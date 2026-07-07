import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlayCircle, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'register') {
      setIsLogin(false);
    }
    
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };
    checkSession();
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Success
        navigate('/home');
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        // Success
        alert("Registro exitoso. Revisa tu correo para verificar tu cuenta.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={24} /> Volver
      </button>
      
      <div className="auth-card animate-fade-in">
        <div className="logo-container-small">
          <PlayCircle className="logo-icon-small" size={40} color="var(--primary-color)" />
          <h2 className="logo-text-small">NovaStream</h2>
        </div>
        
        <h3 className="auth-title">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
        
        {error && <div className="auth-error" style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field-auth" 
                placeholder="Nombre completo" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
          )}
          
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              className="input-field-auth" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              className="input-field-auth" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>
        
        <p className="auth-switch">
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </span>
        </p>
      </div>
    </div>
  );
}

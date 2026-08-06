import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#050508',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: 'white',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#12121c',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
            <svg 
              viewBox="0 0 24 24" 
              width="64" 
              height="64" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ color: '#ff3b3b', marginBottom: '20px' }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              margin: '0 0 12px 0'
            }}>
              ¡Oops! Algo salió mal
            </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '16px', 
              margin: '0 0 32px 0',
              lineHeight: '1.5'
            }}>
              La aplicación encontró un error inesperado.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: 'linear-gradient(135deg, #8c00ff 0%, #5d00ff 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s, transform 0.2s',
                  boxShadow: '0 4px 14px 0 rgba(140, 0, 255, 0.39)',
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Reintentar
              </button>
              <a 
                href="/home"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

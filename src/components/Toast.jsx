import React, { useState, useEffect } from 'react';

// Toast event emitter and helper methods
export const toast = {
  success: (message) => dispatchToastEvent('success', message),
  error: (message) => dispatchToastEvent('error', message),
  info: (message) => dispatchToastEvent('info', message),
  warning: (message) => dispatchToastEvent('warning', message),
};

function dispatchToastEvent(type, message) {
  const event = new CustomEvent('novastream-toast', {
    detail: { id: Date.now().toString(), type, message }
  });
  window.dispatchEvent(event);
}

// Toast Container Component
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (event) => {
      const newToast = event.detail;
      setToasts((currentToasts) => [...currentToasts, newToast]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((currentToasts) => 
          currentToasts.filter(t => t.id !== newToast.id)
        );
      }, 4000);
    };

    window.addEventListener('novastream-toast', handleToastEvent);
    return () => window.removeEventListener('novastream-toast', handleToastEvent);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toast-slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .nova-toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .nova-toast-container {
            top: 16px;
            right: 0;
            left: 0;
            align-items: center;
          }
        }
        .nova-toast {
          animation: toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          pointer-events: auto;
          transition: all 0.3s ease;
        }
        /* Leaving animation is handled by React unmount, for a true leaving animation you'd need a more complex state, 
           but for simplicity we auto-remove */
      `}</style>
      <div className="nova-toast-container">
        {toasts.map((t) => {
          
          let accentColor = '#8c00ff';
          let icon = null;
          
          switch(t.type) {
            case 'success':
              accentColor = '#10b981'; // green
              icon = <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{color: accentColor}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
              break;
            case 'error':
              accentColor = '#ef4444'; // red
              icon = <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{color: accentColor}}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
              break;
            case 'warning':
              accentColor = '#f59e0b'; // yellow
              icon = <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{color: accentColor}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
              break;
            case 'info':
            default:
              accentColor = '#3b82f6'; // blue
              icon = <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{color: accentColor}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
              break;
          }

          return (
            <div 
              key={t.id} 
              className="nova-toast"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '300px',
                maxWidth: '400px',
                backgroundColor: 'rgba(18, 18, 28, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: `4px solid ${accentColor}`,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Inter, system-ui, sans-serif',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => setToasts(current => current.filter(toast => toast.id !== t.id))}
            >
              <div style={{ flexShrink: 0, display: 'flex' }}>
                {icon}
              </div>
              <div style={{ flexGrow: 1, fontSize: '14px', fontWeight: '500', lineHeight: '1.4' }}>
                {t.message}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'

// Auto-sincronización en vivo para celulares Android
if (Capacitor.isNativePlatform() && !window.location.href.includes('novastreamtv-plum.vercel.app')) {
  console.log('[Capacitor Auto-Sync] Redirigiendo a versión en vivo...');
  window.location.href = 'https://novastreamtv-plum.vercel.app';
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

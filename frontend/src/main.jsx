import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

// Auto-recover from stale chunk 404s after new Vercel deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected. Auto-reloading with fresh assets...');
  const reloadKey = 'zokep_chunk_preload_reload';
  const lastReload = window.sessionStorage.getItem(reloadKey);
  if (!lastReload) {
    window.sessionStorage.setItem(reloadKey, 'true');
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

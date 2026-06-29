import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BackgroundDecor } from './components/ui/BackgroundDecor';
import './index.css';
import './styles/carello-theme.css'; // ← tema Carello (rimuovi questa riga per rollback)

// Blocco globale del menù contestuale (tasto destro).
// Deterrente leggero contro copia/ispezione casuale — gli utenti motivati
// possono comunque bypassare via devtools.
if (typeof document !== 'undefined') {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BackgroundDecor />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// PWA: registra il service worker solo in produzione (in dev darebbe fastidio
// alla cache/HMR). Il SW non tocca mai /api (vedi public/sw.js).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* registrazione non disponibile: l'app funziona comunque */
    });
  });
}

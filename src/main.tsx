import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BackgroundDecor } from './components/ui/BackgroundDecor';
import './index.css';

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

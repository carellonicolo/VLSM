import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BackgroundDecor } from './components/ui/BackgroundDecor';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BackgroundDecor />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

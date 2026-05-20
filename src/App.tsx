import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/screens/HomePage';

// Le route non-home sono caricate on-demand: ognuna porta dietro un pezzo
// pesante (calcolatori shadcn, dati verifiche, AdminScreen + cloud sync).
// La landing resta eager perché è la prima cosa che l'utente vede.
const CalcolatoriPage = lazy(() =>
  import('./components/screens/CalcolatoriPage').then((m) => ({ default: m.CalcolatoriPage }))
);
const TestFlow = lazy(() =>
  import('./components/screens/TestFlow').then((m) => ({ default: m.TestFlow }))
);
const AdminPage = lazy(() =>
  import('./components/screens/AdminPage').then((m) => ({ default: m.AdminPage }))
);

function RouteFallback() {
  return (
    <div className="shell">
      <div className="card">Caricamento…</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calcolatori" element={<CalcolatoriPage />} />
          <Route path="/verifica" element={<TestFlow categoria="verifica" />} />
          <Route path="/esercitazione" element={<TestFlow categoria="esercitazione" />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

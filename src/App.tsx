import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomePage } from './components/screens/HomePage';
import { LoginAccountScreen } from './components/screens/LoginAccountScreen';
import { RegisterScreen } from './components/screens/RegisterScreen';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/Confirm';

// Le route pesanti sono caricate on-demand.
const CalcolatoriPage = lazy(() =>
  import('./components/screens/CalcolatoriPage').then((m) => ({ default: m.CalcolatoriPage }))
);
const TestFlow = lazy(() =>
  import('./components/screens/TestFlow').then((m) => ({ default: m.TestFlow }))
);
const AdminPage = lazy(() =>
  import('./components/screens/AdminPage').then((m) => ({ default: m.AdminPage }))
);
const StudentDashboard = lazy(() =>
  import('./components/screens/StudentDashboard').then((m) => ({ default: m.StudentDashboard }))
);

function RouteFallback() {
  return (
    <div className="shell">
      <div className="card">Caricamento…</div>
    </div>
  );
}

/** Protegge le route che richiedono un account studente loggato. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, student } = useAuth();
  const location = useLocation();
  if (loading) return <RouteFallback />;
  if (!student) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginAccountScreen />} />
                <Route path="/registrazione" element={<RegisterScreen />} />
                <Route path="/dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
                <Route path="/calcolatori" element={<CalcolatoriPage />} />
                <Route path="/verifica" element={<RequireAuth><TestFlow categoria="verifica" /></RequireAuth>} />
                <Route path="/esercitazione" element={<RequireAuth><TestFlow categoria="esercitazione" /></RequireAuth>} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

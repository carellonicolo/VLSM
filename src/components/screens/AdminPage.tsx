import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../ui/AppShell';
import { AdminLoginGate } from './AdminLoginGate';

const AdminScreen = lazy(() =>
  import('../admin/AdminScreen').then((m) => ({ default: m.AdminScreen }))
);

export function AdminPage() {
  const [logged, setLogged] = useState(false);
  const navigate = useNavigate();

  if (!logged) {
    return (
      <AppShell>
        <AdminLoginGate onSuccess={() => setLogged(true)} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Suspense fallback={<div className="card">Caricamento modalità docente…</div>}>
        <AdminScreen onExit={() => navigate('/')} />
      </Suspense>
    </AppShell>
  );
}

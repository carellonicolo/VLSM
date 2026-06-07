import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';
import { ThemeToggle } from '../ui/ThemeToggle';
import { HomeLink } from '../ui/HomeLink';
import { AccountMenu } from '../ui/AccountMenu';
import { AdminLoginGate } from './AdminLoginGate';

const AdminScreen = lazy(() =>
  import('../admin/AdminScreen').then((m) => ({ default: m.AdminScreen }))
);

export function AdminPage() {
  const { theme, toggle } = useTheme();
  const [logged, setLogged] = useState(false);
  const navigate = useNavigate();

  const themeToggle = (
    <>
      <AccountMenu />
      <HomeLink />
      <ThemeToggle theme={theme} onToggle={toggle} />
    </>
  );

  if (!logged) {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <AdminLoginGate onSuccess={() => setLogged(true)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="shell">
      <Header actions={themeToggle} />
      <Suspense fallback={<div className="card">Caricamento modalità docente…</div>}>
        <AdminScreen onExit={() => navigate('/')} />
      </Suspense>
      <Footer />
    </div>
  );
}

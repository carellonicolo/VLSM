import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';
import { HomeLink } from './HomeLink';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

function AccountMenu() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  if (!student) return null;
  const firstName = student.fullName.split(' ')[0] || student.email;
  return (
    <span className="account-chip">
      <Link to="/dashboard" className="account-chip-link" title={`${student.fullName} · ${student.email}`}>
        <span aria-hidden>👤</span> {firstName}
      </Link>
      <button
        type="button"
        className="account-chip-logout"
        title="Esci dall'account"
        onClick={() => {
          logout();
          navigate('/');
        }}
      >
        Esci
      </button>
    </span>
  );
}

interface Props {
  children: ReactNode;
  /** Riga opzionale (es. link "torna indietro") subito sotto l'header. */
  back?: ReactNode;
  /** Nasconde il menu account (es. nelle schermate di login). */
  hideAccount?: boolean;
}

export function AppShell({ children, back, hideAccount }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <div className="shell">
      <Header
        actions={
          <>
            {!hideAccount && <AccountMenu />}
            <HomeLink />
            <ThemeToggle theme={theme} onToggle={toggle} />
          </>
        }
      />
      {back}
      {children}
      <Footer />
    </div>
  );
}

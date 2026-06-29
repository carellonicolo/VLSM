import type { ReactNode } from 'react';
// --- Vecchio header VLSM (sostituito da <carello-shell>). Tenuto commentato
//     per rollback immediato: ripristina <Header>, ThemeToggle e useTheme. ---
// import { Header } from './Header';
// import { ThemeToggle } from './ThemeToggle';
// import { useTheme } from '../../hooks/useTheme';
import { Footer } from './Footer';
import { HomeLink } from './HomeLink';
import { AccountMenu } from './AccountMenu';

interface Props {
  children: ReactNode;
  /** Riga opzionale (es. link "torna indietro") subito sotto l'header. */
  back?: ReactNode;
  /** Nasconde il menu account (es. nelle schermate di login). */
  hideAccount?: boolean;
}

export function AppShell({ children, back, hideAccount }: Props) {
  // const { theme, toggle } = useTheme(); // tema ora gestito dalla <carello-shell>
  return (
    <div className="shell">
      {/* Top bar unificata Carello: brand, breadcrumb, launcher, tema e avatar
          (Profilo/Logout via auth.nicolocarello.it). Sostituisce il vecchio
          <Header>. Il pulsante tema scrive su `vlsm_theme` (vedi carello-shell.js). */}
      <carello-shell
        app-name="VLSM Test"
        app-icon="Network"
        accent="#e0662b"
        user="NC"
        data-hub-url="https://nicolocarello.it"
        data-auth-url="https://auth.nicolocarello.it"
      />
      {/*
      <Header
        actions={
          <>
            {!hideAccount && <AccountMenu />}
            <HomeLink />
            <ThemeToggle theme={theme} onToggle={toggle} />
          </>
        }
      />
      */}
      {/* Controlli funzionali specifici dell'app che la shell non copre:
          logout SSO dell'app (AccountMenu) e ritorno alla home interna (HomeLink). */}
      <div className="carello-actions-row">
        {!hideAccount && <AccountMenu />}
        <HomeLink />
      </div>
      {back}
      {children}
      <Footer />
    </div>
  );
}

import type { ReactNode } from 'react';
// --- Vecchio header VLSM (sostituito da <carello-shell>). Tenuto commentato
//     per rollback immediato: ripristina <Header>, ThemeToggle e useTheme. ---
// import { Header } from './Header';
// import { ThemeToggle } from './ThemeToggle';
// import { useTheme } from '../../hooks/useTheme';
import { Footer } from './Footer';
// HomeLink e AccountMenu rimossi dalla riga azioni: ora nella <carello-shell>
// l'header unificato espone home (nome app cliccabile), Profilo, Dashboard VLSM
// e Logout. Componenti mantenuti nel repo per riuso/rollback.
// import { HomeLink } from './HomeLink';
// import { AccountMenu } from './AccountMenu';

interface Props {
  children: ReactNode;
  /** Riga opzionale (es. link "torna indietro") subito sotto l'header. */
  back?: ReactNode;
  /** Nasconde il menu account (es. nelle schermate di login). Non più usato:
   *  l'account è gestito dalla shell. Mantenuto per compatibilità dei chiamanti. */
  hideAccount?: boolean;
}

export function AppShell({ children, back }: Props) {
  return (
    <div className="shell">
      {/* Top bar unificata Carello: brand, breadcrumb (nome app → home),
          launcher, tema e avatar con dropdown Profilo / Dashboard VLSM / Logout.
          Sostituisce il vecchio <Header>. Il pulsante tema scrive su `vlsm_theme`. */}
      <carello-shell
        app-name="VLSM Test"
        app-icon="Network"
        accent="#e0662b"
        user="NC"
        data-hub-url="https://nicolocarello.it"
        data-auth-url="https://auth.nicolocarello.it"
        data-dash-url="/dashboard"
        data-dash-label="Dashboard VLSM"
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
      {back}
      {children}
      <Footer />
    </div>
  );
}

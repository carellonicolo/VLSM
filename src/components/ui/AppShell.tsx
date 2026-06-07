import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';
import { HomeLink } from './HomeLink';
import { AccountMenu } from './AccountMenu';
import { useTheme } from '../../hooks/useTheme';

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

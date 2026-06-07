import type { ReactNode } from 'react';

interface Props {
  actions?: ReactNode;
}

export function Header({ actions }: Props) {
  return (
    <header className="school-header">
      <div className="school-header-inner">
        <div className="school-header-main">
          <h1 className="school-header-title">
            <span className="school-header-logo" aria-hidden>🔢</span>
            <span className="school-header-title-text">
              <span className="school-header-vlsm">VLSM</span> Test
            </span>
            <span className="school-header-divider">—</span>
            <span className="school-header-prof">Prof. Carello Nicolò</span>
          </h1>
        </div>
        {actions && <div className="school-header-actions">{actions}</div>}
      </div>
    </header>
  );
}

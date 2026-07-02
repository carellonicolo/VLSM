import type { ReactNode } from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode; // es. <LayoutDashboard size={18} />
  badge?: number;
  dot?: boolean; // pallino verde (es. sessione/verifica attiva)
  active: boolean;
  onClick: () => void;
}

/**
 * Guscio con sidebar di navigazione riutilizzato da studente e docente.
 * È puramente presentazionale: la selezione della voce attiva è gestita
 * dal chiamante tramite stato locale (nessuna route nuova).
 */
export function SidebarShell({
  groupLabel,
  items,
  footer,
  children,
}: {
  groupLabel: string;
  items: SidebarItem[];
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sidebar-shell">
      <nav className="sidebar-nav" aria-label={groupLabel}>
        <div className="sidebar-group-label">{groupLabel}</div>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`sidebar-item${it.active ? ' active' : ''}`}
            aria-current={it.active ? 'page' : undefined}
            onClick={it.onClick}
          >
            {it.icon}
            <span>{it.label}</span>
            {it.badge ? <span className="sidebar-badge">{it.badge}</span> : null}
            {it.dot ? <span className="sidebar-dot" aria-hidden /> : null}
          </button>
        ))}
        {footer ? <div className="sidebar-footer">{footer}</div> : null}
      </nav>
      <div className="sidebar-content">{children}</div>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Chip "account" nell'header: nome dello studente loggato (link alla dashboard)
 * + pulsante di logout SSO. Mostrato in modo uniforme su tutte le schermate
 * (home, calcolatori, verifica, dashboard, docente). Se nessuno è loggato non
 * renderizza nulla.
 */
export function AccountMenu() {
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

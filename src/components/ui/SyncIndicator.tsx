import type { SyncStatus } from '../../hooks/useCloudSync';
import { formatDuration } from '../../lib/format';

interface Props {
  status: SyncStatus;
  lastSyncAt: string | null;
}

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 5000) return 'ora';
  if (diff < 60000) return `${Math.round(diff / 1000)}s fa`;
  return formatDuration(diff) + ' fa';
}

export function SyncIndicator({ status, lastSyncAt }: Props) {
  let label = '';
  let bg = '';
  let color = '';
  let icon = '';

  switch (status) {
    case 'synced':
      icon = '☁️✓';
      label = `Salvato online ${relativeTime(lastSyncAt)}`;
      bg = 'var(--success-bg)';
      color = 'var(--success)';
      break;
    case 'syncing':
      icon = '☁️⏳';
      label = 'Sincronizzazione…';
      bg = 'var(--readonly-bg)';
      color = 'var(--muted)';
      break;
    case 'offline':
      icon = '📵';
      label = lastSyncAt ? `Offline — ultimo backup ${relativeTime(lastSyncAt)}` : 'Backup cloud non disponibile';
      bg = 'var(--warn-bg)';
      color = 'var(--warn-text)';
      break;
    case 'error':
      icon = '⚠️';
      label = 'Errore di sincronizzazione';
      bg = 'var(--error-bg)';
      color = 'var(--error-text)';
      break;
    case 'idle':
    default:
      icon = '☁️';
      label = 'In attesa di sincronizzazione';
      bg = 'var(--readonly-bg)';
      color = 'var(--muted)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.7rem',
        borderRadius: 999,
        background: bg,
        color,
        fontSize: '0.8rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
      title={status === 'error' || status === 'offline' ? 'Il salvataggio locale continua a funzionare comunque.' : ''}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}

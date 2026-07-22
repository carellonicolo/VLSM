import { Clock } from 'lucide-react';
import { useTimer, formatRemaining } from '../../hooks/useTimer';

interface Props {
  deadlineMs: number;
  onExpire?: () => void;
}

export function TimerBadge({ deadlineMs, onExpire }: Props) {
  const { remainingMs } = useTimer(deadlineMs, onExpire);
  const tot = Math.floor(remainingMs / 1000);
  const cls = tot < 60 ? 'timer-badge danger' : tot < 300 ? 'timer-badge warning' : 'timer-badge';
  const mm = Math.floor(tot / 60);
  const ss = tot % 60;
  // Etichetta "parlata" per screen reader (role=timer non annuncia ogni secondo,
  // ma è interrogabile e non legge "zero cinque due punti" del formato mm:ss).
  const spoken = `Tempo rimanente: ${mm} ${mm === 1 ? 'minuto' : 'minuti'} e ${ss} ${ss === 1 ? 'secondo' : 'secondi'}`;
  return (
    <span
      className={cls}
      role="timer"
      aria-label={spoken}
      title={spoken}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
    >
      <Clock size={15} aria-hidden /> <span aria-hidden>{formatRemaining(remainingMs)}</span>
    </span>
  );
}

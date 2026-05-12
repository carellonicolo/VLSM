import { useTimer, formatRemaining } from '../../hooks/useTimer';

interface Props {
  deadlineMs: number;
  onExpire?: () => void;
}

export function TimerBadge({ deadlineMs, onExpire }: Props) {
  const { remainingMs } = useTimer(deadlineMs, onExpire);
  const tot = Math.floor(remainingMs / 1000);
  const cls = tot < 60 ? 'timer-badge danger' : tot < 300 ? 'timer-badge warning' : 'timer-badge';
  return <span className={cls}>⏱ {formatRemaining(remainingMs)}</span>;
}

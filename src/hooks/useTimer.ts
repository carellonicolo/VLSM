import { useEffect, useState } from 'react';

export interface TimerState {
  remainingMs: number;
  isExpired: boolean;
}

export function useTimer(deadlineMs: number | undefined, onExpire?: () => void): TimerState {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadlineMs === undefined) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadlineMs]);

  useEffect(() => {
    if (deadlineMs === undefined || !onExpire) return;
    if (now >= deadlineMs) onExpire();
  }, [now, deadlineMs, onExpire]);

  if (deadlineMs === undefined) {
    return { remainingMs: 0, isExpired: false };
  }
  const remainingMs = Math.max(0, deadlineMs - now);
  return { remainingMs, isExpired: remainingMs === 0 };
}

export function formatRemaining(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

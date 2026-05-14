import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'vlsm_theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'light' || current === 'dark') return current;
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggle };
}

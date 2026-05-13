import type { Theme } from '../../hooks/useTheme';

interface Props {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Passa al tema ${isDark ? 'chiaro' : 'scuro'}`}
      title={`Passa al tema ${isDark ? 'chiaro' : 'scuro'}`}
    >
      <span aria-hidden>{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}

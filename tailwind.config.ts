import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  // Tailwind viene usato solo dai componenti portati da Subnet (calcolatori,
  // shadcn UI, modali). Il resto di VLSM continua a usare il proprio CSS in
  // src/index.css. Per evitare collisioni di nomi (--primary, --border, ecc.)
  // le variabili shadcn sono prefissate con --sc-*.
  //
  // La sintassi `hsl(var(--sc-xxx) / <alpha-value>)` è necessaria per
  // supportare i modificatori di opacità di Tailwind (es. `bg-card/50`,
  // `hover:bg-primary/90`), usati massicciamente dai componenti shadcn.
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--sc-background) / <alpha-value>)',
        foreground: 'hsl(var(--sc-foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--sc-card) / <alpha-value>)',
          foreground: 'hsl(var(--sc-card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--sc-popover) / <alpha-value>)',
          foreground: 'hsl(var(--sc-popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--sc-primary) / <alpha-value>)',
          foreground: 'hsl(var(--sc-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--sc-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--sc-secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--sc-muted) / <alpha-value>)',
          foreground: 'hsl(var(--sc-muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--sc-accent) / <alpha-value>)',
          foreground: 'hsl(var(--sc-accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--sc-destructive) / <alpha-value>)',
          foreground: 'hsl(var(--sc-destructive-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--sc-border) / <alpha-value>)',
        input: 'hsl(var(--sc-input) / <alpha-value>)',
        ring: 'hsl(var(--sc-ring) / <alpha-value>)',
        chart: {
          1: 'hsl(var(--sc-chart-1) / <alpha-value>)',
          2: 'hsl(var(--sc-chart-2) / <alpha-value>)',
          3: 'hsl(var(--sc-chart-3) / <alpha-value>)',
          4: 'hsl(var(--sc-chart-4) / <alpha-value>)',
          5: 'hsl(var(--sc-chart-5) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--sc-radius)',
        md: 'calc(var(--sc-radius) - 2px)',
        sm: 'calc(var(--sc-radius) - 4px)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;

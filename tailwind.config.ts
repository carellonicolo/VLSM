import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  // Tailwind viene usato solo dai componenti portati da Subnet (calcolatori,
  // shadcn UI, modali). Il resto di VLSM continua a usare il proprio CSS in
  // src/index.css. Per evitare collisioni di nomi (--primary, --border, ecc.)
  // le variabili shadcn sono prefissate con --sc-*.
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--sc-background))',
        foreground: 'hsl(var(--sc-foreground))',
        card: {
          DEFAULT: 'hsl(var(--sc-card))',
          foreground: 'hsl(var(--sc-card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--sc-popover))',
          foreground: 'hsl(var(--sc-popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--sc-primary))',
          foreground: 'hsl(var(--sc-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--sc-secondary))',
          foreground: 'hsl(var(--sc-secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--sc-muted))',
          foreground: 'hsl(var(--sc-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--sc-accent))',
          foreground: 'hsl(var(--sc-accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--sc-destructive))',
          foreground: 'hsl(var(--sc-destructive-foreground))',
        },
        border: 'hsl(var(--sc-border))',
        input: 'hsl(var(--sc-input))',
        ring: 'hsl(var(--sc-ring))',
        chart: {
          1: 'hsl(var(--sc-chart-1))',
          2: 'hsl(var(--sc-chart-2))',
          3: 'hsl(var(--sc-chart-3))',
          4: 'hsl(var(--sc-chart-4))',
          5: 'hsl(var(--sc-chart-5))',
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

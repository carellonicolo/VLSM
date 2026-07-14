# carello-kit

Kit estraibile della **shell + tema "Prof. Carello" unificato**, pronto per
essere riapplicato ad altre app del sistema.

## Contenuto

| File | Cos'è |
|------|-------|
| `PROMPT-kit-carello.md` | **Il prompt**: incollalo in una nuova chat (con i due file sotto) per applicare il kit a un'altra app. Contiene caratteristiche, attributi, contratti e i 4 passi di integrazione. |
| `carello-shell.js` | La Web Component `<carello-shell>` (top bar + launcher waffle + tema + account/SSO). Copia in `public/`. |
| `carello-theme.css` | Ri-tematizzazione shadcn/app (palette calda arancione + font Lexend/JetBrains Mono, light/dark). Copia in `src/styles/` e importala in `main.tsx`. |

## Uso rapido

1. Apri una nuova chat sull'app di destinazione.
2. Allega `carello-shell.js` e `carello-theme.css`.
3. Incolla `PROMPT-kit-carello.md` e chiedi: *"Applica il kit Carello a questa app."*

I due file sono copie 1:1 di `public/carello-shell.js` e
`src/styles/carello-theme.css` di questa app (VLSM), presa come riferimento.

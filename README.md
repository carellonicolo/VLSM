# VLSM — Verifica auto-correggente

App web frontend-only per somministrare verifiche di **VLSM** (Variable Length Subnet Masking) agli studenti, con correzione automatica e PDF stampabile.

- **Materia**: Sistemi e Reti (SRI) — ITIS G. Marconi, Verona
- **Docente**: Prof. N. Carello — A.S. 2025/2026
- **Stack**: Vite + React + TypeScript
- **Deploy**: Cloudflare Pages (build statica)

## Funzionamento

1. Lo studente entra con una password condivisa.
2. Inserisce nome e classe; il sistema sorteggia una delle 6 verifiche.
3. Svolge la verifica con timer configurabile (default 60 min).
4. Allo scadere, o cliccando "Termina", l'app corregge automaticamente e mostra il voto.
5. Lo studente scarica un PDF con risposte, errori evidenziati, voto e spazio firme.
6. Stampa, firma, consegna cartaceo al docente.

## Sviluppo

```bash
npm install
npm run dev        # dev server con HMR
npm test           # esegue tutti i test (Vitest)
npm run build      # build produzione → dist/
npm run preview    # preview del build di produzione
```

### Variabili d'ambiente

Crea un file `.env.local` (o configura le env var su Cloudflare):

```
VITE_APP_PASSWORD=vlsm2026
VITE_DURATA_DEFAULT_MIN=60
```

> **Attenzione**: la password viene inlined nel bundle JS a build-time. È una barriera "soft", non sicurezza reale.

## Deploy su Cloudflare Pages

### Opzione A — Da GitHub (consigliata)

1. Vai su [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Seleziona il repository `carellonicolo/VLSM`.
3. Configura il build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (lascia vuoto)
4. **Environment variables** (sia Production che Preview):
   - `VITE_APP_PASSWORD` = la password che vuoi distribuire agli studenti
   - `VITE_DURATA_DEFAULT_MIN` = `60` (o altro valore di default)
   - `NODE_VERSION` = `20`
5. **Deploy**. Al primo build Cloudflare crea l'URL `https://vlsm.pages.dev` (puoi anche collegare un dominio personalizzato).

Ogni push su `main` rilascia automaticamente in Production. I push sugli altri branch generano una preview URL.

### Opzione B — Da CLI (Wrangler)

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name=vlsm
```

Per le env var aggiungile dal dashboard o con `wrangler pages secret put`.

### Note tecniche

- `public/_redirects` (`/* /index.html 200`) gestisce il routing client-side.
- `public/_headers` imposta header di sicurezza base (no CSP rigida, perché `@react-pdf/renderer` ne richiede flessibilità).
- Il PDF è lazy-loaded (`React.lazy`): il bundle iniziale è ~184 KB gzip (56 KB main + ~493 KB il chunk PDF caricato solo nella schermata risultato).

## Struttura

```
src/
├── types/domain.ts             # tipi condivisi
├── data/verifiche.ts           # dataset delle 6 verifiche (solo requisiti)
├── lib/
│   ├── vlsm.ts                 # calcoli IP/prefix/blocchi residui
│   ├── grading.ts              # logica di correzione
│   ├── normalize.ts            # parsing input studente
│   ├── storage.ts              # wrapper localStorage
│   └── pickVerifica.ts         # sorteggio uniforme
├── hooks/{useSession,useTimer}.ts
├── components/
│   ├── screens/{Login,StudentInfo,Test,Review,Result}Screen.tsx
│   ├── exercises/EsercizioVlsmAlloc, EsercizioParametri, EsercizioAnalisiPiano
│   ├── ui/{Header,Footer,TimerBadge}.tsx
│   └── pdf/{PdfReport,PdfDownload}.tsx
└── tests/{vlsm,grading}.test.ts
```

Le **soluzioni attese** non sono memorizzate: vengono calcolate al volo dalla lib `vlsm.ts` partendo dai requisiti. Test golden in `tests/vlsm.test.ts` validano l'allocazione e i blocchi residui contro le soluzioni note di `soluzioni_vlsm_completo.md`.

## Limiti noti (accettati)

- Le risposte attese si possono ricostruire da chiunque apra i sorgenti minificati. Mitigazione: supervisione del docente in laboratorio.
- Il PDF non è firmato digitalmente: uno studente potrebbe rieditarlo prima di stamparlo. Stessa mitigazione.
- La password compare in chiaro nel bundle JS dopo il build. Cambiare password = nuovo build/redeploy.
- Una sessione = una tab. Aprire più tab dello stesso browser causa drift sullo storage.

## Sorgenti didattici

I file in `docs/` (`verifica_vlsm_*.md`, `verifica_vlsm.docx`, `soluzioni_vlsm.docx`, `soluzioni_vlsm_completo.md`) restano nel repo come riferimento del rubric originale. Non vengono usati a runtime.

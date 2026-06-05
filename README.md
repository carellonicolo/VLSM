# VLSM — Verifica auto-correggente

App web frontend-only per somministrare verifiche di **VLSM** (Variable Length Subnet Masking) agli studenti, con correzione automatica e PDF stampabile.

- **Materia**: Sistemi e Reti (SRI) — ITIS G. Marconi, Verona
- **Docente**: Prof. N. Carello — A.S. 2025/2026
- **Stack**: Vite + React + TypeScript
- **Deploy**: Cloudflare Pages (build statica)

## Funzionamento

1. Lo studente si **registra** con la sua email scolastica (`@marconiverona.edu.it`) e una password.
2. Il **docente convalida** l'account e ne conferma la **classe** (dal pannello "Studenti").
3. Il docente **sblocca la verifica per quella classe** (tab "Classi & esame").
4. Lo studente loggato e convalidato avvia la verifica: il sistema sorteggia una verifica del livello scelto.
5. Svolge la verifica con timer; il docente può seguirla **in tempo reale** e, se serve, inviare un **alert**, un'**ammonizione** o **interrompere/annullare** la prova.
6. Allo scadere (o "Termina") l'app corregge in automatico, mostra il voto e genera un **PDF firmato** con risposte, errori, distrazioni e ammonizioni.
7. Tutte le prove (verifiche ed esercitazioni) confluiscono nello **storico/andamento** dello studente, visibile anche al docente.

> Gli studenti **non ancora convalidati** (o le classi senza esame attivo) possono comunque usare le **esercitazioni libere**, che vengono registrate nel loro storico.

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
VITE_ADMIN_PASSWORD=docente2026     # password docente (pannello + API admin)
VITE_DURATA_DEFAULT_MIN=60
VITE_APP_PASSWORD=vlsm2026          # LEGACY: non più usata dagli studenti (account email)
```

**Variabili server-side (Cloudflare Pages → Settings → Environment variables):**

```
ADMIN_PASSWORD=docente2026          # = VITE_ADMIN_PASSWORD, usata dalle Functions admin
VLSM_AUTH_SECRET=<random ≥32 char>  # secret per firmare i token di sessione studente (Tipo: Secret)
VLSM_HMAC_SECRET=<random ≥32 char>  # secret per la firma HMAC dei PDF (Tipo: Secret)
STUDENT_EMAIL_DOMAIN=marconiverona.edu.it   # opzionale: dominio email ammesso in registrazione
```

> Se `VLSM_AUTH_SECRET` non è impostata, le Functions ripiegano su `VLSM_HMAC_SECRET` e, in mancanza di entrambe, su un secret di sviluppo **insicuro**: in produzione impostane almeno uno.

**Comportamento del campo durata:**
- `VITE_DURATA_DEFAULT_MIN=0` (o non impostata) → lo studente può scegliere liberamente la durata prima di iniziare (default mostrato: 60 min).
- `VITE_DURATA_DEFAULT_MIN=N` con `N>0` → il campo durata è visibile ma **bloccato** sul valore `N`. Lo studente non può modificarlo. Per cambiarlo: aggiorni la env var su Cloudflare e fai un nuovo deploy.

> **Attenzione**: entrambe le password (`VITE_APP_PASSWORD` e `VITE_ADMIN_PASSWORD`) vengono inlined nel bundle JS a build-time. Sono una barriera "soft", non sicurezza reale. Tieni la password docente diversa da quella studente per non far entrare gli studenti nella modalità di correzione.

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
   - `VITE_APP_PASSWORD` = password che dai agli studenti per la verifica
   - `VITE_ADMIN_PASSWORD` = password separata che usi tu per la correzione bulk
   - `VITE_DURATA_DEFAULT_MIN` = `60` (o altro valore di default)
   - `VLSM_HMAC_SECRET` = secret server-side per firma HMAC (vedi sezione "Firma digitale" sotto). Tipo: **Secret**.
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
- Il PDF è lazy-loaded (`React.lazy`): il bundle iniziale è ~62 KB gzip; il chunk PDF (`react-pdf`) viene scaricato solo a fine verifica.

### Firma digitale HMAC (Pages Functions)

L'app firma ogni PDF con `HMAC-SHA256` server-side per garantirne l'integrità:

- Quando lo studente conferma la consegna, il frontend chiama `POST /api/sign` con il riassunto dell'esito; la Function calcola la firma usando un **secret server-side** (`VLSM_HMAC_SECRET`) e la restituisce
- La firma + il payload vengono incorporati nei metadati PDF (`Subject`/`Keywords`)
- Quando il docente carica i PDF in modalità admin, il frontend chiama `POST /api/verify` per ogni file e mostra un badge "✅ Firma valida", "❌ Manomesso" o "⚠️ Non firmato"

**Configurazione Cloudflare (obbligatoria per usare la firma):**

1. Genera un secret random lungo almeno 32 caratteri:
   ```bash
   openssl rand -base64 48
   ```
2. Cloudflare Dashboard → progetto `vlsm` → **Settings** → **Environment variables** → aggiungi (sia Production che Preview):
   - **Variable name**: `VLSM_HMAC_SECRET`
   - **Value**: il secret generato
   - **Type**: **Secret** (cliccando "Encrypt" non viene esposta nei deploy log)
3. Redeploy. Le Functions sono in `functions/api/` e vengono compilate automaticamente da Pages.

**Senza il secret**, le API rispondono 500 e il flusso degrada: i PDF vengono comunque generati ma senza firma (badge "⚠️ Non firmato" in admin).

**Costo**: ben sotto il free tier di Cloudflare (100k req/giorno + 10ms CPU). Per dettagli: vedi README sezione sviluppo.

### Sviluppo locale con Pages Functions

Per testare le API in locale serve `wrangler`:

```bash
npm install -g wrangler   # una sola volta
wrangler pages dev dist --port 8788 --binding VLSM_HMAC_SECRET=dev-secret-only-for-local
# in un altro terminale:
npm run dev               # Vite proxierà /api → :8788
```

In dev senza wrangler le API sono offline → i PDF vengono generati senza firma (badge "⚠️ Non firmato") e il cloud sync è disabilitato (l'app funziona solo su localStorage).

### Cloud sync delle sessioni (Cloudflare D1)

L'app sincronizza automaticamente le verifiche degli studenti su un database SQLite serverless (Cloudflare D1) per:
- **Recupero in caso di crash**: lo studente può riprendere da un altro PC se nome+classe corrispondono.
- **Vista live docente**: nella modalità docente la tab "🟢 Sessioni live" mostra in tempo reale tutti gli studenti che stanno svolgendo o hanno consegnato la verifica, con possibilità di "riaprire" o eliminare una sessione.

**Setup (una sola volta, dalla dashboard Cloudflare):**

1. **Crea il database D1**
   - Dashboard Cloudflare → **Workers & Pages** → **D1 SQL Database** → **Create database**
   - Nome: `vlsm-sessions` (o quello che preferisci)
   - Annota il `database_id` (UUID)

2. **Applica gli schemi**
   - Apri il database appena creato → tab **Console**
   - Copia il contenuto di `migrations/0001_init.sql` e clicca **Execute**
   - Poi `migrations/0002_settings.sql` e di nuovo **Execute** (aggiunge la
     tabella `settings` per il pannello admin: toggle modalità verifica e
     cambio password studente da UI).
   - Poi `migrations/0003_accounts.sql` e **Execute** (account studenti,
     convalida docente, sblocco verifica per-classe, interventi docente).
     ⚠️ Va eseguito **una sola volta**: gli `ALTER TABLE` finali danno errore
     se rilanciati (le colonne esistono già).
   - Infine `migrations/0004_exam_level.sql` e **Execute** (livello della
     verifica scelto dal docente per ogni classe). Anche questo una sola volta.

3. **Collega il DB al progetto Pages**
   - Pages → progetto `vlsm` → **Settings** → **Functions** → sezione **D1 database bindings** → **Add binding**
   - Variable name: `DB` (esatto, case-sensitive)
   - D1 database: seleziona `vlsm-sessions`
   - Salva

4. **Aggiungi le password server-side (Environment variables)**
   - Le funzioni server (`/api/session/*`, `/api/sessions/*`, `/api/admin/*`)
     richiedono le stesse password che usi sul client, ma con nomi senza
     prefisso `VITE_`:
     - `APP_PASSWORD` (=valore di `VITE_APP_PASSWORD`) — fallback se non
       hai mai impostato una password personalizzata dal pannello admin
     - `ADMIN_PASSWORD` (=valore di `VITE_ADMIN_PASSWORD`)
   - Tipo: **Secret** (criptate at rest)

5. **Forza un nuovo deploy**
   - Pages → Deployments → **Create deployment** (oppure pusha un commit)

### Cambio password e toggle verifica da admin

In **Modalità docente** → tab **⚙️ Impostazioni** puoi:
- **Attivare/disattivare la modalità verifica** in tempo reale: quando OFF
  gli studenti vedono la sezione "Svolgi la verifica" disabilitata sulla
  login (esercitazioni libere e accesso docente restano sempre attivi).
- **Cambiare la password studente** senza redeploy: la nuova vale per i
  nuovi login. Le sessioni già attive continuano a sincronizzare con la
  vecchia password per **60 minuti** (grace period) per non disturbare
  studenti che stanno svolgendo la verifica.
- Consultare la **cronologia modifiche** (audit log con timestamp e IP).

**Cosa succede senza setup:**
- L'app continua a funzionare su localStorage
- L'indicatore di sync mostra "📵 Backup cloud non disponibile"
- La tab "Sessioni live" in modalità docente mostra un messaggio di errore con istruzioni
- Nessuna interruzione del flusso normale

**Privacy:** ai sensi del Regolamento UE 2016/679 (GDPR), il titolare del trattamento è la scuola. I dati raccolti (nome, classe, risposte, eventi distrazione) sono conservati a tempo indeterminato a meno che non li cancelli manualmente da Cloudflare D1 (Console → query `DELETE FROM sessions WHERE ...`) o dalla tab admin "Sessioni live" tramite il bottone 🗑 Elimina.

## Account studenti, convalida e controllo verifiche

Dall'upgrade "account" l'accesso a esercitazioni e verifiche richiede un
**account studente** (email scolastica + password). I calcolatori restano liberi.

### Flusso account
- **Registrazione** (`/registrazione`): self-service, solo email del dominio scolastico.
  L'account nasce in stato `pending`. Nessuna email di verifica viene inviata.
- **Login** (`/login`): email + password → token di sessione firmato (HMAC), salvato
  in `localStorage` e inviato come `Authorization: Bearer` su tutte le API protette.
- **Dashboard** (`/dashboard`): stato account, accesso a esercitazione/verifica,
  e **andamento** (medie, media per livello, grafico trend, distrazioni, ammonizioni).

### Convalida e classi (lato docente)
- Tab **👥 Studenti**: elenco di tutti gli account (i `pending` in cima). Per ognuno:
  **Convalida** (= approva + conferma la **classe**), metti in attesa, rifiuta, disabilita,
  **reset password** (lo studente la cambia al primo accesso), **storico** (andamento e prove),
  elimina.
- Tab **🎛 Classi & esame**: sblocca la verifica **per singola classe** e scegli il
  **livello** (fisso, casuale, o scelto dallo studente). Solo gli studenti
  **convalidati** di una classe **attiva** possono iniziare una verifica. Esiste anche
  l'interruttore generale "Modalità verifica" (tab Impostazioni) come master: se spento,
  l'esame è bloccato per tutte le classi.

### Controllo della verifica in tempo reale
Nella tab **🟢 Sessioni live**, per ogni verifica in corso il docente può:
- **✉️ Alert** — messaggio momentaneo che compare allo studente;
- **⚠️ Ammonisci** — ammonizione **registrata**: compare allo studente, sul **PDF** e nel
  resoconto (nessuna escalation automatica: l'annullamento resta manuale);
- **⛔ Annulla** — interrompe la prova: lo studente vede a schermo intero "Prova interrotta
  dal docente", non può più rispondere, la sessione passa a stato `annullata` con motivo.

Lo studente riceve gli interventi via **polling** ogni ~3 s (nessun WebSocket: resta nel
free tier Cloudflare). Una prova annullata non può più essere salvata né ripresa dallo studente.

### Sicurezza
- Password: hash **PBKDF2-HMAC-SHA256** (WebCrypto, salt per-utente, 150k iterazioni).
- Sessione: token firmato HMAC con scadenza; ad ogni richiesta lo stato dello studente
  viene riletto dal DB (un account disabilitato/rifiutato è bloccato all'istante).
- Le API admin restano protette dalla password docente (`ADMIN_PASSWORD`).

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

```
docs/
├── verifiche/           # verifiche ufficiali, accesso con password
│   ├── base/            # v1, v2, v7, v8
│   ├── media/           # v3, v5, v10, v11
│   ├── alta/            # v4, v9, v12, v13
│   └── esperta/         # v6, v14, v15, v16
├── esercitazioni/       # simulazioni libere senza password
│   ├── base/            # s1, s2
│   ├── media/           # s3, s4
│   ├── alta/            # s5, s6
│   └── esperta/         # s7, s8
└── soluzioni/           # uso esclusivo docente
```

Tutti i `.md` sono generati automaticamente da `scripts/generate-md.ts` (`npx tsx scripts/generate-md.ts`) a partire dal dataset in `src/data/verifiche.ts`. Le verifiche `.docx` di esempio e la griglia di correzione completa sono in `docs/soluzioni/`.

## Modalità d'uso

Tutto parte dall'**account studente** (login con email scolastica). I calcolatori restano liberi.

### Verifica ufficiale
Disponibile solo a studenti **convalidati** la cui **classe** ha l'esame **attivo**. Lo studente sceglie il livello dal menù a tendina e il sistema sorteggia una delle verifiche di quel livello. Identità (nome/classe) presa dall'account. Il PDF finale ha gli spazi per la firma studente/docente e riporta distrazioni ed eventuali ammonizioni.

### Esercitazione libera
Disponibile a **qualunque studente loggato** (anche non convalidato). Lo studente sceglie il livello e il sistema sorteggia una delle simulazioni del livello. Il PDF mostra un banner "ESERCITAZIONE LIBERA — non vale come verifica ufficiale" e non ha gli spazi firma. Le esercitazioni entrano comunque nello storico personale.

### Livelli di difficoltà

| Livello | Verifiche (4) | Simulazioni (2) | Caratteristiche |
|---------|---------------|-----------------|------------------|
| Base | v1, v2, v7, v8 | s1, s2 | Reti /22–/24, host < 200 |
| Media | v3, v5, v10, v11 | s3, s4 | Reti /20–/22, host < 1000 |
| Alta | v4, v9, v12, v13 | s5, s6 | Reti /16–/19, host fino a 10.000 |
| Esperta | v6, v14, v15, v16 | s7, s8 | Reti /11–/14, host fino a 250.000 |

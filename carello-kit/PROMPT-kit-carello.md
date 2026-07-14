# Kit "Carello Unificato" — prompt per applicare la shell/tema ad altre app

> **Come usarlo:** incolla questo intero file in una nuova chat, insieme ai due
> file allegati (`carello-shell.js` e `carello-theme.css`), e chiedi:
> *"Applica il kit Carello a questa app seguendo il prompt."*
> Il kit è pensato per app web frontend (React/Vite/shadcn o simili) che vivono
> su un sottodominio di `nicolocarello.it` con SSO centralizzato.

---

## 1. Cos'è il kit

Un **sistema di header + tema condiviso** fra tutte le app "Prof. Carello",
così ogni app ha la stessa barra in alto, lo stesso launcher di app, lo stesso
account/logout SSO e lo stesso look. È fatto in modo da essere **additivo e
reversibile**: non riscrive i componenti dell'app, si aggancia sopra.

Tre pezzi:

1. **`carello-shell.js`** — una Web Component `<carello-shell>` (top bar unificata).
2. **`carello-theme.css`** — ri-tematizzazione (palette calda arancione + font).
3. **4 punti di integrazione** nell'app ospite (vedi §4).

---

## 2. Caratteristiche salienti della shell (`<carello-shell>`)

Custom element vanilla (nessuna dipendenza, Shadow DOM isolato). Espone:

- **Brand + breadcrumb**: logo "Prof. Carello" + nome dell'app cliccabile che
  torna alla home (`/`). Icona dell'app da libreria **Lucide** (attr `app-icon`).
- **Launcher "waffle"** (griglia a 4 colonne in un popover): elenco di tutte le
  app del sistema, **letto a runtime dal DB dell'Hub** via `POST /api/db` (D1
  Cloudflare). Supporta **cartelle** (interlacciate con le app top-level per
  `position`, apertura cartella + tasto "indietro"). Ogni voce ha icona Lucide,
  colore e href presi dal DB. **Cache in localStorage** (`carello-launcher-cache-v2`)
  per apertura istantanea + offline; aggiornamento in background. **Fallback
  statico** hardcoded se manca `data-hub-url` o la rete non risponde.
- **Toggle tema** light/dark: sorgente di verità = attributo `data-theme` su
  `<html>` + classe `.dark` + chiave localStorage (qui `vlsm_theme`). L'icona
  mostra la modalità verso cui si commuta (luna in chiaro, sole in scuro).
  Il tema è propagato dentro lo Shadow DOM con la classe host `dark-shell`
  (via `MutationObserver` su `data-theme`).
- **Avatar + menu account**: nome/foto letti dal cookie **non-HttpOnly**
  `nc_profile` (campi `n` = nome, `a` = url avatar). Priorità stato avatar:
  foto → iniziali (loggato) → sagoma grigia (nessuna sessione). Menu con:
  - **Profilo/Login** (se non loggato → login centrale con redirect alla pagina corrente),
  - **Dashboard** app opzionale (attr `data-dash-url` / `data-dash-label`),
  - **Logout** SSO globale (`{authUrl}/api/logout?redirect={origin}`), nascosto se non loggato.
- **Responsive**: sotto 560px nasconde il nome-brand (resta il logo) e stringe
  le spaziature per non sovrapporre controlli.

### Attributi del tag

```html
<carello-shell
  app-name="VLSM Test"                       <!-- nome mostrato nel breadcrumb -->
  app-icon="Network"                          <!-- nome icona Lucide (PascalCase) -->
  accent="#e0662b"                            <!-- colore accento dell'app -->
  user="NC"                                    <!-- iniziali fallback se manca il cookie -->
  data-hub-url="https://nicolocarello.it"      <!-- origine Hub per il launcher (D1) -->
  data-auth-url="https://auth.nicolocarello.it"<!-- IdP per Profilo/Login/Logout -->
  data-dash-url="/dashboard"                   <!-- (opz.) voce Dashboard dell'app -->
  data-dash-label="Dashboard VLSM"             <!-- (opz.) etichetta della voce -->
  data-hide-theme                              <!-- (opz.) nasconde il toggle tema -->
></carello-shell>
```

### Dipendenze esterne / contratti
- **Icone**: `https://unpkg.com/lucide-static@latest/icons/<kebab>.svg` (fetch runtime).
- **Hub DB**: endpoint pubblico in sola lettura `POST {hub}/api/db` che accetta
  `{table, action:'select', columns, filters, order}` e risponde `{data:[...]}`.
  Legge le tabelle `apps` (name, icon_name, href, color, position, folder_id,
  position_in_folder) e `folders` (id, name, color, position). **Richiede CORS**
  per `*.nicolocarello.it` (solo lettura).
- **SSO/IdP**: cookie di sessione firmato (es. `nc_session`, JWT ES256) +
  cookie display `nc_profile`. Endpoint `/api/logout` e `/login` sull'IdP.

---

## 3. Caratteristiche salienti del tema (`carello-theme.css`)

Ri-tematizza un'app **shadcn/ui senza toccare i componenti**, sovrascrivendo le
variabili CSS. Un solo import lo attiva, rimuoverlo fa rollback totale.

- **Doppio set di variabili**:
  - `--sc-*` (formato HSL shadcn: background, primary, accent, chart-1..5, radius…).
  - Palette storica dell'app `--bg/--fg/--primary/--border/--muted/--card…`
    (molte app non usano le `--sc-*`, quindi vanno sovrascritte entrambe).
- **Dark mode con due selettori**: shadcn usa `.dark`, l'app usa `[data-theme='dark']`.
  Vanno definiti **entrambi**.
- **Palette "Direzione C"** (Material/Google-like, caldo): fondo crema `#FBF7F2`,
  inchiostro `#23201C`, **primario arancione brand `#E0662B`**, accento `#FCE6DA`,
  bordo caldo `#F0E9E0`. Verde (successo) e giallo (avviso) **lasciati invariati**
  perché semantici. `--radius: 0.9rem` (angoli morbidi).
- **Font**: `Lexend` (sans) + `JetBrains Mono` (mono), importati da Google Fonts.
- **Extra**: gradiente caldo per `.school-header`, classe helper `.carello-actions-row`.

---

## 4. Integrazione nell'app ospite (4 modifiche minime, tutte reversibili)

1. **`index.html`** — carica la shell e fai il bootstrap del tema *prima* del render
   (evita flash), leggendo/scrivendo la chiave localStorage del tema:
   ```html
   <script src="/carello-shell.js" defer></script>
   <script>
     (function () {
       try {
         var stored = localStorage.getItem('<APP>_theme');
         var theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
         document.documentElement.setAttribute('data-theme', theme);
         if (theme === 'dark') document.documentElement.classList.add('dark');
       } catch (e) { document.documentElement.setAttribute('data-theme', 'light'); }
     })();
   </script>
   ```
   ⚠️ La chiave localStorage del tema (`<APP>_theme`) dev'essere **identica** a
   quella usata dentro `carello-shell.js` (costante `THEME_KEY`): cambiala in
   entrambi i punti per la nuova app.

2. **`carello-shell.js`** → copia in `public/`. Adegua `THEME_KEY`, la lista
   `FALLBACK`, e se serve `LS_KEY`.

3. **`carello-theme.css`** → copia in `src/styles/` e importalo **dopo** l'index.css
   in `main.tsx`:
   ```ts
   import './styles/carello-theme.css'; // ← tema Carello (rimuovi per rollback)
   ```

4. **Layout/AppShell** — sostituisci il vecchio header con `<carello-shell …>`
   (vedi attributi §2). Rimuovi dalla riga azioni gli eventuali ThemeToggle /
   HomeLink / AccountMenu (ora vivono nella shell); tienili commentati per rollback.
   In TypeScript+React aggiungi la dichiarazione JSX del custom element:
   ```ts
   declare global {
     namespace JSX {
       interface IntrinsicElements {
         'carello-shell': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, any>;
       }
     }
   }
   ```

---

## 5. Principi di design da preservare quando lo porti su un'altra app

- **Additivo e reversibile**: ogni pezzo si toglie con una riga; non si riscrivono componenti.
- **Fonte unica delle app = Hub/D1**: mai una lista hardcoded (solo fallback).
- **Sorgente di verità del tema = `data-theme` su `<html>`**; tutto il resto si sincronizza.
- **Shadow DOM isolato**: la shell non eredita né inquina il CSS dell'app.
- **SSO condiviso via cookie di dominio** (`.nicolocarello.it`): niente password locali.
- **Free-tier friendly**: solo fetch statiche + un endpoint pubblico in lettura, cache locale, nessun WebSocket.

Adatta per la nuova app: `app-name`, `app-icon`, `accent`, `<APP>_theme`,
`data-dash-url`, e il dominio. Il resto resta invariato tra tutte le app.

---
**ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026**

---
# VERIFICA SCRITTA — VLSM *(30 punti)*

| Alunno/a | Classe | Data |
|----------|--------|------|
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |                  |                  |

---

## Esercizio 1 — VLSM: piano enterprise su larga scala *(10 punti — 2 pt per sottorete)*

Applicare il VLSM alla rete **`172.0.0.0/13`** per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

> ⚠️ I prefissi da utilizzare sono nell'intervallo **/15 ÷ /19**. Calcolare attentamente il numero di host disponibili per ciascun prefisso prima di procedere all'allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 100000 |
| LAN_B | 60000 |
| LAN_C | 30000 |
| LAN_D | 15000 |
| LAN_E | 8000 |

**Tabella di allocazione:**

| Sottorete | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-----------|-------------|----------|----------|------------|-------------|-----------|
| LAN_A | | | | | | |
| LAN_B | | | | | | |
| LAN_C | | | | | | |
| LAN_D | | | | | | |
| LAN_E | | | | | | |

---

## Esercizio 2 — VLSM: piano multi-segmento *(8 punti — 1 pt per sottorete)*

Applicare il VLSM alla rete **`10.200.0.0/20`** per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 500 |
| LAN_B | 250 |
| LAN_C | 120 |
| LAN_D | 60 |
| LAN_E | 25 |
| LAN_F | 12 |
| WAN_1 | 2 |
| WAN_2 | 2 |

**Tabella di allocazione:**

| Sottorete | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-----------|-------------|----------|----------|------------|-------------|-----------|
| LAN_A | | | | | | |
| LAN_B | | | | | | |
| LAN_C | | | | | | |
| LAN_D | | | | | | |
| LAN_E | | | | | | |
| LAN_F | | | | | | |
| WAN_1 | | | | | | |
| WAN_2 | | | | | | |

---

## Esercizio 3 — Parametri di sottorete *(7 punti — 1 pt per riga)*

Per ciascun indirizzo host/prefisso, determinare: indirizzo di rete, maschera decimale, primo host, ultimo host e broadcast.

> ⚠️ Tutti i prefissi coinvolgono il **secondo ottetto** (o superiore): l'AND va applicato sull'ottetto corretto in funzione del prefisso. Verificare con attenzione la maschera prima di procedere.

| Ind. host / prefisso | Ind. di rete | Maschera decimale | Primo host | Ultimo host | Broadcast |
|----------------------|-------------|-------------------|------------|-------------|-----------|
| `10.160.128.1/12` | | | | | |
| `172.33.200.50/11` | | | | | |
| `10.74.100.200/13` | | | | | |
| `192.168.77.200/28` | | | | | |
| `10.10.200.250/22` | | | | | |
| `172.100.0.1/14` | | | | | |
| `10.255.255.254/30` | | | | | |

---

## Esercizio 4 — Analisi piano VLSM di un'infrastruttura enterprise *(5 punti)*

Un'organizzazione ha suddiviso il blocco **`10.0.0.0/12`** tra sette reparti come indicato di seguito.

### a) *(3 pt)* — Completare la tabella con maschera, primo host, ultimo host e broadcast per ciascuna sottorete.

| ID | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|----|-------------|----------|----------|------------|-------------|-----------|
| A | 10.0.0.0 | /14 | | | | |
| B | 10.4.0.0 | /15 | | | | |
| C | 10.6.0.0 | /16 | | | | |
| D | 10.7.0.0 | /17 | | | | |
| E | 10.7.128.0 | /18 | | | | |
| F | 10.7.192.0 | /20 | | | | |
| G | 10.7.208.0 | /21 | | | | |

### b) *(1 pt)* — Identificare i blocchi non allocati nel blocco `10.0.0.0/12` ed esprimerli in notazione CIDR.

> 💡 I blocchi residui possono avere prefissi grandi (es. **/13**, **/19**, **/21**): aggregare correttamente gli spazi contigui.

| Ind. di rete (CIDR) | Prefisso | Primo host | Ultimo host | Broadcast |
|---------------------|----------|------------|-------------|-----------|
| | | | | |
| | | | | |
| | | | | |

### c) *(1 pt)* — Deve essere aggiunto un nuovo reparto che richiede **500.000 host**. Indicare il blocco residuo più adatto, il prefisso CIDR minimo necessario e compilare la riga seguente.

| Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-------------|----------|----------|------------|-------------|-----------|
| | | | | | |

---
*Nicolò Carello — info@nicolocarello.it*

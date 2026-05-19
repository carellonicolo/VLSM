---
**ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026**

---
# SIMULAZIONE VLSM — ESERCITAZIONE LIBERA *(30 punti)*

| Alunno/a | Classe | Data |
|----------|--------|------|
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |

---

## Esercizio 1 — VLSM: allocazione sottoreti *(10 punti — 2 pt per sottorete)*

Applicare il VLSM alla rete 172.54.0.0/17 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 9500 |
| LAN_B | 4700 |
| LAN_C | 2100 |
| LAN_D | 900 |
| WAN_1 | 350 |

**Tabella di allocazione:**

| Sottorete | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-----------|-------------|----------|----------|------------|-------------|-----------|
| LAN_A | | | | | | |
| LAN_B | | | | | | |
| LAN_C | | | | | | |
| LAN_D | | | | | | |
| WAN_1 | | | | | | |

---

## Esercizio 2 — VLSM: piano multi-segmento *(8 punti — 1 pt per sottorete)*

Applicare il VLSM alla rete 10.88.0.0/21 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 370 |
| LAN_B | 170 |
| LAN_C | 85 |
| LAN_D | 38 |
| LAN_E | 16 |
| LAN_F | 5 |
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

Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.

| Ind. host / prefisso | Ind. di rete | Maschera decimale | Primo host | Ultimo host | Broadcast |
|----------------------|-------------|-------------------|------------|-------------|-----------|
| `10.99.190.50/12` | | | | | |
| `172.21.105.100/13` | | | | | |
| `192.168.127.10/29` | | | | | |
| `10.71.190.200/15` | | | | | |
| `172.25.145.50/14` | | | | | |
| `10.146.65.5/18` | | | | | |
| `192.168.50.255/30` | | | | | |

---

## Esercizio 4 — Analisi piano VLSM esistente *(5 punti)*

Un amministratore ha allocato le seguenti sottoreti all'interno del blocco 172.52.0.0/16.

### a) *(3 pt)* — Completare la tabella con maschera, primo host, ultimo host e broadcast.

| ID | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|----|-------------|----------|----------|------------|-------------|-----------|
| A | 172.52.0.0 | /18 | | | | |
| B | 172.52.64.0 | /19 | | | | |
| C | 172.52.96.0 | /20 | | | | |
| D | 172.52.112.0 | /21 | | | | |
| E | 172.52.120.0 | /22 | | | | |
| F | 172.52.124.0 | /24 | | | | |

### b) *(1 pt)* — Identificare i blocchi non allocati nel blocco `172.52.0.0/16` ed esprimerli in notazione CIDR.

| Ind. di rete (CIDR) | Prefisso | Primo host | Ultimo host | Broadcast |
|---------------------|----------|------------|-------------|-----------|
| | | | | |
| | | | | |
| | | | | |

### c) *(1 pt)* — È richiesta una nuova sottorete per **4800 host**. Scegliere il blocco residuo più adatto e compilare la riga seguente.

| Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-------------|----------|----------|------------|-------------|-----------|
| | | | | | |

---

---
*Nicolò Carello — info@nicolocarello.it*

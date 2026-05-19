---
**ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026**

---
# SIMULAZIONE VLSM — ESERCITAZIONE LIBERA *(30 punti)*

| Alunno/a | Classe | Data |
|----------|--------|------|
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |

---

## Esercizio 1 — VLSM: allocazione sottoreti *(10 punti — 2 pt per sottorete)*

Applicare il VLSM alla rete 172.96.0.0/11 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 195000 |
| LAN_B | 98000 |
| LAN_C | 48000 |
| LAN_D | 19000 |
| WAN_1 | 7500 |

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

Applicare il VLSM alla rete 172.48.0.0/16 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 7800 |
| LAN_B | 3900 |
| LAN_C | 1950 |
| LAN_D | 970 |
| LAN_E | 480 |
| LAN_F | 195 |
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
| `10.210.250.5/13` | | | | | |
| `172.100.150.50/12` | | | | | |
| `192.168.243.100/27` | | | | | |
| `10.130.180.5/15` | | | | | |
| `172.180.250.10/14` | | | | | |
| `10.20.100.10/16` | | | | | |
| `192.168.153.255/30` | | | | | |

---

## Esercizio 4 — Analisi piano VLSM esistente *(5 punti)*

Un amministratore ha allocato le seguenti sottoreti all'interno del blocco 10.80.0.0/12.

### a) *(3 pt)* — Completare la tabella con maschera, primo host, ultimo host e broadcast.

| ID | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|----|-------------|----------|----------|------------|-------------|-----------|
| A | 10.80.0.0 | /14 | | | | |
| B | 10.84.0.0 | /15 | | | | |
| C | 10.86.0.0 | /16 | | | | |
| D | 10.87.0.0 | /17 | | | | |
| E | 10.87.128.0 | /18 | | | | |
| F | 10.87.192.0 | /20 | | | | |
| G | 10.87.208.0 | /21 | | | | |

### b) *(1 pt)* — Identificare i blocchi non allocati nel blocco `10.80.0.0/12` ed esprimerli in notazione CIDR.

| Ind. di rete (CIDR) | Prefisso | Primo host | Ultimo host | Broadcast |
|---------------------|----------|------------|-------------|-----------|
| | | | | |
| | | | | |
| | | | | |

### c) *(1 pt)* — È richiesta una nuova sottorete per **41.000 host**. Scegliere il blocco residuo più adatto e compilare la riga seguente.

| Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-------------|----------|----------|------------|-------------|-----------|
| | | | | | |

---

---
*Nicolò Carello — info@nicolocarello.it*

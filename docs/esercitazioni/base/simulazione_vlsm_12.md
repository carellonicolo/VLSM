---
**ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026**

---
# SIMULAZIONE VLSM — ESERCITAZIONE LIBERA *(30 punti)*

| Alunno/a | Classe | Data |
|----------|--------|------|
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |

---

## Esercizio 1 — VLSM: allocazione sottoreti *(8 punti — 2 pt per sottorete)*

Applicare il VLSM alla rete 192.168.75.0/24 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 60 |
| LAN_B | 28 |
| LAN_C | 14 |
| WAN_1 | 6 |

**Tabella di allocazione:**

| Sottorete | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-----------|-------------|----------|----------|------------|-------------|-----------|
| LAN_A | | | | | | |
| LAN_B | | | | | | |
| LAN_C | | | | | | |
| WAN_1 | | | | | | |

---

## Esercizio 2 — VLSM: piano multi-segmento *(7 punti — 1 pt per sottorete)*

Applicare il VLSM alla rete 10.9.0.0/22 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 220 |
| LAN_B | 110 |
| LAN_C | 55 |
| LAN_D | 28 |
| LAN_E | 14 |
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
| WAN_1 | | | | | | |
| WAN_2 | | | | | | |

---

## Esercizio 3 — Parametri di sottorete *(7 punti — 1 pt per riga)*

Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.

| Ind. host / prefisso | Ind. di rete | Maschera decimale | Primo host | Ultimo host | Broadcast |
|----------------------|-------------|-------------------|------------|-------------|-----------|
| `10.24.0.50/27` | | | | | |
| `192.168.19.99/26` | | | | | |
| `172.16.32.50/22` | | | | | |
| `10.19.19.50/29` | | | | | |
| `192.168.185.100/25` | | | | | |
| `172.16.96.50/20` | | | | | |
| `10.9.14.5/30` | | | | | |

---

## Esercizio 4 — Analisi piano VLSM esistente *(8 punti)*

Un amministratore ha allocato le seguenti sottoreti all'interno del blocco 10.19.0.0/21.

### a) *(5 pt)* — Completare la tabella con maschera, primo host, ultimo host e broadcast.

| ID | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|----|-------------|----------|----------|------------|-------------|-----------|
| A | 10.19.0.0 | /23 | | | | |
| B | 10.19.2.0 | /24 | | | | |
| C | 10.19.3.0 | /25 | | | | |
| D | 10.19.3.128 | /26 | | | | |
| E | 10.19.4.0 | /23 | | | | |

### b) *(2 pt)* — Identificare i blocchi non allocati nel blocco `10.19.0.0/21` ed esprimerli in notazione CIDR.

| Ind. di rete (CIDR) | Prefisso | Primo host | Ultimo host | Broadcast |
|---------------------|----------|------------|-------------|-----------|
| | | | | |
| | | | | |

### c) *(1 pt)* — È richiesta una nuova sottorete per **30 host**. Scegliere il blocco residuo più adatto e compilare la riga seguente.

| Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-------------|----------|----------|------------|-------------|-----------|
| | | | | | |

---

---
*Nicolò Carello — info@nicolocarello.it*

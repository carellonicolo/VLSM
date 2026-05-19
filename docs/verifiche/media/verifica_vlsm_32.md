---
**ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026**

---
# VERIFICA SCRITTA — VLSM *(30 punti)*

| Alunno/a | Classe | Data |
|----------|--------|------|
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |

---

## Esercizio 1 — VLSM: allocazione sottoreti *(10 punti — 2 pt per sottorete)*

Applicare il VLSM alla rete 172.30.0.0/22 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 260 |
| LAN_B | 130 |
| LAN_C | 50 |
| LAN_D | 18 |
| WAN_1 | 4 |

**Tabella di allocazione:**

| Sottorete | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-----------|-------------|----------|----------|------------|-------------|-----------|
| LAN_A | | | | | | |
| LAN_B | | | | | | |
| LAN_C | | | | | | |
| LAN_D | | | | | | |
| WAN_1 | | | | | | |

---

## Esercizio 2 — VLSM: piano multi-segmento *(7 punti — 1 pt per sottorete)*

Applicare il VLSM alla rete 10.62.0.0/21 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 310 |
| LAN_B | 150 |
| LAN_C | 75 |
| LAN_D | 30 |
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
| `10.77.80.150/29` | | | | | |
| `172.30.150.100/22` | | | | | |
| `192.168.64.150/25` | | | | | |
| `10.55.50.130/19` | | | | | |
| `172.27.180.200/21` | | | | | |
| `192.168.245.100/26` | | | | | |
| `10.21.0.5/30` | | | | | |

---

## Esercizio 4 — Analisi piano VLSM esistente *(6 punti)*

Un amministratore ha allocato le seguenti sottoreti all'interno del blocco 172.24.0.0/20.

### a) *(3 pt)* — Completare la tabella con maschera, primo host, ultimo host e broadcast.

| ID | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|----|-------------|----------|----------|------------|-------------|-----------|
| A | 172.24.0.0 | /22 | | | | |
| B | 172.24.4.0 | /23 | | | | |
| C | 172.24.6.0 | /25 | | | | |
| D | 172.24.6.128 | /26 | | | | |
| E | 172.24.7.0 | /24 | | | | |

### b) *(2 pt)* — Identificare i blocchi non allocati nel blocco `172.24.0.0/20` ed esprimerli in notazione CIDR.

| Ind. di rete (CIDR) | Prefisso | Primo host | Ultimo host | Broadcast |
|---------------------|----------|------------|-------------|-----------|
| | | | | |
| | | | | |

### c) *(1 pt)* — È richiesta una nuova sottorete per **500 host**. Scegliere il blocco residuo più adatto e compilare la riga seguente.

| Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-------------|----------|----------|------------|-------------|-----------|
| | | | | | |

---

---
*Nicolò Carello — info@nicolocarello.it*

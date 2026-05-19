---
**ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026**

---
# VERIFICA SCRITTA — VLSM *(30 punti)*

| Alunno/a | Classe | Data |
|----------|--------|------|
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |

---

## Esercizio 1 — VLSM: allocazione sottoreti *(10 punti — 2 pt per sottorete)*

Applicare il VLSM alla rete 10.19.0.0/23 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 110 |
| LAN_B | 50 |
| LAN_C | 22 |
| LAN_D | 10 |
| WAN_1 | 2 |

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

Applicare il VLSM alla rete 172.23.8.0/22 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 220 |
| LAN_B | 100 |
| LAN_C | 50 |
| LAN_D | 25 |
| LAN_E | 10 |
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
| `10.67.30.50/29` | | | | | |
| `172.29.140.100/21` | | | | | |
| `192.168.165.250/25` | | | | | |
| `10.36.200.100/23` | | | | | |
| `172.22.235.100/18` | | | | | |
| `192.168.70.99/27` | | | | | |
| `10.159.0.1/22` | | | | | |

---

## Esercizio 4 — Analisi piano VLSM esistente *(6 punti)*

Un amministratore ha allocato le seguenti sottoreti all'interno del blocco 10.26.0.0/19.

### a) *(3 pt)* — Completare la tabella con maschera, primo host, ultimo host e broadcast.

| ID | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|----|-------------|----------|----------|------------|-------------|-----------|
| A | 10.26.0.0 | /22 | | | | |
| B | 10.26.4.0 | /23 | | | | |
| C | 10.26.6.0 | /24 | | | | |
| D | 10.26.7.0 | /25 | | | | |
| E | 10.26.7.128 | /26 | | | | |

### b) *(2 pt)* — Identificare i blocchi non allocati nel blocco `10.26.0.0/19` ed esprimerli in notazione CIDR.

| Ind. di rete (CIDR) | Prefisso | Primo host | Ultimo host | Broadcast |
|---------------------|----------|------------|-------------|-----------|
| | | | | |
| | | | | |
| | | | | |

### c) *(1 pt)* — È richiesta una nuova sottorete per **500 host**. Scegliere il blocco residuo più adatto e compilare la riga seguente.

| Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-------------|----------|----------|------------|-------------|-----------|
| | | | | | |

---

---
*Nicolò Carello — info@nicolocarello.it*

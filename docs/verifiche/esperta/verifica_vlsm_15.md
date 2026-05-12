---
**ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026**

---
# VERIFICA SCRITTA — VLSM *(30 punti)*

| Alunno/a | Classe | Data |
|----------|--------|------|
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |

---

## Esercizio 1 — VLSM: piano enterprise *(10 punti — 2 pt per sottorete)*

Applicare il VLSM alla rete 172.32.0.0/11 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 250000 |
| LAN_B | 120000 |
| LAN_C | 60000 |
| LAN_D | 30000 |
| LAN_E | 10000 |

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

Applicare il VLSM alla rete 10.96.0.0/16 per soddisfare i requisiti indicati.
Ordinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.

**Requisiti:**

| Sottorete | Host richiesti |
|-----------|---------------|
| LAN_A | 10000 |
| LAN_B | 5000 |
| LAN_C | 2500 |
| LAN_D | 1500 |
| LAN_E | 500 |
| LAN_F | 150 |
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

Per ciascun indirizzo host/prefisso, determinare i parametri richiesti. Tutti i prefissi coinvolgono il secondo ottetto.

| Ind. host / prefisso | Ind. di rete | Maschera decimale | Primo host | Ultimo host | Broadcast |
|----------------------|-------------|-------------------|------------|-------------|-----------|
| `10.180.50.5/11` | | | | | |
| `172.70.130.100/12` | | | | | |
| `192.168.5.250/29` | | | | | |
| `10.99.200.10/14` | | | | | |
| `172.45.50.5/13` | | | | | |
| `10.255.0.130/16` | | | | | |
| `192.168.55.99/30` | | | | | |

---

## Esercizio 4 — Analisi piano VLSM enterprise *(5 punti)*

Un'organizzazione ha suddiviso il blocco 10.128.0.0/12 tra sette reparti.

### a) *(3 pt)* — Completare la tabella con maschera, primo host, ultimo host e broadcast.

| ID | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|----|-------------|----------|----------|------------|-------------|-----------|
| A | 10.128.0.0 | /14 | | | | |
| B | 10.132.0.0 | /15 | | | | |
| C | 10.134.0.0 | /16 | | | | |
| D | 10.135.0.0 | /17 | | | | |
| E | 10.135.128.0 | /18 | | | | |
| F | 10.135.192.0 | /20 | | | | |
| G | 10.135.208.0 | /21 | | | | |

### b) *(1 pt)* — Identificare i blocchi non allocati nel blocco `10.128.0.0/12` ed esprimerli in notazione CIDR.

| Ind. di rete (CIDR) | Prefisso | Primo host | Ultimo host | Broadcast |
|---------------------|----------|------------|-------------|-----------|
| | | | | |
| | | | | |
| | | | | |

### c) *(1 pt)* — È richiesta una nuova sottorete per **50.000 host**. Scegliere il blocco residuo più adatto e compilare la riga seguente.

| Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |
|-------------|----------|----------|------------|-------------|-----------|
| | | | | | |

---

---
*Nicolò Carello — info@nicolocarello.it*

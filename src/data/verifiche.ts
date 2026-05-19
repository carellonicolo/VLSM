import type { Verifica, VerificaId } from '../types/domain';

const v1: Verifica = {
  id: 'v1',
  titolo: 'Verifica 1',
  difficolta: 'Base',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      puntiTotali: 8,
      puntiPerRiga: 2,
      reteMadre: '192.168.10.0/24',
      requisiti: [
        { nome: 'LAN_A', host: 50 },
        { nome: 'LAN_B', host: 25 },
        { nome: 'LAN_C', host: 10 },
        { nome: 'WAN_1', host: 2 },
      ],
      consegna:
        'Applicare il VLSM alla rete 192.168.10.0/24 per soddisfare i requisiti indicati. Ordinare le sottoreti dalla più grande alla più piccola.',
    },
    {
      id: 'es2',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      puntiTotali: 8,
      puntiPerRiga: 8 / 6,
      reteMadre: '172.16.4.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 200 },
        { nome: 'LAN_B', host: 100 },
        { nome: 'LAN_C', host: 50 },
        { nome: 'LAN_D', host: 20 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.16.4.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3',
      tipo: 'parametri',
      titolo: 'Esercizio 3 — Parametri di sottorete',
      puntiTotali: 7,
      puntiPerRiga: 1,
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.0.0.130/25', ipPrefisso: '10.0.0.130/25' },
        { rowKey: '192.168.1.200/27', ipPrefisso: '192.168.1.200/27' },
        { rowKey: '172.30.15.45/22', ipPrefisso: '172.30.15.45/22' },
        { rowKey: '10.10.10.250/28', ipPrefisso: '10.10.10.250/28' },
        { rowKey: '192.168.100.33/26', ipPrefisso: '192.168.100.33/26' },
        { rowKey: '172.16.33.100/20', ipPrefisso: '172.16.33.100/20' },
        { rowKey: '10.5.200.1/30', ipPrefisso: '10.5.200.1/30' },
      ],
      consegna:
        'Per ciascun indirizzo host/prefisso, determinare: indirizzo di rete, maschera decimale, primo host, ultimo host e broadcast.',
    },
    {
      id: 'es4',
      tipo: 'analisi-piano',
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      puntiTotali: 7,
      bloccoPadre: '10.4.0.0/21',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.4.0.0/21.',
      parteA: {
        punti: 4,
        righe: [
          { rowKey: 'A', indRete: '10.4.0.0', prefisso: 24 },
          { rowKey: 'B', indRete: '10.4.1.0', prefisso: 25 },
          { rowKey: 'C', indRete: '10.4.1.128', prefisso: 26 },
          { rowKey: 'D', indRete: '10.4.2.0', prefisso: 23 },
          { rowKey: 'E', indRete: '10.4.4.0', prefisso: 24 },
        ],
      },
      parteB: { punti: 2, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 30 },
    },
  ],
};

const v2: Verifica = {
  id: 'v2',
  titolo: 'Verifica 2',
  difficolta: 'Base',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      puntiTotali: 10,
      puntiPerRiga: 2,
      reteMadre: '10.1.0.0/23',
      requisiti: [
        { nome: 'LAN_A', host: 80 },
        { nome: 'LAN_B', host: 40 },
        { nome: 'LAN_C', host: 15 },
        { nome: 'LAN_D', host: 6 },
        { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.1.0.0/23 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      puntiTotali: 7,
      puntiPerRiga: 1,
      reteMadre: '192.168.50.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 150 },
        { nome: 'LAN_B', host: 80 },
        { nome: 'LAN_C', host: 60 },
        { nome: 'LAN_D', host: 30 },
        { nome: 'LAN_E', host: 10 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 192.168.50.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3',
      tipo: 'parametri',
      titolo: 'Esercizio 3 — Parametri di sottorete',
      puntiTotali: 7,
      puntiPerRiga: 1,
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.10.5.70/29', ipPrefisso: '10.10.5.70/29' },
        { rowKey: '172.20.100.200/21', ipPrefisso: '172.20.100.200/21' },
        { rowKey: '192.168.200.100/25', ipPrefisso: '192.168.200.100/25' },
        { rowKey: '10.50.130.200/23', ipPrefisso: '10.50.130.200/23' },
        { rowKey: '172.16.255.100/18', ipPrefisso: '172.16.255.100/18' },
        { rowKey: '192.168.30.199/27', ipPrefisso: '192.168.30.199/27' },
        { rowKey: '10.100.0.1/22', ipPrefisso: '10.100.0.1/22' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4',
      tipo: 'analisi-piano',
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      puntiTotali: 6,
      bloccoPadre: '172.18.0.0/19',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 172.18.0.0/19.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '172.18.0.0', prefisso: 22 },
          { rowKey: 'B', indRete: '172.18.4.0', prefisso: 23 },
          { rowKey: 'C', indRete: '172.18.6.0', prefisso: 24 },
          { rowKey: 'D', indRete: '172.18.7.0', prefisso: 25 },
          { rowKey: 'E', indRete: '172.18.7.128', prefisso: 26 },
        ],
      },
      parteB: { punti: 2, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 400 },
    },
  ],
};

const v3: Verifica = {
  id: 'v3',
  titolo: 'Verifica 3',
  difficolta: 'Media',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      puntiTotali: 10,
      puntiPerRiga: 2,
      reteMadre: '10.20.0.0/20',
      requisiti: [
        { nome: 'LAN_A', host: 500 },
        { nome: 'LAN_B', host: 200 },
        { nome: 'LAN_C', host: 100 },
        { nome: 'LAN_D', host: 50 },
        { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.20.0.0/20 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      puntiTotali: 7,
      puntiPerRiga: 1,
      reteMadre: '172.31.0.0/21',
      requisiti: [
        { nome: 'LAN_A', host: 250 },
        { nome: 'LAN_B', host: 120 },
        { nome: 'LAN_C', host: 60 },
        { nome: 'LAN_D', host: 25 },
        { nome: 'LAN_E', host: 10 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.31.0.0/21 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3',
      tipo: 'parametri',
      titolo: 'Esercizio 3 — Parametri di sottorete',
      puntiTotali: 7,
      puntiPerRiga: 1,
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '192.168.33.100/23', ipPrefisso: '192.168.33.100/23' },
        { rowKey: '172.20.5.200/21', ipPrefisso: '172.20.5.200/21' },
        { rowKey: '10.44.129.50/17', ipPrefisso: '10.44.129.50/17' },
        { rowKey: '192.168.7.170/29', ipPrefisso: '192.168.7.170/29' },
        { rowKey: '172.31.200.77/26', ipPrefisso: '172.31.200.77/26' },
        { rowKey: '10.100.200.130/24', ipPrefisso: '10.100.200.130/24' },
        { rowKey: '192.168.128.250/25', ipPrefisso: '192.168.128.250/25' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4',
      tipo: 'analisi-piano',
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      puntiTotali: 6,
      bloccoPadre: '10.8.0.0/19',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.8.0.0/19.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.8.0.0', prefisso: 21 },
          { rowKey: 'B', indRete: '10.8.8.0', prefisso: 22 },
          { rowKey: 'C', indRete: '10.8.12.0', prefisso: 23 },
          { rowKey: 'D', indRete: '10.8.14.0', prefisso: 24 },
          { rowKey: 'E', indRete: '10.8.15.0', prefisso: 25 },
          { rowKey: 'F', indRete: '10.8.15.128', prefisso: 26 },
        ],
      },
      parteB: { punti: 2, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 1000 },
    },
  ],
};

const v4: Verifica = {
  id: 'v4',
  titolo: 'Verifica 4',
  difficolta: 'Alta',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      puntiTotali: 10,
      puntiPerRiga: 2,
      reteMadre: '172.25.0.0/17',
      requisiti: [
        { nome: 'LAN_A', host: 8000 },
        { nome: 'LAN_B', host: 4000 },
        { nome: 'LAN_C', host: 2000 },
        { nome: 'LAN_D', host: 1000 },
        { nome: 'LAN_E', host: 500 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.25.0.0/17 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      puntiTotali: 8,
      puntiPerRiga: 1,
      reteMadre: '10.50.0.0/21',
      requisiti: [
        { nome: 'LAN_A', host: 250 },
        { nome: 'LAN_B', host: 100 },
        { nome: 'LAN_C', host: 60 },
        { nome: 'LAN_D', host: 25 },
        { nome: 'LAN_E', host: 10 },
        { nome: 'LAN_F', host: 5 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.50.0.0/21 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3',
      tipo: 'parametri',
      titolo: 'Esercizio 3 — Parametri di sottorete',
      puntiTotali: 7,
      puntiPerRiga: 1,
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.77.200.15/12', ipPrefisso: '10.77.200.15/12' },
        { rowKey: '172.30.100.200/22', ipPrefisso: '172.30.100.200/22' },
        { rowKey: '192.168.17.90/28', ipPrefisso: '192.168.17.90/28' },
        { rowKey: '10.120.64.130/18', ipPrefisso: '10.120.64.130/18' },
        { rowKey: '172.16.135.200/20', ipPrefisso: '172.16.135.200/20' },
        { rowKey: '10.200.100.100/21', ipPrefisso: '10.200.100.100/21' },
        { rowKey: '192.168.255.253/30', ipPrefisso: '192.168.255.253/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4',
      tipo: 'analisi-piano',
      titolo: 'Esercizio 4 — Analisi piano VLSM di un\'infrastruttura multi-sede',
      puntiTotali: 5,
      bloccoPadre: '10.0.0.0/16',
      consegna: 'Un\'organizzazione ha suddiviso il blocco 10.0.0.0/16 tra sei sedi.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.0.0.0', prefisso: 18 },
          { rowKey: 'B', indRete: '10.0.64.0', prefisso: 19 },
          { rowKey: 'C', indRete: '10.0.96.0', prefisso: 20 },
          { rowKey: 'D', indRete: '10.0.112.0', prefisso: 21 },
          { rowKey: 'E', indRete: '10.0.120.0', prefisso: 22 },
          { rowKey: 'F', indRete: '10.0.124.0', prefisso: 23 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 3000 },
    },
  ],
};

const v5: Verifica = {
  id: 'v5',
  titolo: 'Verifica 5',
  difficolta: 'Media',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      puntiTotali: 10,
      puntiPerRiga: 2,
      reteMadre: '10.30.0.0/20',
      requisiti: [
        { nome: 'LAN_A', host: 500 },
        { nome: 'LAN_B', host: 200 },
        { nome: 'LAN_C', host: 100 },
        { nome: 'LAN_D', host: 40 },
        { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.30.0.0/20 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      puntiTotali: 8,
      puntiPerRiga: 1,
      reteMadre: '172.20.0.0/21',
      requisiti: [
        { nome: 'LAN_A', host: 250 },
        { nome: 'LAN_B', host: 120 },
        { nome: 'LAN_C', host: 60 },
        { nome: 'LAN_D', host: 28 },
        { nome: 'LAN_E', host: 12 },
        { nome: 'LAN_F', host: 5 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.20.0.0/21 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3',
      tipo: 'parametri',
      titolo: 'Esercizio 3 — Parametri di sottorete',
      puntiTotali: 7,
      puntiPerRiga: 1,
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.33.200.50/11', ipPrefisso: '10.33.200.50/11' },
        { rowKey: '172.17.130.200/13', ipPrefisso: '172.17.130.200/13' },
        { rowKey: '10.95.200.100/14', ipPrefisso: '10.95.200.100/14' },
        { rowKey: '192.168.50.199/29', ipPrefisso: '192.168.50.199/29' },
        { rowKey: '172.20.177.100/21', ipPrefisso: '172.20.177.100/21' },
        { rowKey: '10.200.64.130/18', ipPrefisso: '10.200.64.130/18' },
        { rowKey: '192.168.253.130/30', ipPrefisso: '192.168.253.130/30' },
      ],
      consegna:
        'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti. Alcuni prefissi interessano il secondo ottetto.',
    },
    {
      id: 'es4',
      tipo: 'analisi-piano',
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      puntiTotali: 5,
      bloccoPadre: '172.18.0.0/20',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 172.18.0.0/20.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '172.18.0.0', prefisso: 22 },
          { rowKey: 'B', indRete: '172.18.4.0', prefisso: 23 },
          { rowKey: 'C', indRete: '172.18.6.0', prefisso: 25 },
          { rowKey: 'D', indRete: '172.18.6.128', prefisso: 26 },
          { rowKey: 'E', indRete: '172.18.6.192', prefisso: 27 },
          { rowKey: 'F', indRete: '172.18.6.224', prefisso: 28 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 600 },
    },
  ],
};

const v6: Verifica = {
  id: 'v6',
  titolo: 'Verifica 6',
  difficolta: 'Esperta',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 1 — VLSM: piano enterprise su larga scala',
      puntiTotali: 10,
      puntiPerRiga: 2,
      reteMadre: '172.0.0.0/13',
      requisiti: [
        { nome: 'LAN_A', host: 100000 },
        { nome: 'LAN_B', host: 60000 },
        { nome: 'LAN_C', host: 30000 },
        { nome: 'LAN_D', host: 15000 },
        { nome: 'LAN_E', host: 8000 },
      ],
      consegna:
        'Applicare il VLSM alla rete 172.0.0.0/13. I prefissi utilizzati sono nell\'intervallo /15 ÷ /19.',
    },
    {
      id: 'es2',
      tipo: 'vlsm-alloc',
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      puntiTotali: 8,
      puntiPerRiga: 1,
      reteMadre: '10.200.0.0/20',
      requisiti: [
        { nome: 'LAN_A', host: 500 },
        { nome: 'LAN_B', host: 250 },
        { nome: 'LAN_C', host: 120 },
        { nome: 'LAN_D', host: 60 },
        { nome: 'LAN_E', host: 25 },
        { nome: 'LAN_F', host: 12 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.200.0.0/20 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3',
      tipo: 'parametri',
      titolo: 'Esercizio 3 — Parametri di sottorete',
      puntiTotali: 7,
      puntiPerRiga: 1,
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.160.128.1/12', ipPrefisso: '10.160.128.1/12' },
        { rowKey: '172.33.200.50/11', ipPrefisso: '172.33.200.50/11' },
        { rowKey: '10.74.100.200/13', ipPrefisso: '10.74.100.200/13' },
        { rowKey: '192.168.77.200/28', ipPrefisso: '192.168.77.200/28' },
        { rowKey: '10.10.200.250/22', ipPrefisso: '10.10.200.250/22' },
        { rowKey: '172.100.0.1/14', ipPrefisso: '172.100.0.1/14' },
        { rowKey: '10.255.255.254/30', ipPrefisso: '10.255.255.254/30' },
      ],
      consegna:
        'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti. Tutti i prefissi coinvolgono il secondo ottetto o superiore.',
    },
    {
      id: 'es4',
      tipo: 'analisi-piano',
      titolo: 'Esercizio 4 — Analisi piano VLSM di un\'infrastruttura enterprise',
      puntiTotali: 5,
      bloccoPadre: '10.0.0.0/12',
      consegna: 'Un\'organizzazione ha suddiviso il blocco 10.0.0.0/12 tra sette reparti.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.0.0.0', prefisso: 14 },
          { rowKey: 'B', indRete: '10.4.0.0', prefisso: 15 },
          { rowKey: 'C', indRete: '10.6.0.0', prefisso: 16 },
          { rowKey: 'D', indRete: '10.7.0.0', prefisso: 17 },
          { rowKey: 'E', indRete: '10.7.128.0', prefisso: 18 },
          { rowKey: 'F', indRete: '10.7.192.0', prefisso: 20 },
          { rowKey: 'G', indRete: '10.7.208.0', prefisso: 21 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 500000 },
    },
  ],
};

// ============== VERIFICHE AGGIUNTIVE ==============

const v7: Verifica = {
  id: 'v7',
  titolo: 'Verifica 7',
  difficolta: 'Base',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '192.168.20.0/24',
      requisiti: [
        { nome: 'LAN_A', host: 50 },
        { nome: 'LAN_B', host: 20 },
        { nome: 'LAN_C', host: 10 },
        { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 192.168.20.0/24 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '172.16.8.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 200 },
        { nome: 'LAN_B', host: 100 },
        { nome: 'LAN_C', host: 50 },
        { nome: 'LAN_D', host: 25 },
        { nome: 'LAN_E', host: 10 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.16.8.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.0.0.130/25', ipPrefisso: '10.0.0.130/25' },
        { rowKey: '192.168.5.50/26', ipPrefisso: '192.168.5.50/26' },
        { rowKey: '172.16.5.45/22', ipPrefisso: '172.16.5.45/22' },
        { rowKey: '10.10.10.250/28', ipPrefisso: '10.10.10.250/28' },
        { rowKey: '192.168.50.33/27', ipPrefisso: '192.168.50.33/27' },
        { rowKey: '172.16.20.100/20', ipPrefisso: '172.16.20.100/20' },
        { rowKey: '10.5.200.1/30', ipPrefisso: '10.5.200.1/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 8,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.5.0.0/21',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.5.0.0/21.',
      parteA: {
        punti: 5,
        righe: [
          { rowKey: 'A', indRete: '10.5.0.0', prefisso: 24 },
          { rowKey: 'B', indRete: '10.5.1.0', prefisso: 25 },
          { rowKey: 'C', indRete: '10.5.1.128', prefisso: 26 },
          { rowKey: 'D', indRete: '10.5.2.0', prefisso: 23 },
          { rowKey: 'E', indRete: '10.5.4.0', prefisso: 24 },
        ],
      },
      parteB: { punti: 2, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 100 },
    },
  ],
};

const v8: Verifica = {
  id: 'v8',
  titolo: 'Verifica 8',
  difficolta: 'Base',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '192.168.30.0/24',
      requisiti: [
        { nome: 'LAN_A', host: 30 },
        { nome: 'LAN_B', host: 12 },
        { nome: 'LAN_C', host: 6 },
        { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 192.168.30.0/24 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.2.0.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 150 },
        { nome: 'LAN_B', host: 80 },
        { nome: 'LAN_C', host: 40 },
        { nome: 'LAN_D', host: 20 },
        { nome: 'LAN_E', host: 10 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.2.0.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.20.0.5/25', ipPrefisso: '10.20.0.5/25' },
        { rowKey: '192.168.7.99/27', ipPrefisso: '192.168.7.99/27' },
        { rowKey: '172.18.30.100/22', ipPrefisso: '172.18.30.100/22' },
        { rowKey: '10.50.0.130/29', ipPrefisso: '10.50.0.130/29' },
        { rowKey: '192.168.100.200/26', ipPrefisso: '192.168.100.200/26' },
        { rowKey: '172.18.60.100/23', ipPrefisso: '172.18.60.100/23' },
        { rowKey: '10.1.1.5/30', ipPrefisso: '10.1.1.5/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 8,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.6.0.0/21',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.6.0.0/21.',
      parteA: {
        punti: 5,
        righe: [
          { rowKey: 'A', indRete: '10.6.0.0', prefisso: 23 },
          { rowKey: 'B', indRete: '10.6.2.0', prefisso: 24 },
          { rowKey: 'C', indRete: '10.6.3.0', prefisso: 25 },
          { rowKey: 'D', indRete: '10.6.3.128', prefisso: 26 },
          { rowKey: 'E', indRete: '10.6.4.0', prefisso: 23 },
        ],
      },
      parteB: { punti: 2, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 50 },
    },
  ],
};

const v9: Verifica = {
  id: 'v9',
  titolo: 'Verifica 9',
  difficolta: 'Alta',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '172.24.0.0/19',
      requisiti: [
        { nome: 'LAN_A', host: 2000 },
        { nome: 'LAN_B', host: 1000 },
        { nome: 'LAN_C', host: 400 },
        { nome: 'LAN_D', host: 120 },
        { nome: 'LAN_E', host: 20 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.24.0.0/19 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.55.0.0/20',
      requisiti: [
        { nome: 'LAN_A', host: 400 },
        { nome: 'LAN_B', host: 200 },
        { nome: 'LAN_C', host: 100 },
        { nome: 'LAN_D', host: 50 },
        { nome: 'LAN_E', host: 20 },
        { nome: 'LAN_F', host: 8 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.55.0.0/20 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.65.130.5/13', ipPrefisso: '10.65.130.5/13' },
        { rowKey: '172.30.50.10/22', ipPrefisso: '172.30.50.10/22' },
        { rowKey: '192.168.55.99/26', ipPrefisso: '192.168.55.99/26' },
        { rowKey: '10.40.200.50/14', ipPrefisso: '10.40.200.50/14' },
        { rowKey: '172.20.100.10/18', ipPrefisso: '172.20.100.10/18' },
        { rowKey: '10.150.130.10/15', ipPrefisso: '10.150.130.10/15' },
        { rowKey: '192.168.200.5/29', ipPrefisso: '192.168.200.5/29' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.50.0.0/16',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.50.0.0/16.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.50.0.0', prefisso: 18 },
          { rowKey: 'B', indRete: '10.50.64.0', prefisso: 19 },
          { rowKey: 'C', indRete: '10.50.96.0', prefisso: 20 },
          { rowKey: 'D', indRete: '10.50.112.0', prefisso: 21 },
          { rowKey: 'E', indRete: '10.50.120.0', prefisso: 22 },
          { rowKey: 'F', indRete: '10.50.124.0', prefisso: 23 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 5000 },
    },
  ],
};

const v10: Verifica = {
  id: 'v10',
  titolo: 'Verifica 10',
  difficolta: 'Media',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '10.10.0.0/23',
      requisiti: [
        { nome: 'LAN_A', host: 100 },
        { nome: 'LAN_B', host: 50 },
        { nome: 'LAN_C', host: 20 },
        { nome: 'LAN_D', host: 8 },
        { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.10.0.0/23 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '172.18.4.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 200 },
        { nome: 'LAN_B', host: 80 },
        { nome: 'LAN_C', host: 40 },
        { nome: 'LAN_D', host: 20 },
        { nome: 'LAN_E', host: 10 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.18.4.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.50.10.99/29', ipPrefisso: '10.50.10.99/29' },
        { rowKey: '172.20.50.150/21', ipPrefisso: '172.20.50.150/21' },
        { rowKey: '192.168.100.250/25', ipPrefisso: '192.168.100.250/25' },
        { rowKey: '10.30.200.50/23', ipPrefisso: '10.30.200.50/23' },
        { rowKey: '172.16.200.100/18', ipPrefisso: '172.16.200.100/18' },
        { rowKey: '192.168.65.99/27', ipPrefisso: '192.168.65.99/27' },
        { rowKey: '10.150.0.1/22', ipPrefisso: '10.150.0.1/22' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 6,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.16.0.0/19',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.16.0.0/19.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.16.0.0', prefisso: 22 },
          { rowKey: 'B', indRete: '10.16.4.0', prefisso: 23 },
          { rowKey: 'C', indRete: '10.16.6.0', prefisso: 24 },
          { rowKey: 'D', indRete: '10.16.7.0', prefisso: 25 },
          { rowKey: 'E', indRete: '10.16.7.128', prefisso: 26 },
        ],
      },
      parteB: { punti: 2, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 500 },
    },
  ],
};

const v11: Verifica = {
  id: 'v11',
  titolo: 'Verifica 11',
  difficolta: 'Media',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '172.20.0.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 300 },
        { nome: 'LAN_B', host: 120 },
        { nome: 'LAN_C', host: 50 },
        { nome: 'LAN_D', host: 20 },
        { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.20.0.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.40.0.0/21',
      requisiti: [
        { nome: 'LAN_A', host: 300 },
        { nome: 'LAN_B', host: 150 },
        { nome: 'LAN_C', host: 70 },
        { nome: 'LAN_D', host: 30 },
        { nome: 'LAN_E', host: 12 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.40.0.0/21 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.60.20.150/29', ipPrefisso: '10.60.20.150/29' },
        { rowKey: '172.25.130.100/22', ipPrefisso: '172.25.130.100/22' },
        { rowKey: '192.168.50.50/25', ipPrefisso: '192.168.50.50/25' },
        { rowKey: '10.45.50.130/19', ipPrefisso: '10.45.50.130/19' },
        { rowKey: '172.16.155.200/21', ipPrefisso: '172.16.155.200/21' },
        { rowKey: '192.168.250.100/26', ipPrefisso: '192.168.250.100/26' },
        { rowKey: '10.0.0.5/30', ipPrefisso: '10.0.0.5/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 6,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.30.0.0/20',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.30.0.0/20.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.30.0.0', prefisso: 22 },
          { rowKey: 'B', indRete: '10.30.4.0', prefisso: 23 },
          { rowKey: 'C', indRete: '10.30.6.0', prefisso: 25 },
          { rowKey: 'D', indRete: '10.30.6.128', prefisso: 26 },
          { rowKey: 'E', indRete: '10.30.7.0', prefisso: 24 },
        ],
      },
      parteB: { punti: 2, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 500 },
    },
  ],
};

const v12: Verifica = {
  id: 'v12',
  titolo: 'Verifica 12',
  difficolta: 'Alta',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '172.27.0.0/17',
      requisiti: [
        { nome: 'LAN_A', host: 10000 },
        { nome: 'LAN_B', host: 5000 },
        { nome: 'LAN_C', host: 2000 },
        { nome: 'LAN_D', host: 1000 },
        { nome: 'LAN_E', host: 500 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.27.0.0/17 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.60.0.0/21',
      requisiti: [
        { nome: 'LAN_A', host: 300 },
        { nome: 'LAN_B', host: 150 },
        { nome: 'LAN_C', host: 70 },
        { nome: 'LAN_D', host: 30 },
        { nome: 'LAN_E', host: 12 },
        { nome: 'LAN_F', host: 5 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.60.0.0/21 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.85.200.50/12', ipPrefisso: '10.85.200.50/12' },
        { rowKey: '172.16.50.100/13', ipPrefisso: '172.16.50.100/13' },
        { rowKey: '192.168.100.10/29', ipPrefisso: '192.168.100.10/29' },
        { rowKey: '10.55.200.200/15', ipPrefisso: '10.55.200.200/15' },
        { rowKey: '172.20.0.50/14', ipPrefisso: '172.20.0.50/14' },
        { rowKey: '10.130.65.5/18', ipPrefisso: '10.130.65.5/18' },
        { rowKey: '192.168.30.255/30', ipPrefisso: '192.168.30.255/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '172.30.0.0/16',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 172.30.0.0/16.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '172.30.0.0', prefisso: 18 },
          { rowKey: 'B', indRete: '172.30.64.0', prefisso: 19 },
          { rowKey: 'C', indRete: '172.30.96.0', prefisso: 20 },
          { rowKey: 'D', indRete: '172.30.112.0', prefisso: 21 },
          { rowKey: 'E', indRete: '172.30.120.0', prefisso: 22 },
          { rowKey: 'F', indRete: '172.30.124.0', prefisso: 24 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 5000 },
    },
  ],
};

const v13: Verifica = {
  id: 'v13',
  titolo: 'Verifica 13',
  difficolta: 'Alta',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '10.40.0.0/19',
      requisiti: [
        { nome: 'LAN_A', host: 2000 },
        { nome: 'LAN_B', host: 1000 },
        { nome: 'LAN_C', host: 500 },
        { nome: 'LAN_D', host: 200 },
        { nome: 'LAN_E', host: 50 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.40.0.0/19 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '172.22.0.0/20',
      requisiti: [
        { nome: 'LAN_A', host: 500 },
        { nome: 'LAN_B', host: 250 },
        { nome: 'LAN_C', host: 120 },
        { nome: 'LAN_D', host: 60 },
        { nome: 'LAN_E', host: 30 },
        { nome: 'LAN_F', host: 10 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.22.0.0/20 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.45.130.100/12', ipPrefisso: '10.45.130.100/12' },
        { rowKey: '172.18.200.100/13', ipPrefisso: '172.18.200.100/13' },
        { rowKey: '192.168.77.50/28', ipPrefisso: '192.168.77.50/28' },
        { rowKey: '10.75.130.50/15', ipPrefisso: '10.75.130.50/15' },
        { rowKey: '172.25.100.10/14', ipPrefisso: '172.25.100.10/14' },
        { rowKey: '10.200.130.10/18', ipPrefisso: '10.200.130.10/18' },
        { rowKey: '192.168.50.5/29', ipPrefisso: '192.168.50.5/29' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.32.0.0/17',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.32.0.0/17.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.32.0.0', prefisso: 19 },
          { rowKey: 'B', indRete: '10.32.32.0', prefisso: 20 },
          { rowKey: 'C', indRete: '10.32.48.0', prefisso: 21 },
          { rowKey: 'D', indRete: '10.32.56.0', prefisso: 22 },
          { rowKey: 'E', indRete: '10.32.60.0', prefisso: 23 },
          { rowKey: 'F', indRete: '10.32.62.0', prefisso: 24 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 1000 },
    },
  ],
};

const v14: Verifica = {
  id: 'v14',
  titolo: 'Verifica 14',
  difficolta: 'Esperta',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: piano enterprise',
      reteMadre: '10.0.0.0/11',
      requisiti: [
        { nome: 'LAN_A', host: 200000 },
        { nome: 'LAN_B', host: 100000 },
        { nome: 'LAN_C', host: 50000 },
        { nome: 'LAN_D', host: 20000 },
        { nome: 'LAN_E', host: 8000 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.0.0.0/11 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.16.0.0/16',
      requisiti: [
        { nome: 'LAN_A', host: 8000 },
        { nome: 'LAN_B', host: 4000 },
        { nome: 'LAN_C', host: 2000 },
        { nome: 'LAN_D', host: 1000 },
        { nome: 'LAN_E', host: 500 },
        { nome: 'LAN_F', host: 200 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.16.0.0/16 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.150.200.5/13', ipPrefisso: '10.150.200.5/13' },
        { rowKey: '172.50.100.50/12', ipPrefisso: '172.50.100.50/12' },
        { rowKey: '192.168.200.100/27', ipPrefisso: '192.168.200.100/27' },
        { rowKey: '10.80.130.5/15', ipPrefisso: '10.80.130.5/15' },
        { rowKey: '172.130.200.10/14', ipPrefisso: '172.130.200.10/14' },
        { rowKey: '10.220.50.10/16', ipPrefisso: '10.220.50.10/16' },
        { rowKey: '192.168.130.255/30', ipPrefisso: '192.168.130.255/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti. Tutti i prefissi coinvolgono il secondo ottetto o superiore.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM enterprise',
      bloccoPadre: '172.16.0.0/14',
      consegna: 'Un\'organizzazione ha suddiviso il blocco 172.16.0.0/14 tra sette reparti.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '172.16.0.0', prefisso: 15 },
          { rowKey: 'B', indRete: '172.18.0.0', prefisso: 16 },
          { rowKey: 'C', indRete: '172.19.0.0', prefisso: 17 },
          { rowKey: 'D', indRete: '172.19.128.0', prefisso: 19 },
          { rowKey: 'E', indRete: '172.19.160.0', prefisso: 20 },
          { rowKey: 'F', indRete: '172.19.176.0', prefisso: 21 },
          { rowKey: 'G', indRete: '172.19.184.0', prefisso: 22 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 5000 },
    },
  ],
};

const v15: Verifica = {
  id: 'v15',
  titolo: 'Verifica 15',
  difficolta: 'Esperta',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: piano enterprise',
      reteMadre: '172.32.0.0/11',
      requisiti: [
        { nome: 'LAN_A', host: 250000 },
        { nome: 'LAN_B', host: 120000 },
        { nome: 'LAN_C', host: 60000 },
        { nome: 'LAN_D', host: 30000 },
        { nome: 'LAN_E', host: 10000 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.32.0.0/11 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.96.0.0/16',
      requisiti: [
        { nome: 'LAN_A', host: 10000 },
        { nome: 'LAN_B', host: 5000 },
        { nome: 'LAN_C', host: 2500 },
        { nome: 'LAN_D', host: 1500 },
        { nome: 'LAN_E', host: 500 },
        { nome: 'LAN_F', host: 150 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.96.0.0/16 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.180.50.5/11', ipPrefisso: '10.180.50.5/11' },
        { rowKey: '172.70.130.100/12', ipPrefisso: '172.70.130.100/12' },
        { rowKey: '192.168.5.250/29', ipPrefisso: '192.168.5.250/29' },
        { rowKey: '10.99.200.10/14', ipPrefisso: '10.99.200.10/14' },
        { rowKey: '172.45.50.5/13', ipPrefisso: '172.45.50.5/13' },
        { rowKey: '10.255.0.130/16', ipPrefisso: '10.255.0.130/16' },
        { rowKey: '192.168.55.99/30', ipPrefisso: '192.168.55.99/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti. Tutti i prefissi coinvolgono il secondo ottetto.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM enterprise',
      bloccoPadre: '10.128.0.0/12',
      consegna: 'Un\'organizzazione ha suddiviso il blocco 10.128.0.0/12 tra sette reparti.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.128.0.0', prefisso: 14 },
          { rowKey: 'B', indRete: '10.132.0.0', prefisso: 15 },
          { rowKey: 'C', indRete: '10.134.0.0', prefisso: 16 },
          { rowKey: 'D', indRete: '10.135.0.0', prefisso: 17 },
          { rowKey: 'E', indRete: '10.135.128.0', prefisso: 18 },
          { rowKey: 'F', indRete: '10.135.192.0', prefisso: 20 },
          { rowKey: 'G', indRete: '10.135.208.0', prefisso: 21 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 50000 },
    },
  ],
};

const v16: Verifica = {
  id: 'v16',
  titolo: 'Verifica 16',
  difficolta: 'Esperta',
  puntiTotali: 30,
  categoria: 'verifica',
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: piano enterprise',
      reteMadre: '10.64.0.0/11',
      requisiti: [
        { nome: 'LAN_A', host: 200000 },
        { nome: 'LAN_B', host: 100000 },
        { nome: 'LAN_C', host: 50000 },
        { nome: 'LAN_D', host: 20000 },
        { nome: 'LAN_E', host: 8000 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.64.0.0/11 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '172.16.0.0/16',
      requisiti: [
        { nome: 'LAN_A', host: 8000 },
        { nome: 'LAN_B', host: 4000 },
        { nome: 'LAN_C', host: 2000 },
        { nome: 'LAN_D', host: 1000 },
        { nome: 'LAN_E', host: 500 },
        { nome: 'LAN_F', host: 200 },
        { nome: 'WAN_1', host: 2 },
        { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.16.0.0/16 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.95.130.10/11', ipPrefisso: '10.95.130.10/11' },
        { rowKey: '172.20.5.10/13', ipPrefisso: '172.20.5.10/13' },
        { rowKey: '192.168.250.10/26', ipPrefisso: '192.168.250.10/26' },
        { rowKey: '10.130.0.5/12', ipPrefisso: '10.130.0.5/12' },
        { rowKey: '172.85.50.5/14', ipPrefisso: '172.85.50.5/14' },
        { rowKey: '10.0.200.200/22', ipPrefisso: '10.0.200.200/22' },
        { rowKey: '192.168.99.99/29', ipPrefisso: '192.168.99.99/29' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM enterprise',
      bloccoPadre: '10.192.0.0/12',
      consegna: 'Un\'organizzazione ha suddiviso il blocco 10.192.0.0/12 tra sette reparti.',
      parteA: {
        punti: 3,
        righe: [
          { rowKey: 'A', indRete: '10.192.0.0', prefisso: 13 },
          { rowKey: 'B', indRete: '10.200.0.0', prefisso: 14 },
          { rowKey: 'C', indRete: '10.204.0.0', prefisso: 15 },
          { rowKey: 'D', indRete: '10.206.0.0', prefisso: 16 },
          { rowKey: 'E', indRete: '10.207.0.0', prefisso: 17 },
          { rowKey: 'F', indRete: '10.207.128.0', prefisso: 18 },
          { rowKey: 'G', indRete: '10.207.192.0', prefisso: 20 },
        ],
      },
      parteB: { punti: 1, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 5000 },
    },
  ],
};

// ============== SIMULAZIONI (esercitazioni libere) ==============

const s1: Verifica = {
  id: 's1', titolo: 'Simulazione 1', difficolta: 'Base', categoria: 'esercitazione', puntiTotali: 30,
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '192.168.5.0/24',
      requisiti: [
        { nome: 'LAN_A', host: 40 }, { nome: 'LAN_B', host: 18 },
        { nome: 'LAN_C', host: 8 }, { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 192.168.5.0/24 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.3.0.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 180 }, { nome: 'LAN_B', host: 90 },
        { nome: 'LAN_C', host: 45 }, { nome: 'LAN_D', host: 20 },
        { nome: 'LAN_E', host: 8 }, { nome: 'WAN_1', host: 2 }, { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.3.0.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.0.0.50/26', ipPrefisso: '10.0.0.50/26' },
        { rowKey: '192.168.10.100/27', ipPrefisso: '192.168.10.100/27' },
        { rowKey: '172.16.10.50/22', ipPrefisso: '172.16.10.50/22' },
        { rowKey: '10.5.5.50/28', ipPrefisso: '10.5.5.50/28' },
        { rowKey: '192.168.80.100/25', ipPrefisso: '192.168.80.100/25' },
        { rowKey: '172.16.10.100/20', ipPrefisso: '172.16.10.100/20' },
        { rowKey: '10.3.3.5/30', ipPrefisso: '10.3.3.5/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 8,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.8.0.0/21',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.8.0.0/21.',
      parteA: { punti: 5, righe: [
        { rowKey: 'A', indRete: '10.8.0.0', prefisso: 24 },
        { rowKey: 'B', indRete: '10.8.1.0', prefisso: 25 },
        { rowKey: 'C', indRete: '10.8.1.128', prefisso: 26 },
        { rowKey: 'D', indRete: '10.8.2.0', prefisso: 23 },
        { rowKey: 'E', indRete: '10.8.4.0', prefisso: 24 },
      ]},
      parteB: { punti: 2, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 50 },
    },
  ],
};

const s2: Verifica = {
  id: 's2', titolo: 'Simulazione 2', difficolta: 'Base', categoria: 'esercitazione', puntiTotali: 30,
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '192.168.80.0/24',
      requisiti: [
        { nome: 'LAN_A', host: 60 }, { nome: 'LAN_B', host: 25 },
        { nome: 'LAN_C', host: 12 }, { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 192.168.80.0/24 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '172.16.16.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 200 }, { nome: 'LAN_B', host: 100 },
        { nome: 'LAN_C', host: 50 }, { nome: 'LAN_D', host: 20 },
        { nome: 'LAN_E', host: 10 }, { nome: 'WAN_1', host: 2 }, { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.16.16.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.10.0.50/27', ipPrefisso: '10.10.0.50/27' },
        { rowKey: '192.168.20.50/26', ipPrefisso: '192.168.20.50/26' },
        { rowKey: '172.16.25.50/22', ipPrefisso: '172.16.25.50/22' },
        { rowKey: '10.15.15.50/28', ipPrefisso: '10.15.15.50/28' },
        { rowKey: '192.168.150.100/25', ipPrefisso: '192.168.150.100/25' },
        { rowKey: '172.16.40.50/20', ipPrefisso: '172.16.40.50/20' },
        { rowKey: '10.5.10.5/30', ipPrefisso: '10.5.10.5/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 8,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.9.0.0/21',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.9.0.0/21.',
      parteA: { punti: 5, righe: [
        { rowKey: 'A', indRete: '10.9.0.0', prefisso: 23 },
        { rowKey: 'B', indRete: '10.9.2.0', prefisso: 24 },
        { rowKey: 'C', indRete: '10.9.3.0', prefisso: 25 },
        { rowKey: 'D', indRete: '10.9.3.128', prefisso: 26 },
        { rowKey: 'E', indRete: '10.9.4.0', prefisso: 23 },
      ]},
      parteB: { punti: 2, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 30 },
    },
  ],
};

const s3: Verifica = {
  id: 's3', titolo: 'Simulazione 3', difficolta: 'Media', categoria: 'esercitazione', puntiTotali: 30,
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '10.15.0.0/23',
      requisiti: [
        { nome: 'LAN_A', host: 120 }, { nome: 'LAN_B', host: 60 },
        { nome: 'LAN_C', host: 25 }, { nome: 'LAN_D', host: 10 }, { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.15.0.0/23 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '172.19.4.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 250 }, { nome: 'LAN_B', host: 120 },
        { nome: 'LAN_C', host: 60 }, { nome: 'LAN_D', host: 30 },
        { nome: 'LAN_E', host: 10 }, { nome: 'WAN_1', host: 2 }, { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.19.4.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.55.20.50/29', ipPrefisso: '10.55.20.50/29' },
        { rowKey: '172.21.50.100/21', ipPrefisso: '172.21.50.100/21' },
        { rowKey: '192.168.150.250/25', ipPrefisso: '192.168.150.250/25' },
        { rowKey: '10.32.200.100/23', ipPrefisso: '10.32.200.100/23' },
        { rowKey: '172.17.200.100/18', ipPrefisso: '172.17.200.100/18' },
        { rowKey: '192.168.66.99/27', ipPrefisso: '192.168.66.99/27' },
        { rowKey: '10.155.0.1/22', ipPrefisso: '10.155.0.1/22' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 6,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.20.0.0/19',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.20.0.0/19.',
      parteA: { punti: 3, righe: [
        { rowKey: 'A', indRete: '10.20.0.0', prefisso: 22 },
        { rowKey: 'B', indRete: '10.20.4.0', prefisso: 23 },
        { rowKey: 'C', indRete: '10.20.6.0', prefisso: 24 },
        { rowKey: 'D', indRete: '10.20.7.0', prefisso: 25 },
        { rowKey: 'E', indRete: '10.20.7.128', prefisso: 26 },
      ]},
      parteB: { punti: 2, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 400 },
    },
  ],
};

const s4: Verifica = {
  id: 's4', titolo: 'Simulazione 4', difficolta: 'Media', categoria: 'esercitazione', puntiTotali: 30,
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '172.25.0.0/22',
      requisiti: [
        { nome: 'LAN_A', host: 350 }, { nome: 'LAN_B', host: 140 },
        { nome: 'LAN_C', host: 60 }, { nome: 'LAN_D', host: 20 }, { nome: 'WAN_1', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.25.0.0/22 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.45.0.0/21',
      requisiti: [
        { nome: 'LAN_A', host: 300 }, { nome: 'LAN_B', host: 150 },
        { nome: 'LAN_C', host: 70 }, { nome: 'LAN_D', host: 30 },
        { nome: 'LAN_E', host: 12 }, { nome: 'WAN_1', host: 2 }, { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.45.0.0/21 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.62.20.150/29', ipPrefisso: '10.62.20.150/29' },
        { rowKey: '172.27.130.100/22', ipPrefisso: '172.27.130.100/22' },
        { rowKey: '192.168.55.50/25', ipPrefisso: '192.168.55.50/25' },
        { rowKey: '10.47.50.130/19', ipPrefisso: '10.47.50.130/19' },
        { rowKey: '172.18.155.200/21', ipPrefisso: '172.18.155.200/21' },
        { rowKey: '192.168.252.100/26', ipPrefisso: '192.168.252.100/26' },
        { rowKey: '10.2.0.5/30', ipPrefisso: '10.2.0.5/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 6,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.40.0.0/20',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.40.0.0/20.',
      parteA: { punti: 3, righe: [
        { rowKey: 'A', indRete: '10.40.0.0', prefisso: 22 },
        { rowKey: 'B', indRete: '10.40.4.0', prefisso: 23 },
        { rowKey: 'C', indRete: '10.40.6.0', prefisso: 25 },
        { rowKey: 'D', indRete: '10.40.6.128', prefisso: 26 },
        { rowKey: 'E', indRete: '10.40.7.0', prefisso: 24 },
      ]},
      parteB: { punti: 2, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 400 },
    },
  ],
};

const s5: Verifica = {
  id: 's5', titolo: 'Simulazione 5', difficolta: 'Alta', categoria: 'esercitazione', puntiTotali: 30,
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '172.28.0.0/19',
      requisiti: [
        { nome: 'LAN_A', host: 1500 }, { nome: 'LAN_B', host: 700 },
        { nome: 'LAN_C', host: 300 }, { nome: 'LAN_D', host: 100 }, { nome: 'LAN_E', host: 30 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.28.0.0/19 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.65.0.0/20',
      requisiti: [
        { nome: 'LAN_A', host: 400 }, { nome: 'LAN_B', host: 200 },
        { nome: 'LAN_C', host: 100 }, { nome: 'LAN_D', host: 50 },
        { nome: 'LAN_E', host: 20 }, { nome: 'LAN_F', host: 8 },
        { nome: 'WAN_1', host: 2 }, { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.65.0.0/20 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.88.200.50/12', ipPrefisso: '10.88.200.50/12' },
        { rowKey: '172.17.50.100/13', ipPrefisso: '172.17.50.100/13' },
        { rowKey: '192.168.110.10/29', ipPrefisso: '192.168.110.10/29' },
        { rowKey: '10.57.200.200/15', ipPrefisso: '10.57.200.200/15' },
        { rowKey: '172.22.0.50/14', ipPrefisso: '172.22.0.50/14' },
        { rowKey: '10.132.65.5/18', ipPrefisso: '10.132.65.5/18' },
        { rowKey: '192.168.31.255/30', ipPrefisso: '192.168.31.255/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.60.0.0/16',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.60.0.0/16.',
      parteA: { punti: 3, righe: [
        { rowKey: 'A', indRete: '10.60.0.0', prefisso: 18 },
        { rowKey: 'B', indRete: '10.60.64.0', prefisso: 19 },
        { rowKey: 'C', indRete: '10.60.96.0', prefisso: 20 },
        { rowKey: 'D', indRete: '10.60.112.0', prefisso: 21 },
        { rowKey: 'E', indRete: '10.60.120.0', prefisso: 22 },
        { rowKey: 'F', indRete: '10.60.124.0', prefisso: 24 },
      ]},
      parteB: { punti: 1, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 5000 },
    },
  ],
};

const s6: Verifica = {
  id: 's6', titolo: 'Simulazione 6', difficolta: 'Alta', categoria: 'esercitazione', puntiTotali: 30,
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
      reteMadre: '10.52.0.0/19',
      requisiti: [
        { nome: 'LAN_A', host: 1800 }, { nome: 'LAN_B', host: 900 },
        { nome: 'LAN_C', host: 400 }, { nome: 'LAN_D', host: 150 }, { nome: 'LAN_E', host: 40 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.52.0.0/19 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '172.45.0.0/20',
      requisiti: [
        { nome: 'LAN_A', host: 500 }, { nome: 'LAN_B', host: 200 },
        { nome: 'LAN_C', host: 120 }, { nome: 'LAN_D', host: 60 },
        { nome: 'LAN_E', host: 30 }, { nome: 'LAN_F', host: 10 },
        { nome: 'WAN_1', host: 2 }, { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.45.0.0/20 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.47.130.100/12', ipPrefisso: '10.47.130.100/12' },
        { rowKey: '172.19.200.100/13', ipPrefisso: '172.19.200.100/13' },
        { rowKey: '192.168.79.50/28', ipPrefisso: '192.168.79.50/28' },
        { rowKey: '10.78.130.50/15', ipPrefisso: '10.78.130.50/15' },
        { rowKey: '172.26.100.10/14', ipPrefisso: '172.26.100.10/14' },
        { rowKey: '10.202.130.10/18', ipPrefisso: '10.202.130.10/18' },
        { rowKey: '192.168.51.5/29', ipPrefisso: '192.168.51.5/29' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
      bloccoPadre: '10.36.0.0/17',
      consegna: 'Un amministratore ha allocato le seguenti sottoreti all\'interno del blocco 10.36.0.0/17.',
      parteA: { punti: 3, righe: [
        { rowKey: 'A', indRete: '10.36.0.0', prefisso: 19 },
        { rowKey: 'B', indRete: '10.36.32.0', prefisso: 20 },
        { rowKey: 'C', indRete: '10.36.48.0', prefisso: 21 },
        { rowKey: 'D', indRete: '10.36.56.0', prefisso: 22 },
        { rowKey: 'E', indRete: '10.36.60.0', prefisso: 23 },
        { rowKey: 'F', indRete: '10.36.62.0', prefisso: 24 },
      ]},
      parteB: { punti: 1, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 1500 },
    },
  ],
};

const s7: Verifica = {
  id: 's7', titolo: 'Simulazione 7', difficolta: 'Esperta', categoria: 'esercitazione', puntiTotali: 30,
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: piano enterprise',
      reteMadre: '10.32.0.0/11',
      requisiti: [
        { nome: 'LAN_A', host: 180000 }, { nome: 'LAN_B', host: 90000 },
        { nome: 'LAN_C', host: 40000 }, { nome: 'LAN_D', host: 15000 }, { nome: 'LAN_E', host: 5000 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.32.0.0/11 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.48.0.0/16',
      requisiti: [
        { nome: 'LAN_A', host: 7000 }, { nome: 'LAN_B', host: 3500 },
        { nome: 'LAN_C', host: 1500 }, { nome: 'LAN_D', host: 800 },
        { nome: 'LAN_E', host: 400 }, { nome: 'LAN_F', host: 180 },
        { nome: 'WAN_1', host: 2 }, { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.48.0.0/16 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.155.200.5/13', ipPrefisso: '10.155.200.5/13' },
        { rowKey: '172.55.100.50/12', ipPrefisso: '172.55.100.50/12' },
        { rowKey: '192.168.220.100/27', ipPrefisso: '192.168.220.100/27' },
        { rowKey: '10.85.130.5/15', ipPrefisso: '10.85.130.5/15' },
        { rowKey: '172.135.200.10/14', ipPrefisso: '172.135.200.10/14' },
        { rowKey: '10.225.50.10/16', ipPrefisso: '10.225.50.10/16' },
        { rowKey: '192.168.135.255/30', ipPrefisso: '192.168.135.255/30' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM enterprise',
      bloccoPadre: '172.20.0.0/14',
      consegna: 'Un\'organizzazione ha suddiviso il blocco 172.20.0.0/14 tra sette reparti.',
      parteA: { punti: 3, righe: [
        { rowKey: 'A', indRete: '172.20.0.0', prefisso: 15 },
        { rowKey: 'B', indRete: '172.22.0.0', prefisso: 16 },
        { rowKey: 'C', indRete: '172.23.0.0', prefisso: 17 },
        { rowKey: 'D', indRete: '172.23.128.0', prefisso: 19 },
        { rowKey: 'E', indRete: '172.23.160.0', prefisso: 20 },
        { rowKey: 'F', indRete: '172.23.176.0', prefisso: 21 },
        { rowKey: 'G', indRete: '172.23.184.0', prefisso: 22 },
      ]},
      parteB: { punti: 1, numeroRighe: 2 },
      parteC: { punti: 1, hostRichiesti: 3000 },
    },
  ],
};

const s8: Verifica = {
  id: 's8', titolo: 'Simulazione 8', difficolta: 'Esperta', categoria: 'esercitazione', puntiTotali: 30,
  esercizi: [
    {
      id: 'es1', tipo: 'vlsm-alloc', puntiTotali: 10, puntiPerRiga: 2,
      titolo: 'Esercizio 1 — VLSM: piano enterprise',
      reteMadre: '172.96.0.0/11',
      requisiti: [
        { nome: 'LAN_A', host: 220000 }, { nome: 'LAN_B', host: 110000 },
        { nome: 'LAN_C', host: 55000 }, { nome: 'LAN_D', host: 25000 }, { nome: 'LAN_E', host: 9000 },
      ],
      consegna: 'Applicare il VLSM alla rete 172.96.0.0/11 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es2', tipo: 'vlsm-alloc', puntiTotali: 8, puntiPerRiga: 1,
      titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
      reteMadre: '10.112.0.0/16',
      requisiti: [
        { nome: 'LAN_A', host: 9000 }, { nome: 'LAN_B', host: 4500 },
        { nome: 'LAN_C', host: 2200 }, { nome: 'LAN_D', host: 1200 },
        { nome: 'LAN_E', host: 600 }, { nome: 'LAN_F', host: 180 },
        { nome: 'WAN_1', host: 2 }, { nome: 'WAN_2', host: 2 },
      ],
      consegna: 'Applicare il VLSM alla rete 10.112.0.0/16 per soddisfare i requisiti indicati.',
    },
    {
      id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
      titolo: 'Esercizio 3 — Parametri di sottorete',
      modalitaInput: 'ip-prefisso',
      righe: [
        { rowKey: '10.105.130.10/11', ipPrefisso: '10.105.130.10/11' },
        { rowKey: '172.25.5.10/13', ipPrefisso: '172.25.5.10/13' },
        { rowKey: '192.168.245.10/26', ipPrefisso: '192.168.245.10/26' },
        { rowKey: '10.135.0.5/12', ipPrefisso: '10.135.0.5/12' },
        { rowKey: '172.90.50.5/14', ipPrefisso: '172.90.50.5/14' },
        { rowKey: '10.5.200.200/22', ipPrefisso: '10.5.200.200/22' },
        { rowKey: '192.168.105.99/29', ipPrefisso: '192.168.105.99/29' },
      ],
      consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
    },
    {
      id: 'es4', tipo: 'analisi-piano', puntiTotali: 5,
      titolo: 'Esercizio 4 — Analisi piano VLSM enterprise',
      bloccoPadre: '10.144.0.0/12',
      consegna: 'Un\'organizzazione ha suddiviso il blocco 10.144.0.0/12 tra sette reparti.',
      parteA: { punti: 3, righe: [
        { rowKey: 'A', indRete: '10.144.0.0', prefisso: 14 },
        { rowKey: 'B', indRete: '10.148.0.0', prefisso: 15 },
        { rowKey: 'C', indRete: '10.150.0.0', prefisso: 16 },
        { rowKey: 'D', indRete: '10.151.0.0', prefisso: 17 },
        { rowKey: 'E', indRete: '10.151.128.0', prefisso: 18 },
        { rowKey: 'F', indRete: '10.151.192.0', prefisso: 20 },
        { rowKey: 'G', indRete: '10.151.208.0', prefisso: 21 },
      ]},
      parteB: { punti: 1, numeroRighe: 3 },
      parteC: { punti: 1, hostRichiesti: 40000 },
    },
  ],
};

// ============== HELPER BUILDERS ==============
// Costruiscono Verifica complete a partire da pochi parametri compatti.
// Le strutture punteggi sono fissate per livello (vedi sotto).

type AllocSpec = readonly [rowKey: string, indRete: string, prefisso: number];

interface BuildOpts {
  id: VerificaId;
  num: number;
  difficolta: Verifica['difficolta'];
  categoria: Verifica['categoria'];
  reteEs1: string; hostsEs1: number[];
  reteEs2: string; hostsEs2: number[];
  es3Ips: string[];
  es4Parent: string;
  es4Allocs: AllocSpec[];
  es4ParteBRighe: number;
  es4HostC: number;
}

function buildVerifica(o: BuildOpts): Verifica {
  const isBase = o.difficolta === 'Base';
  const isMedia = o.difficolta === 'Media';

  const es1Punti = isBase ? 8 : 10;
  const es2Punti = isBase || isMedia ? 7 : 8;
  const es4Punti = isBase ? 8 : isMedia ? 6 : 5;
  const es4ParteAPunti = isBase ? 5 : 3;
  const es4ParteBPunti = isBase || isMedia ? 2 : 1;

  const nomi5 = ['LAN_A', 'LAN_B', 'LAN_C', 'LAN_D', 'WAN_1'];
  const nomi4 = ['LAN_A', 'LAN_B', 'LAN_C', 'WAN_1'];
  const nomi7 = ['LAN_A', 'LAN_B', 'LAN_C', 'LAN_D', 'LAN_E', 'WAN_1', 'WAN_2'];
  const nomi8 = ['LAN_A', 'LAN_B', 'LAN_C', 'LAN_D', 'LAN_E', 'LAN_F', 'WAN_1', 'WAN_2'];

  const nomi1 = o.hostsEs1.length === 4 ? nomi4 : nomi5;
  const nomi2 = o.hostsEs2.length === 7 ? nomi7 : nomi8;

  const tipologia = o.categoria === 'esercitazione' ? 'Simulazione' : 'Verifica';

  return {
    id: o.id,
    titolo: `${tipologia} ${o.num}`,
    difficolta: o.difficolta,
    categoria: o.categoria,
    puntiTotali: 30,
    esercizi: [
      {
        id: 'es1', tipo: 'vlsm-alloc', puntiTotali: es1Punti, puntiPerRiga: 2,
        titolo: 'Esercizio 1 — VLSM: allocazione sottoreti',
        reteMadre: o.reteEs1,
        requisiti: o.hostsEs1.map((host, i) => ({ nome: nomi1[i], host })),
        consegna: `Applicare il VLSM alla rete ${o.reteEs1} per soddisfare i requisiti indicati.`,
      },
      {
        id: 'es2', tipo: 'vlsm-alloc', puntiTotali: es2Punti, puntiPerRiga: 1,
        titolo: 'Esercizio 2 — VLSM: piano multi-segmento',
        reteMadre: o.reteEs2,
        requisiti: o.hostsEs2.map((host, i) => ({ nome: nomi2[i], host })),
        consegna: `Applicare il VLSM alla rete ${o.reteEs2} per soddisfare i requisiti indicati.`,
      },
      {
        id: 'es3', tipo: 'parametri', puntiTotali: 7, puntiPerRiga: 1,
        titolo: 'Esercizio 3 — Parametri di sottorete',
        modalitaInput: 'ip-prefisso',
        righe: o.es3Ips.map((ip) => ({ rowKey: ip, ipPrefisso: ip })),
        consegna: 'Per ciascun indirizzo host/prefisso, determinare i parametri richiesti.',
      },
      {
        id: 'es4', tipo: 'analisi-piano', puntiTotali: es4Punti,
        titolo: 'Esercizio 4 — Analisi piano VLSM esistente',
        bloccoPadre: o.es4Parent,
        consegna: `Un amministratore ha allocato le seguenti sottoreti all'interno del blocco ${o.es4Parent}.`,
        parteA: {
          punti: es4ParteAPunti,
          righe: o.es4Allocs.map(([rowKey, indRete, prefisso]) => ({ rowKey, indRete, prefisso })),
        },
        parteB: { punti: es4ParteBPunti, numeroRighe: o.es4ParteBRighe },
        parteC: { punti: 1, hostRichiesti: o.es4HostC },
      },
    ],
  };
}

// Pattern Es.4 standard, identificati per numero di residui che generano.
// Usati ripetutamente nei builder per scalare facilmente.
const allocsBase21pat3 = (b: string): AllocSpec[] => [
  ['A', `${b}.0.0`, 24], ['B', `${b}.1.0`, 25], ['C', `${b}.1.128`, 26],
  ['D', `${b}.2.0`, 23], ['E', `${b}.4.0`, 24],
];
const allocsBase21pat2 = (b: string): AllocSpec[] => [
  ['A', `${b}.0.0`, 23], ['B', `${b}.2.0`, 24], ['C', `${b}.3.0`, 25],
  ['D', `${b}.3.128`, 26], ['E', `${b}.4.0`, 23],
];
const allocsMedia19pat3 = (b: string): AllocSpec[] => [
  ['A', `${b}.0.0`, 22], ['B', `${b}.4.0`, 23], ['C', `${b}.6.0`, 24],
  ['D', `${b}.7.0`, 25], ['E', `${b}.7.128`, 26],
];
const allocsMedia20pat2 = (b: string): AllocSpec[] => [
  ['A', `${b}.0.0`, 22], ['B', `${b}.4.0`, 23], ['C', `${b}.6.0`, 25],
  ['D', `${b}.6.128`, 26], ['E', `${b}.7.0`, 24],
];
const allocsAlta16pat3 = (b: string): AllocSpec[] => [
  ['A', `${b}.0.0`, 18], ['B', `${b}.64.0`, 19], ['C', `${b}.96.0`, 20],
  ['D', `${b}.112.0`, 21], ['E', `${b}.120.0`, 22], ['F', `${b}.124.0`, 24],
];
const allocsAlta17pat2 = (b: string): AllocSpec[] => [
  ['A', `${b}.0.0`, 19], ['B', `${b}.32.0`, 20], ['C', `${b}.48.0`, 21],
  ['D', `${b}.56.0`, 22], ['E', `${b}.60.0`, 23], ['F', `${b}.62.0`, 24],
];

// ============== VERIFICHE AGGIUNTIVE (v17–v48) ==============

// Base — 8 nuove (192.168.X.0/24 + 172.16/10 vari + parent /21)
const v17: Verifica = buildVerifica({
  id: 'v17', num: 17, difficolta: 'Base', categoria: 'verifica',
  reteEs1: '192.168.60.0/24', hostsEs1: [45, 22, 9, 2],
  reteEs2: '172.16.20.0/22', hostsEs2: [180, 90, 45, 22, 10, 2, 2],
  es3Ips: ['10.0.0.150/25', '192.168.5.50/26', '172.16.40.45/22', '10.10.10.250/28', '192.168.50.33/27', '172.16.16.100/20', '10.5.200.1/30'],
  es4Parent: '10.10.0.0/21', es4Allocs: allocsBase21pat3('10.10'), es4ParteBRighe: 3, es4HostC: 50,
});
const v18: Verifica = buildVerifica({
  id: 'v18', num: 18, difficolta: 'Base', categoria: 'verifica',
  reteEs1: '192.168.70.0/24', hostsEs1: [50, 25, 10, 2],
  reteEs2: '172.16.24.0/22', hostsEs2: [200, 100, 45, 22, 10, 2, 2],
  es3Ips: ['10.20.0.100/26', '192.168.15.99/27', '172.16.36.50/22', '10.50.5.130/28', '192.168.200.50/25', '172.16.32.10/20', '10.5.5.5/30'],
  es4Parent: '10.11.0.0/21', es4Allocs: allocsBase21pat2('10.11'), es4ParteBRighe: 2, es4HostC: 30,
});
const v19: Verifica = buildVerifica({
  id: 'v19', num: 19, difficolta: 'Base', categoria: 'verifica',
  reteEs1: '192.168.110.0/24', hostsEs1: [55, 28, 14, 6],
  reteEs2: '10.4.0.0/22', hostsEs2: [220, 110, 55, 28, 14, 2, 2],
  es3Ips: ['10.30.0.50/27', '192.168.25.99/26', '172.16.44.100/22', '10.60.30.130/29', '192.168.130.10/25', '172.16.48.50/20', '10.7.7.5/30'],
  es4Parent: '172.20.0.0/22', es4Allocs: [
    ['A', '172.20.0.0', 25], ['B', '172.20.0.128', 26], ['C', '172.20.0.192', 27],
    ['D', '172.20.1.0', 24], ['E', '172.20.2.0', 24],
  ], es4ParteBRighe: 2, es4HostC: 30,
});
const v20: Verifica = buildVerifica({
  id: 'v20', num: 20, difficolta: 'Base', categoria: 'verifica',
  reteEs1: '192.168.120.0/24', hostsEs1: [40, 18, 10, 2],
  reteEs2: '10.5.0.0/22', hostsEs2: [180, 90, 45, 20, 10, 2, 2],
  es3Ips: ['10.40.0.5/25', '192.168.45.99/27', '172.16.52.100/22', '10.70.30.130/29', '192.168.150.200/26', '172.16.64.10/20', '10.8.8.5/30'],
  es4Parent: '10.12.0.0/21', es4Allocs: allocsBase21pat3('10.12'), es4ParteBRighe: 3, es4HostC: 60,
});
const v21: Verifica = buildVerifica({
  id: 'v21', num: 21, difficolta: 'Base', categoria: 'verifica',
  reteEs1: '192.168.130.0/24', hostsEs1: [50, 20, 12, 5],
  reteEs2: '172.16.28.0/22', hostsEs2: [200, 100, 50, 25, 10, 2, 2],
  es3Ips: ['10.55.0.150/25', '192.168.65.99/26', '172.16.56.100/22', '10.80.5.130/28', '192.168.210.50/27', '172.16.80.10/20', '10.9.9.5/30'],
  es4Parent: '172.21.0.0/21', es4Allocs: [
    ['A', '172.21.0.0', 24], ['B', '172.21.1.0', 25], ['C', '172.21.1.128', 26],
    ['D', '172.21.2.0', 23], ['E', '172.21.4.0', 24],
  ], es4ParteBRighe: 3, es4HostC: 50,
});
const v22: Verifica = buildVerifica({
  id: 'v22', num: 22, difficolta: 'Base', categoria: 'verifica',
  reteEs1: '192.168.140.0/24', hostsEs1: [60, 30, 12, 6],
  reteEs2: '172.16.32.0/22', hostsEs2: [220, 110, 55, 28, 14, 2, 2],
  es3Ips: ['10.75.0.5/27', '192.168.85.150/25', '172.16.60.100/22', '10.90.30.5/29', '192.168.230.100/26', '172.16.96.10/20', '10.11.11.5/30'],
  es4Parent: '10.13.0.0/21', es4Allocs: allocsBase21pat2('10.13'), es4ParteBRighe: 2, es4HostC: 30,
});
const v23: Verifica = buildVerifica({
  id: 'v23', num: 23, difficolta: 'Base', categoria: 'verifica',
  reteEs1: '192.168.160.0/24', hostsEs1: [30, 12, 6, 2],
  reteEs2: '10.6.0.0/22', hostsEs2: [150, 80, 40, 20, 8, 2, 2],
  es3Ips: ['10.99.0.30/27', '192.168.95.100/26', '172.16.68.50/22', '10.110.5.150/28', '192.168.240.30/25', '172.16.112.10/20', '10.13.13.5/30'],
  es4Parent: '10.14.0.0/21', es4Allocs: allocsBase21pat3('10.14'), es4ParteBRighe: 3, es4HostC: 60,
});
const v24: Verifica = buildVerifica({
  id: 'v24', num: 24, difficolta: 'Base', categoria: 'verifica',
  reteEs1: '192.168.170.0/24', hostsEs1: [50, 22, 10, 2],
  reteEs2: '10.7.0.0/22', hostsEs2: [200, 100, 50, 22, 10, 2, 2],
  es3Ips: ['10.125.0.55/26', '192.168.105.200/25', '172.16.72.100/22', '10.130.30.150/29', '192.168.245.130/27', '172.16.128.10/20', '10.14.14.5/30'],
  es4Parent: '10.15.0.0/21', es4Allocs: allocsBase21pat2('10.15'), es4ParteBRighe: 2, es4HostC: 40,
});

// Media — 8 nuove (10.X /22-/23 + parent /19-/20)
const v25: Verifica = buildVerifica({
  id: 'v25', num: 25, difficolta: 'Media', categoria: 'verifica',
  reteEs1: '10.17.0.0/23', hostsEs1: [130, 60, 30, 12, 2],
  reteEs2: '172.19.8.0/22', hostsEs2: [250, 120, 60, 30, 10, 2, 2],
  es3Ips: ['10.65.20.50/29', '172.21.110.100/21', '192.168.155.250/25', '10.34.200.100/23', '172.18.230.100/18', '192.168.68.99/27', '10.157.0.1/22'],
  es4Parent: '10.24.0.0/19', es4Allocs: allocsMedia19pat3('10.24'), es4ParteBRighe: 3, es4HostC: 500,
});
const v26: Verifica = buildVerifica({
  id: 'v26', num: 26, difficolta: 'Media', categoria: 'verifica',
  reteEs1: '172.26.0.0/22', hostsEs1: [320, 130, 60, 25, 5],
  reteEs2: '10.48.0.0/21', hostsEs2: [300, 150, 70, 30, 12, 2, 2],
  es3Ips: ['10.66.20.150/29', '172.28.130.100/22', '192.168.58.50/25', '10.49.50.130/19', '172.21.155.200/21', '192.168.253.100/26', '10.3.0.5/30'],
  es4Parent: '10.34.0.0/20', es4Allocs: allocsMedia20pat2('10.34'), es4ParteBRighe: 2, es4HostC: 400,
});
const v27: Verifica = buildVerifica({
  id: 'v27', num: 27, difficolta: 'Media', categoria: 'verifica',
  reteEs1: '10.19.0.0/23', hostsEs1: [110, 50, 22, 10, 2],
  reteEs2: '172.23.8.0/22', hostsEs2: [220, 100, 50, 25, 10, 2, 2],
  es3Ips: ['10.67.30.50/29', '172.29.140.100/21', '192.168.165.250/25', '10.36.200.100/23', '172.22.235.100/18', '192.168.70.99/27', '10.159.0.1/22'],
  es4Parent: '10.26.0.0/19', es4Allocs: allocsMedia19pat3('10.26'), es4ParteBRighe: 3, es4HostC: 500,
});
const v28: Verifica = buildVerifica({
  id: 'v28', num: 28, difficolta: 'Media', categoria: 'verifica',
  reteEs1: '172.28.0.0/22', hostsEs1: [280, 140, 70, 25, 8],
  reteEs2: '10.56.0.0/21', hostsEs2: [320, 160, 80, 32, 14, 2, 2],
  es3Ips: ['10.68.40.150/29', '172.30.140.100/22', '192.168.60.150/25', '10.51.50.130/19', '172.23.160.200/21', '192.168.249.100/26', '10.17.0.5/30'],
  es4Parent: '10.36.0.0/20', es4Allocs: allocsMedia20pat2('10.36'), es4ParteBRighe: 2, es4HostC: 600,
});
const v29: Verifica = buildVerifica({
  id: 'v29', num: 29, difficolta: 'Media', categoria: 'verifica',
  reteEs1: '10.21.0.0/23', hostsEs1: [150, 70, 30, 12, 2],
  reteEs2: '172.25.8.0/22', hostsEs2: [250, 120, 50, 25, 10, 2, 2],
  es3Ips: ['10.69.50.50/29', '172.27.155.100/21', '192.168.175.250/25', '10.38.200.100/23', '172.24.245.100/18', '192.168.72.99/27', '10.161.0.1/22'],
  es4Parent: '10.28.0.0/19', es4Allocs: allocsMedia19pat3('10.28'), es4ParteBRighe: 3, es4HostC: 500,
});
const v30: Verifica = buildVerifica({
  id: 'v30', num: 30, difficolta: 'Media', categoria: 'verifica',
  reteEs1: '172.29.0.0/22', hostsEs1: [300, 140, 60, 22, 6],
  reteEs2: '10.58.0.0/21', hostsEs2: [280, 130, 60, 30, 12, 2, 2],
  es3Ips: ['10.71.60.150/29', '172.31.140.100/22', '192.168.62.150/25', '10.53.50.130/19', '172.25.170.200/21', '192.168.247.100/26', '10.19.0.5/30'],
  es4Parent: '10.38.0.0/20', es4Allocs: allocsMedia20pat2('10.38'), es4ParteBRighe: 2, es4HostC: 600,
});
const v31: Verifica = buildVerifica({
  id: 'v31', num: 31, difficolta: 'Media', categoria: 'verifica',
  reteEs1: '10.23.0.0/23', hostsEs1: [130, 50, 22, 8, 2],
  reteEs2: '172.27.8.0/22', hostsEs2: [230, 110, 55, 26, 12, 2, 2],
  es3Ips: ['10.73.70.50/29', '172.29.175.100/21', '192.168.185.250/25', '10.42.200.100/23', '172.26.205.100/18', '192.168.74.99/27', '10.163.0.1/22'],
  es4Parent: '172.22.0.0/19', es4Allocs: allocsMedia19pat3('172.22'), es4ParteBRighe: 3, es4HostC: 400,
});
const v32: Verifica = buildVerifica({
  id: 'v32', num: 32, difficolta: 'Media', categoria: 'verifica',
  reteEs1: '172.30.0.0/22', hostsEs1: [260, 130, 50, 18, 4],
  reteEs2: '10.62.0.0/21', hostsEs2: [310, 150, 75, 30, 14, 2, 2],
  es3Ips: ['10.77.80.150/29', '172.30.150.100/22', '192.168.64.150/25', '10.55.50.130/19', '172.27.180.200/21', '192.168.245.100/26', '10.21.0.5/30'],
  es4Parent: '172.24.0.0/20', es4Allocs: allocsMedia20pat2('172.24'), es4ParteBRighe: 2, es4HostC: 500,
});

// Alta — 8 nuove (172.X /17-/19 + 10.X /20 + parent /16-/17)
const v33: Verifica = buildVerifica({
  id: 'v33', num: 33, difficolta: 'Alta', categoria: 'verifica',
  reteEs1: '172.40.0.0/17', hostsEs1: [9000, 4500, 2200, 900, 400],
  reteEs2: '10.66.0.0/21', hostsEs2: [350, 170, 80, 40, 15, 5, 2, 2],
  es3Ips: ['10.87.180.50/12', '172.18.55.100/13', '192.168.115.10/29', '10.59.200.200/15', '172.21.0.50/14', '10.134.65.5/18', '192.168.32.255/30'],
  es4Parent: '172.40.0.0/16', es4Allocs: allocsAlta16pat3('172.40'), es4ParteBRighe: 3, es4HostC: 5000,
});
const v34: Verifica = buildVerifica({
  id: 'v34', num: 34, difficolta: 'Alta', categoria: 'verifica',
  reteEs1: '10.42.0.0/19', hostsEs1: [1800, 900, 450, 180, 40],
  reteEs2: '172.24.16.0/20', hostsEs2: [450, 220, 110, 55, 25, 8, 2, 2],
  es3Ips: ['10.47.135.100/12', '172.20.205.100/13', '192.168.81.50/28', '10.79.135.50/15', '172.27.105.10/14', '10.205.135.10/18', '192.168.55.5/29'],
  es4Parent: '10.38.0.0/17', es4Allocs: allocsAlta17pat2('10.38'), es4ParteBRighe: 2, es4HostC: 1200,
});
const v35: Verifica = buildVerifica({
  id: 'v35', num: 35, difficolta: 'Alta', categoria: 'verifica',
  reteEs1: '172.44.0.0/17', hostsEs1: [12000, 5500, 2500, 1100, 450],
  reteEs2: '10.70.0.0/21', hostsEs2: [400, 180, 90, 45, 18, 6, 2, 2],
  es3Ips: ['10.89.190.50/12', '172.19.60.100/13', '192.168.117.10/29', '10.61.220.200/15', '172.23.0.50/14', '10.136.65.5/18', '192.168.40.255/30'],
  es4Parent: '172.42.0.0/16', es4Allocs: allocsAlta16pat3('172.42'), es4ParteBRighe: 3, es4HostC: 6000,
});
const v36: Verifica = buildVerifica({
  id: 'v36', num: 36, difficolta: 'Alta', categoria: 'verifica',
  reteEs1: '10.44.0.0/19', hostsEs1: [2100, 1000, 480, 200, 50],
  reteEs2: '172.26.16.0/20', hostsEs2: [500, 230, 120, 60, 28, 10, 2, 2],
  es3Ips: ['10.49.140.100/12', '172.22.210.100/13', '192.168.83.50/28', '10.81.140.50/15', '172.29.110.10/14', '10.207.140.10/18', '192.168.57.5/29'],
  es4Parent: '10.40.0.0/17', es4Allocs: allocsAlta17pat2('10.40'), es4ParteBRighe: 2, es4HostC: 1500,
});
const v37: Verifica = buildVerifica({
  id: 'v37', num: 37, difficolta: 'Alta', categoria: 'verifica',
  reteEs1: '172.46.0.0/17', hostsEs1: [8000, 4000, 1800, 800, 300],
  reteEs2: '10.74.0.0/21', hostsEs2: [380, 170, 85, 40, 16, 5, 2, 2],
  es3Ips: ['10.91.195.50/12', '172.21.65.100/13', '192.168.119.10/29', '10.63.225.200/15', '172.25.0.50/14', '10.138.65.5/18', '192.168.42.255/30'],
  es4Parent: '172.44.0.0/16', es4Allocs: allocsAlta16pat3('172.44'), es4ParteBRighe: 3, es4HostC: 5500,
});
const v38: Verifica = buildVerifica({
  id: 'v38', num: 38, difficolta: 'Alta', categoria: 'verifica',
  reteEs1: '10.46.0.0/19', hostsEs1: [1700, 850, 400, 160, 30],
  reteEs2: '172.28.16.0/20', hostsEs2: [470, 220, 110, 50, 22, 8, 2, 2],
  es3Ips: ['10.51.145.100/12', '172.24.215.100/13', '192.168.85.50/28', '10.83.145.50/15', '172.31.115.10/14', '10.209.145.10/18', '192.168.59.5/29'],
  es4Parent: '10.42.0.0/17', es4Allocs: allocsAlta17pat2('10.42'), es4ParteBRighe: 2, es4HostC: 1300,
});
const v39: Verifica = buildVerifica({
  id: 'v39', num: 39, difficolta: 'Alta', categoria: 'verifica',
  reteEs1: '172.48.0.0/17', hostsEs1: [11000, 5000, 2300, 1000, 350],
  reteEs2: '10.78.0.0/21', hostsEs2: [420, 200, 100, 50, 20, 7, 2, 2],
  es3Ips: ['10.93.200.50/12', '172.23.70.100/13', '192.168.121.10/29', '10.65.230.200/15', '172.27.0.50/14', '10.140.65.5/18', '192.168.44.255/30'],
  es4Parent: '172.46.0.0/16', es4Allocs: allocsAlta16pat3('172.46'), es4ParteBRighe: 3, es4HostC: 4500,
});
const v40: Verifica = buildVerifica({
  id: 'v40', num: 40, difficolta: 'Alta', categoria: 'verifica',
  reteEs1: '10.48.0.0/19', hostsEs1: [2000, 950, 460, 190, 45],
  reteEs2: '172.30.16.0/20', hostsEs2: [490, 220, 120, 55, 25, 9, 2, 2],
  es3Ips: ['10.53.150.100/12', '172.26.220.100/13', '192.168.87.50/28', '10.85.150.50/15', '172.30.120.10/14', '10.211.150.10/18', '192.168.61.5/29'],
  es4Parent: '10.44.0.0/17', es4Allocs: allocsAlta17pat2('10.44'), es4ParteBRighe: 2, es4HostC: 1400,
});

// Esperta — 8 nuove (10.X / 172.X /10-/12 + parent /12-/14)
const v41: Verifica = buildVerifica({
  id: 'v41', num: 41, difficolta: 'Esperta', categoria: 'verifica',
  reteEs1: '10.96.0.0/11', hostsEs1: [220000, 110000, 50000, 22000, 9000],
  reteEs2: '10.80.0.0/16', hostsEs2: [9000, 4500, 2200, 1100, 550, 220, 2, 2],
  es3Ips: ['10.165.205.5/13', '172.55.105.50/12', '192.168.225.100/27', '10.85.135.5/15', '172.135.205.10/14', '10.225.55.10/16', '192.168.135.255/30'],
  es4Parent: '172.16.0.0/14', es4Allocs: [
    ['A', '172.16.0.0', 15], ['B', '172.18.0.0', 16], ['C', '172.19.0.0', 17],
    ['D', '172.19.128.0', 19], ['E', '172.19.160.0', 20], ['F', '172.19.176.0', 21],
    ['G', '172.19.184.0', 22],
  ], es4ParteBRighe: 2, es4HostC: 3000,
});
const v42: Verifica = buildVerifica({
  id: 'v42', num: 42, difficolta: 'Esperta', categoria: 'verifica',
  reteEs1: '172.64.0.0/11', hostsEs1: [200000, 100000, 50000, 20000, 8000],
  reteEs2: '10.84.0.0/16', hostsEs2: [8500, 4200, 2100, 1050, 520, 210, 2, 2],
  es3Ips: ['10.170.210.5/13', '172.60.110.50/12', '192.168.227.100/27', '10.90.140.5/15', '172.140.210.10/14', '10.230.60.10/16', '192.168.137.255/30'],
  es4Parent: '10.16.0.0/12', es4Allocs: [
    ['A', '10.16.0.0', 14], ['B', '10.20.0.0', 15], ['C', '10.22.0.0', 16],
    ['D', '10.23.0.0', 17], ['E', '10.23.128.0', 18], ['F', '10.23.192.0', 20],
    ['G', '10.23.208.0', 21],
  ], es4ParteBRighe: 3, es4HostC: 40000,
});
const v43: Verifica = buildVerifica({
  id: 'v43', num: 43, difficolta: 'Esperta', categoria: 'verifica',
  reteEs1: '10.128.0.0/11', hostsEs1: [240000, 120000, 60000, 25000, 9500],
  reteEs2: '10.88.0.0/16', hostsEs2: [9500, 4700, 2300, 1150, 580, 230, 2, 2],
  es3Ips: ['10.175.215.5/13', '172.65.115.50/12', '192.168.229.100/27', '10.95.145.5/15', '172.145.215.10/14', '10.235.65.10/16', '192.168.139.255/30'],
  es4Parent: '172.20.0.0/14', es4Allocs: [
    ['A', '172.20.0.0', 15], ['B', '172.22.0.0', 16], ['C', '172.23.0.0', 17],
    ['D', '172.23.128.0', 19], ['E', '172.23.160.0', 20], ['F', '172.23.176.0', 21],
    ['G', '172.23.184.0', 22],
  ], es4ParteBRighe: 2, es4HostC: 3000,
});
const v44: Verifica = buildVerifica({
  id: 'v44', num: 44, difficolta: 'Esperta', categoria: 'verifica',
  reteEs1: '172.128.0.0/11', hostsEs1: [180000, 90000, 45000, 18000, 7000],
  reteEs2: '10.92.0.0/16', hostsEs2: [7500, 3800, 1900, 950, 470, 190, 2, 2],
  es3Ips: ['10.180.220.5/13', '172.70.120.50/12', '192.168.231.100/27', '10.100.150.5/15', '172.150.220.10/14', '10.240.70.10/16', '192.168.141.255/30'],
  es4Parent: '10.32.0.0/12', es4Allocs: [
    ['A', '10.32.0.0', 14], ['B', '10.36.0.0', 15], ['C', '10.38.0.0', 16],
    ['D', '10.39.0.0', 17], ['E', '10.39.128.0', 18], ['F', '10.39.192.0', 20],
    ['G', '10.39.208.0', 21],
  ], es4ParteBRighe: 3, es4HostC: 45000,
});
const v45: Verifica = buildVerifica({
  id: 'v45', num: 45, difficolta: 'Esperta', categoria: 'verifica',
  reteEs1: '10.160.0.0/11', hostsEs1: [260000, 130000, 65000, 28000, 10500],
  reteEs2: '172.32.0.0/16', hostsEs2: [10500, 5200, 2500, 1200, 600, 240, 2, 2],
  es3Ips: ['10.185.225.5/13', '172.75.125.50/12', '192.168.233.100/27', '10.105.155.5/15', '172.155.225.10/14', '10.245.75.10/16', '192.168.143.255/30'],
  es4Parent: '172.24.0.0/14', es4Allocs: [
    ['A', '172.24.0.0', 15], ['B', '172.26.0.0', 16], ['C', '172.27.0.0', 17],
    ['D', '172.27.128.0', 19], ['E', '172.27.160.0', 20], ['F', '172.27.176.0', 21],
    ['G', '172.27.184.0', 22],
  ], es4ParteBRighe: 2, es4HostC: 3500,
});
const v46: Verifica = buildVerifica({
  id: 'v46', num: 46, difficolta: 'Esperta', categoria: 'verifica',
  reteEs1: '172.160.0.0/11', hostsEs1: [210000, 105000, 52000, 21000, 8500],
  reteEs2: '172.36.0.0/16', hostsEs2: [8000, 4000, 2000, 1000, 500, 200, 2, 2],
  es3Ips: ['10.190.230.5/13', '172.80.130.50/12', '192.168.235.100/27', '10.110.160.5/15', '172.160.230.10/14', '10.250.80.10/16', '192.168.145.255/30'],
  es4Parent: '10.48.0.0/12', es4Allocs: [
    ['A', '10.48.0.0', 14], ['B', '10.52.0.0', 15], ['C', '10.54.0.0', 16],
    ['D', '10.55.0.0', 17], ['E', '10.55.128.0', 18], ['F', '10.55.192.0', 20],
    ['G', '10.55.208.0', 21],
  ], es4ParteBRighe: 3, es4HostC: 38000,
});
const v47: Verifica = buildVerifica({
  id: 'v47', num: 47, difficolta: 'Esperta', categoria: 'verifica',
  reteEs1: '10.192.0.0/11', hostsEs1: [230000, 115000, 55000, 23000, 9200],
  reteEs2: '172.40.0.0/16', hostsEs2: [9200, 4600, 2300, 1150, 570, 230, 2, 2],
  es3Ips: ['10.195.235.5/13', '172.85.135.50/12', '192.168.237.100/27', '10.115.165.5/15', '172.165.235.10/14', '10.5.85.10/16', '192.168.147.255/30'],
  es4Parent: '172.28.0.0/14', es4Allocs: [
    ['A', '172.28.0.0', 15], ['B', '172.30.0.0', 16], ['C', '172.31.0.0', 17],
    ['D', '172.31.128.0', 19], ['E', '172.31.160.0', 20], ['F', '172.31.176.0', 21],
    ['G', '172.31.184.0', 22],
  ], es4ParteBRighe: 2, es4HostC: 3200,
});
const v48: Verifica = buildVerifica({
  id: 'v48', num: 48, difficolta: 'Esperta', categoria: 'verifica',
  reteEs1: '172.192.0.0/11', hostsEs1: [195000, 98000, 48000, 19000, 7500],
  reteEs2: '172.44.0.0/16', hostsEs2: [7800, 3900, 1950, 980, 490, 195, 2, 2],
  es3Ips: ['10.200.240.5/13', '172.90.140.50/12', '192.168.239.100/27', '10.120.170.5/15', '172.170.240.10/14', '10.10.90.10/16', '192.168.149.255/30'],
  es4Parent: '10.64.0.0/12', es4Allocs: [
    ['A', '10.64.0.0', 14], ['B', '10.68.0.0', 15], ['C', '10.70.0.0', 16],
    ['D', '10.71.0.0', 17], ['E', '10.71.128.0', 18], ['F', '10.71.192.0', 20],
    ['G', '10.71.208.0', 21],
  ], es4ParteBRighe: 3, es4HostC: 42000,
});

// ============== SIMULAZIONI AGGIUNTIVE (s9–s32) ==============

// Base — 6 nuove
const s9: Verifica = buildVerifica({
  id: 's9', num: 9, difficolta: 'Base', categoria: 'esercitazione',
  reteEs1: '192.168.45.0/24', hostsEs1: [40, 18, 10, 2],
  reteEs2: '172.16.36.0/22', hostsEs2: [180, 90, 45, 20, 10, 2, 2],
  es3Ips: ['10.21.0.50/26', '192.168.16.100/27', '172.16.20.50/22', '10.16.16.50/28', '192.168.155.100/25', '172.16.48.50/20', '10.6.11.5/30'],
  es4Parent: '10.16.0.0/21', es4Allocs: allocsBase21pat3('10.16'), es4ParteBRighe: 3, es4HostC: 50,
});
const s10: Verifica = buildVerifica({
  id: 's10', num: 10, difficolta: 'Base', categoria: 'esercitazione',
  reteEs1: '192.168.55.0/24', hostsEs1: [55, 25, 12, 5],
  reteEs2: '172.16.40.0/22', hostsEs2: [200, 100, 50, 22, 10, 2, 2],
  es3Ips: ['10.22.0.150/25', '192.168.17.50/26', '172.16.24.50/22', '10.17.17.50/28', '192.168.165.100/25', '172.16.64.50/20', '10.7.12.5/30'],
  es4Parent: '10.17.0.0/21', es4Allocs: allocsBase21pat2('10.17'), es4ParteBRighe: 2, es4HostC: 35,
});
const s11: Verifica = buildVerifica({
  id: 's11', num: 11, difficolta: 'Base', categoria: 'esercitazione',
  reteEs1: '192.168.65.0/24', hostsEs1: [45, 20, 8, 2],
  reteEs2: '10.8.0.0/22', hostsEs2: [180, 80, 40, 18, 8, 2, 2],
  es3Ips: ['10.23.0.100/26', '192.168.18.99/27', '172.16.28.50/22', '10.18.18.50/28', '192.168.175.100/25', '172.16.80.50/20', '10.8.13.5/30'],
  es4Parent: '10.18.0.0/21', es4Allocs: allocsBase21pat3('10.18'), es4ParteBRighe: 3, es4HostC: 60,
});
const s12: Verifica = buildVerifica({
  id: 's12', num: 12, difficolta: 'Base', categoria: 'esercitazione',
  reteEs1: '192.168.75.0/24', hostsEs1: [60, 28, 14, 6],
  reteEs2: '10.9.0.0/22', hostsEs2: [220, 110, 55, 28, 14, 2, 2],
  es3Ips: ['10.24.0.50/27', '192.168.19.99/26', '172.16.32.50/22', '10.19.19.50/29', '192.168.185.100/25', '172.16.96.50/20', '10.9.14.5/30'],
  es4Parent: '10.19.0.0/21', es4Allocs: allocsBase21pat2('10.19'), es4ParteBRighe: 2, es4HostC: 30,
});
const s13: Verifica = buildVerifica({
  id: 's13', num: 13, difficolta: 'Base', categoria: 'esercitazione',
  reteEs1: '192.168.85.0/24', hostsEs1: [30, 14, 6, 2],
  reteEs2: '172.16.44.0/22', hostsEs2: [160, 75, 38, 18, 8, 2, 2],
  es3Ips: ['10.25.0.30/27', '192.168.21.100/26', '172.16.52.50/22', '10.21.21.50/28', '192.168.195.50/25', '172.16.112.50/20', '10.11.15.5/30'],
  es4Parent: '172.22.0.0/21', es4Allocs: [
    ['A', '172.22.0.0', 24], ['B', '172.22.1.0', 25], ['C', '172.22.1.128', 26],
    ['D', '172.22.2.0', 23], ['E', '172.22.4.0', 24],
  ], es4ParteBRighe: 3, es4HostC: 50,
});
const s14: Verifica = buildVerifica({
  id: 's14', num: 14, difficolta: 'Base', categoria: 'esercitazione',
  reteEs1: '192.168.95.0/24', hostsEs1: [50, 22, 12, 4],
  reteEs2: '172.16.48.0/22', hostsEs2: [190, 95, 48, 24, 12, 2, 2],
  es3Ips: ['10.26.0.55/26', '192.168.22.200/25', '172.16.56.50/22', '10.22.22.50/29', '192.168.205.130/27', '172.16.128.50/20', '10.12.16.5/30'],
  es4Parent: '172.23.0.0/21', es4Allocs: [
    ['A', '172.23.0.0', 23], ['B', '172.23.2.0', 24], ['C', '172.23.3.0', 25],
    ['D', '172.23.3.128', 26], ['E', '172.23.4.0', 23],
  ], es4ParteBRighe: 2, es4HostC: 30,
});

// Media — 6 nuove
const s15: Verifica = buildVerifica({
  id: 's15', num: 15, difficolta: 'Media', categoria: 'esercitazione',
  reteEs1: '10.25.0.0/23', hostsEs1: [110, 50, 22, 10, 2],
  reteEs2: '172.27.16.0/22', hostsEs2: [220, 100, 50, 22, 10, 2, 2],
  es3Ips: ['10.79.20.50/29', '172.33.110.100/21', '192.168.157.250/25', '10.41.200.100/23', '172.29.200.100/18', '192.168.76.99/27', '10.165.0.1/22'],
  es4Parent: '10.50.0.0/19', es4Allocs: allocsMedia19pat3('10.50'), es4ParteBRighe: 3, es4HostC: 400,
});
const s16: Verifica = buildVerifica({
  id: 's16', num: 16, difficolta: 'Media', categoria: 'esercitazione',
  reteEs1: '172.32.0.0/22', hostsEs1: [310, 130, 60, 22, 5],
  reteEs2: '10.64.0.0/21', hostsEs2: [300, 150, 70, 30, 12, 2, 2],
  es3Ips: ['10.81.20.150/29', '172.35.130.100/22', '192.168.66.50/25', '10.57.50.130/19', '172.30.155.200/21', '192.168.243.100/26', '10.23.0.5/30'],
  es4Parent: '10.52.0.0/20', es4Allocs: allocsMedia20pat2('10.52'), es4ParteBRighe: 2, es4HostC: 500,
});
const s17: Verifica = buildVerifica({
  id: 's17', num: 17, difficolta: 'Media', categoria: 'esercitazione',
  reteEs1: '10.27.0.0/23', hostsEs1: [130, 60, 25, 10, 2],
  reteEs2: '172.33.8.0/22', hostsEs2: [240, 110, 50, 22, 10, 2, 2],
  es3Ips: ['10.83.30.50/29', '172.37.140.100/21', '192.168.167.250/25', '10.43.200.100/23', '172.32.210.100/18', '192.168.78.99/27', '10.167.0.1/22'],
  es4Parent: '10.54.0.0/19', es4Allocs: allocsMedia19pat3('10.54'), es4ParteBRighe: 3, es4HostC: 500,
});
const s18: Verifica = buildVerifica({
  id: 's18', num: 18, difficolta: 'Media', categoria: 'esercitazione',
  reteEs1: '172.34.0.0/22', hostsEs1: [280, 130, 65, 28, 6],
  reteEs2: '10.68.0.0/21', hostsEs2: [320, 160, 80, 30, 12, 2, 2],
  es3Ips: ['10.85.40.150/29', '172.39.140.100/22', '192.168.68.150/25', '10.59.50.130/19', '172.33.165.200/21', '192.168.241.100/26', '10.25.0.5/30'],
  es4Parent: '10.56.0.0/20', es4Allocs: allocsMedia20pat2('10.56'), es4ParteBRighe: 2, es4HostC: 550,
});
const s19: Verifica = buildVerifica({
  id: 's19', num: 19, difficolta: 'Media', categoria: 'esercitazione',
  reteEs1: '10.29.0.0/23', hostsEs1: [140, 65, 28, 12, 2],
  reteEs2: '172.36.8.0/22', hostsEs2: [250, 115, 55, 25, 10, 2, 2],
  es3Ips: ['10.87.50.50/29', '172.41.150.100/21', '192.168.177.250/25', '10.45.200.100/23', '172.35.215.100/18', '192.168.80.99/27', '10.169.0.1/22'],
  es4Parent: '172.26.0.0/19', es4Allocs: allocsMedia19pat3('172.26'), es4ParteBRighe: 3, es4HostC: 450,
});
const v_placeholder = 0; void v_placeholder;
const s20: Verifica = buildVerifica({
  id: 's20', num: 20, difficolta: 'Media', categoria: 'esercitazione',
  reteEs1: '172.36.0.0/22', hostsEs1: [260, 120, 55, 22, 6],
  reteEs2: '10.72.0.0/21', hostsEs2: [290, 140, 70, 30, 12, 2, 2],
  es3Ips: ['10.89.60.150/29', '172.43.150.100/22', '192.168.70.150/25', '10.61.50.130/19', '172.37.170.200/21', '192.168.239.100/26', '10.27.0.5/30'],
  es4Parent: '172.28.0.0/20', es4Allocs: allocsMedia20pat2('172.28'), es4ParteBRighe: 2, es4HostC: 500,
});

// Alta — 6 nuove
const s21: Verifica = buildVerifica({
  id: 's21', num: 21, difficolta: 'Alta', categoria: 'esercitazione',
  reteEs1: '172.50.0.0/17', hostsEs1: [10000, 5000, 2200, 1000, 400],
  reteEs2: '10.80.0.0/21', hostsEs2: [380, 180, 90, 40, 15, 5, 2, 2],
  es3Ips: ['10.95.180.50/12', '172.18.95.100/13', '192.168.123.10/29', '10.67.180.200/15', '172.21.135.50/14', '10.142.65.5/18', '192.168.46.255/30'],
  es4Parent: '172.48.0.0/16', es4Allocs: allocsAlta16pat3('172.48'), es4ParteBRighe: 3, es4HostC: 5000,
});
const s22: Verifica = buildVerifica({
  id: 's22', num: 22, difficolta: 'Alta', categoria: 'esercitazione',
  reteEs1: '10.50.0.0/19', hostsEs1: [1900, 950, 460, 180, 40],
  reteEs2: '172.32.16.0/20', hostsEs2: [460, 220, 110, 50, 22, 8, 2, 2],
  es3Ips: ['10.55.155.100/12', '172.20.225.100/13', '192.168.89.50/28', '10.87.155.50/15', '172.31.125.10/14', '10.213.155.10/18', '192.168.63.5/29'],
  es4Parent: '10.46.0.0/17', es4Allocs: allocsAlta17pat2('10.46'), es4ParteBRighe: 2, es4HostC: 1300,
});
const s23: Verifica = buildVerifica({
  id: 's23', num: 23, difficolta: 'Alta', categoria: 'esercitazione',
  reteEs1: '172.52.0.0/17', hostsEs1: [11000, 5500, 2500, 1100, 450],
  reteEs2: '10.84.0.0/21', hostsEs2: [400, 200, 100, 50, 18, 6, 2, 2],
  es3Ips: ['10.97.185.50/12', '172.19.100.100/13', '192.168.125.10/29', '10.69.185.200/15', '172.23.140.50/14', '10.144.65.5/18', '192.168.48.255/30'],
  es4Parent: '172.50.0.0/16', es4Allocs: allocsAlta16pat3('172.50'), es4ParteBRighe: 3, es4HostC: 5500,
});
const s24: Verifica = buildVerifica({
  id: 's24', num: 24, difficolta: 'Alta', categoria: 'esercitazione',
  reteEs1: '10.52.0.0/19', hostsEs1: [2200, 1100, 480, 200, 50],
  reteEs2: '172.34.16.0/20', hostsEs2: [480, 230, 110, 55, 25, 9, 2, 2],
  es3Ips: ['10.57.160.100/12', '172.22.230.100/13', '192.168.91.50/28', '10.89.160.50/15', '172.30.130.10/14', '10.215.160.10/18', '192.168.65.5/29'],
  es4Parent: '10.48.0.0/17', es4Allocs: allocsAlta17pat2('10.48'), es4ParteBRighe: 2, es4HostC: 1500,
});
const s25: Verifica = buildVerifica({
  id: 's25', num: 25, difficolta: 'Alta', categoria: 'esercitazione',
  reteEs1: '172.54.0.0/17', hostsEs1: [9500, 4700, 2100, 900, 350],
  reteEs2: '10.88.0.0/21', hostsEs2: [370, 170, 85, 38, 16, 5, 2, 2],
  es3Ips: ['10.99.190.50/12', '172.21.105.100/13', '192.168.127.10/29', '10.71.190.200/15', '172.25.145.50/14', '10.146.65.5/18', '192.168.50.255/30'],
  es4Parent: '172.52.0.0/16', es4Allocs: allocsAlta16pat3('172.52'), es4ParteBRighe: 3, es4HostC: 4800,
});
const s26: Verifica = buildVerifica({
  id: 's26', num: 26, difficolta: 'Alta', categoria: 'esercitazione',
  reteEs1: '10.54.0.0/19', hostsEs1: [1700, 850, 410, 170, 35],
  reteEs2: '172.36.16.0/20', hostsEs2: [470, 220, 110, 50, 22, 8, 2, 2],
  es3Ips: ['10.59.165.100/12', '172.24.235.100/13', '192.168.93.50/28', '10.91.165.50/15', '172.29.135.10/14', '10.217.165.10/18', '192.168.67.5/29'],
  es4Parent: '10.50.0.0/17', es4Allocs: allocsAlta17pat2('10.50'), es4ParteBRighe: 2, es4HostC: 1200,
});

// Esperta — 6 nuove
const s27: Verifica = buildVerifica({
  id: 's27', num: 27, difficolta: 'Esperta', categoria: 'esercitazione',
  reteEs1: '10.224.0.0/11', hostsEs1: [210000, 105000, 50000, 20000, 8500],
  reteEs2: '10.92.0.0/16', hostsEs2: [8200, 4100, 2050, 1020, 510, 200, 2, 2],
  es3Ips: ['10.205.245.5/13', '172.95.145.50/12', '192.168.241.100/27', '10.125.175.5/15', '172.175.245.10/14', '10.15.95.10/16', '192.168.151.255/30'],
  es4Parent: '172.32.0.0/14', es4Allocs: [
    ['A', '172.32.0.0', 15], ['B', '172.34.0.0', 16], ['C', '172.35.0.0', 17],
    ['D', '172.35.128.0', 19], ['E', '172.35.160.0', 20], ['F', '172.35.176.0', 21],
    ['G', '172.35.184.0', 22],
  ], es4ParteBRighe: 2, es4HostC: 3200,
});
const s28: Verifica = buildVerifica({
  id: 's28', num: 28, difficolta: 'Esperta', categoria: 'esercitazione',
  reteEs1: '172.96.0.0/11', hostsEs1: [195000, 98000, 48000, 19000, 7500],
  reteEs2: '172.48.0.0/16', hostsEs2: [7800, 3900, 1950, 970, 480, 195, 2, 2],
  es3Ips: ['10.210.250.5/13', '172.100.150.50/12', '192.168.243.100/27', '10.130.180.5/15', '172.180.250.10/14', '10.20.100.10/16', '192.168.153.255/30'],
  es4Parent: '10.80.0.0/12', es4Allocs: [
    ['A', '10.80.0.0', 14], ['B', '10.84.0.0', 15], ['C', '10.86.0.0', 16],
    ['D', '10.87.0.0', 17], ['E', '10.87.128.0', 18], ['F', '10.87.192.0', 20],
    ['G', '10.87.208.0', 21],
  ], es4ParteBRighe: 3, es4HostC: 41000,
});
const s29: Verifica = buildVerifica({
  id: 's29', num: 29, difficolta: 'Esperta', categoria: 'esercitazione',
  reteEs1: '10.0.0.0/11', hostsEs1: [240000, 120000, 60000, 24000, 9500],
  reteEs2: '172.52.0.0/16', hostsEs2: [9300, 4600, 2300, 1140, 560, 220, 2, 2],
  es3Ips: ['10.215.255.5/13', '172.105.155.50/12', '192.168.245.100/27', '10.135.185.5/15', '172.185.255.10/14', '10.25.105.10/16', '192.168.155.255/30'],
  es4Parent: '172.36.0.0/14', es4Allocs: [
    ['A', '172.36.0.0', 15], ['B', '172.38.0.0', 16], ['C', '172.39.0.0', 17],
    ['D', '172.39.128.0', 19], ['E', '172.39.160.0', 20], ['F', '172.39.176.0', 21],
    ['G', '172.39.184.0', 22],
  ], es4ParteBRighe: 2, es4HostC: 3400,
});
const s30: Verifica = buildVerifica({
  id: 's30', num: 30, difficolta: 'Esperta', categoria: 'esercitazione',
  reteEs1: '172.224.0.0/11', hostsEs1: [220000, 110000, 55000, 22000, 9000],
  reteEs2: '10.100.0.0/16', hostsEs2: [9000, 4500, 2200, 1100, 550, 215, 2, 2],
  es3Ips: ['10.220.10.5/13', '172.110.160.50/12', '192.168.247.100/27', '10.140.190.5/15', '172.190.10.10/14', '10.30.110.10/16', '192.168.157.255/30'],
  es4Parent: '10.96.0.0/12', es4Allocs: [
    ['A', '10.96.0.0', 14], ['B', '10.100.0.0', 15], ['C', '10.102.0.0', 16],
    ['D', '10.103.0.0', 17], ['E', '10.103.128.0', 18], ['F', '10.103.192.0', 20],
    ['G', '10.103.208.0', 21],
  ], es4ParteBRighe: 3, es4HostC: 39000,
});
const s31: Verifica = buildVerifica({
  id: 's31', num: 31, difficolta: 'Esperta', categoria: 'esercitazione',
  reteEs1: '10.32.0.0/11', hostsEs1: [180000, 90000, 45000, 18000, 7000],
  reteEs2: '172.56.0.0/16', hostsEs2: [7500, 3700, 1850, 920, 460, 185, 2, 2],
  es3Ips: ['10.225.15.5/13', '172.115.165.50/12', '192.168.249.100/27', '10.145.195.5/15', '172.195.15.10/14', '10.35.115.10/16', '192.168.159.255/30'],
  es4Parent: '172.40.0.0/14', es4Allocs: [
    ['A', '172.40.0.0', 15], ['B', '172.42.0.0', 16], ['C', '172.43.0.0', 17],
    ['D', '172.43.128.0', 19], ['E', '172.43.160.0', 20], ['F', '172.43.176.0', 21],
    ['G', '172.43.184.0', 22],
  ], es4ParteBRighe: 2, es4HostC: 3000,
});
const s32: Verifica = buildVerifica({
  id: 's32', num: 32, difficolta: 'Esperta', categoria: 'esercitazione',
  reteEs1: '172.0.0.0/11', hostsEs1: [250000, 125000, 62000, 25000, 10000],
  reteEs2: '10.108.0.0/16', hostsEs2: [10000, 5000, 2500, 1200, 600, 240, 2, 2],
  es3Ips: ['10.230.20.5/13', '172.120.170.50/12', '192.168.251.100/27', '10.150.200.5/15', '172.200.20.10/14', '10.40.120.10/16', '192.168.161.255/30'],
  es4Parent: '10.112.0.0/12', es4Allocs: [
    ['A', '10.112.0.0', 14], ['B', '10.116.0.0', 15], ['C', '10.118.0.0', 16],
    ['D', '10.119.0.0', 17], ['E', '10.119.128.0', 18], ['F', '10.119.192.0', 20],
    ['G', '10.119.208.0', 21],
  ], es4ParteBRighe: 3, es4HostC: 43000,
});

export const VERIFICHE: Verifica[] = [
  v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16,
  v17, v18, v19, v20, v21, v22, v23, v24,
  v25, v26, v27, v28, v29, v30, v31, v32,
  v33, v34, v35, v36, v37, v38, v39, v40,
  v41, v42, v43, v44, v45, v46, v47, v48,
  s1, s2, s3, s4, s5, s6, s7, s8,
  s9, s10, s11, s12, s13, s14,
  s15, s16, s17, s18, s19, s20,
  s21, s22, s23, s24, s25, s26,
  s27, s28, s29, s30, s31, s32,
];

export function getVerifica(id: string): Verifica | undefined {
  return VERIFICHE.find((v) => v.id === id);
}

export function verificheByDifficolta(d: Verifica['difficolta'], categoria: Verifica['categoria'] = 'verifica'): Verifica[] {
  return VERIFICHE.filter((v) => v.difficolta === d && v.categoria === categoria);
}

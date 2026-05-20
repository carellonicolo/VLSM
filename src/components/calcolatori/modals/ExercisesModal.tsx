

import { useState } from 'react';
import { ClipboardList, Brain, CheckCircle, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzato' | 'Esperto';

type Exercise = {
  id: string;
  title: string;
  difficulty: Difficulty;
  question: string;
  solution: string;
};

const difficultyColors: Record<Difficulty, string> = {
  Principiante: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  Intermedio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  Avanzato: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  Esperto: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
};

const ipv4Exercises: Exercise[] = [
  {
    id: 'ipv4-1',
    title: 'Conversione Binario-Decimale',
    difficulty: 'Principiante',
    question: 'Converti in decimale il seguente indirizzo IP binario:\n11000000.10101000.00000001.00001010',
    solution: '• Primo ottetto: 128 + 64 = 192\n• Secondo ottetto: 128 + 32 + 8 = 168\n• Terzo ottetto: 1 = 1\n• Quarto ottetto: 8 + 2 = 10\n\nRisultato: 192.168.1.10'
  },
  {
    id: 'ipv4-2',
    title: 'Identificazione Classe',
    difficulty: 'Principiante',
    question: 'A quale classe IP appartiene l\'indirizzo 172.16.254.1? Qual è la sua Subnet Mask di default?',
    solution: '• Il primo ottetto è 172.\n• Le Classi B vanno da 128 a 191.\n• Pertanto appartiene alla Classe B.\n• La Subnet Mask di default per la Classe B è 255.255.0.0 (o /16).'
  },
  {
    id: 'ipv4-3',
    title: 'Identificazione Rete Semplice',
    difficulty: 'Principiante',
    question: 'Dato l\'indirizzo 192.168.1.5/24, qual è l\'indirizzo di rete?',
    solution: '• Un /24 copre interamente i primi tre ottetti.\n• La porzione di rete è 192.168.1\n• La porzione host è il quarto ottetto.\n• Impostando a 0 la porzione host otteniamo la rete.\n\nRisultato: 192.168.1.0'
  },
  {
    id: 'ipv4-4',
    title: 'Da CIDR a Subnet Mask',
    difficulty: 'Intermedio',
    question: 'Converti la notazione CIDR /22 nella corrispondente Subnet Mask decimale.',
    solution: '• /22 significa 22 bit a 1:\n  11111111.11111111.11111100.00000000\n• Primo ottetto: 255\n• Secondo ottetto: 255\n• Terzo ottetto: 128+64+32+16+8+4 = 252\n• Quarto ottetto: 0\n\nRisultato: 255.255.252.0'
  },
  {
    id: 'ipv4-5',
    title: 'Block Size e Ottetto Magico',
    difficulty: 'Intermedio',
    question: 'Per una /28, qual è il "Block Size" (dimensione del blocco) e su quale ottetto viene applicato?',
    solution: '• La subnet mask per una /28 è 255.255.255.240\n• Il valore interessante (diverso da 255 e 0) è nel quarto ottetto.\n• Il Block Size si calcola sottraendo il valore interessante a 256: 256 - 240 = 16.\n\nRisultato: Il Block Size è 16 e opera sul quarto ottetto.'
  },
  {
    id: 'ipv4-6',
    title: 'Range Indirizzi Utilizzabili',
    difficulty: 'Intermedio',
    question: 'Dato l\'indirizzo di rete 10.1.1.0/29, scrivi il primo e l\'ultimo IP assegnabile agli host.',
    solution: '• /29 = 255.255.255.248\n• Block Size: 256 - 248 = 8.\n• La rete successiva sarà 10.1.1.8.\n• Il Broadcast dell\'attuale rete è 10.1.1.7 (uno in meno della successiva).\n• Range utilizzabile: dal Network + 1 al Broadcast - 1.\n\nRisultato: Da 10.1.1.1 a 10.1.1.6'
  },
  {
    id: 'ipv4-7',
    title: 'Subnetting FLSM Base',
    difficulty: 'Avanzato',
    question: 'Hai a disposizione la rete 192.168.5.0/24. Il tuo capo ti chiede di creare almeno 6 sottoreti di uguali dimensioni. Quanti bit per la porzione di rete devi "prendere in prestito"? Quale sarà il nuovo CIDR?',
    solution: '• Per creare 6 sottoreti, serve applicare la formula 2^n >= 6.\n• 2^2 = 4 (insufficiente)\n• 2^3 = 8 (sufficiente)\n• Devi prendere in prestito 3 bit.\n• Il nuovo CIDR sarà 24 (originale) + 3 = /27.\n\nRisultato: 3 bit prestati, nuovo CIDR /27.'
  },
  {
    id: 'ipv4-8',
    title: 'Calcolo Host per Subnet',
    difficulty: 'Avanzato',
    question: 'Quanti host UTILIZZABILI supporta una sottorete con prefisso /23?',
    solution: '• Totale bit per gli indirizzi IPv4 = 32.\n• Bit per l\'host: 32 - 23 = 9 bit.\n• Formula host totali: 2^9 = 512.\n• Formula host utilizzabili (tolti Network e Broadcast): 2^9 - 2 = 510.\n\nRisultato: 510 host.'
  },
  {
    id: 'ipv4-9',
    title: 'Identificazione IP valido (Tranello)',
    difficulty: 'Avanzato',
    question: 'L\'indirizzo 172.16.5.255/23 può essere assegnato a un PC o a una stampante?',
    solution: 'Sì. Anche se finisce con .255, dobbiamo verificare se è un indirizzo di broadcast per la sua rete.\n• /23 = mask 255.255.254.0\n• Block size nel terzo ottetto: 256 - 254 = 2.\n• Reti: 172.16.0.0, 172.16.2.0, 172.16.4.0, 172.16.6.0...\n• La rete in questione è 172.16.4.0/23, che arriva fino al broadcast 172.16.5.255.\n\nRisultato: NO. 172.16.5.255 è esattamente il Broadcast Address di quella subnet e non può essere assegnato a un host!'
  },
  {
    id: 'ipv4-10',
    title: 'Progetto VLSM',
    difficulty: 'Esperto',
    question: 'Hai a disposizione la rete 10.0.0.0/24. Devi suddividerla con metodo VLSM per 3 reparti: \n- Reparto A: 50 host\n- Reparto B: 30 host\n- Reparto C: 10 host\nIndica la network e il CIDR per ciascun reparto.',
    solution: '1. Reparto A (50 host): Serve /26 (64 IP, 62 host).\n   • Subnet: 10.0.0.0/26 (Range: .1 - .62, Broadcast: .63)\n\n2. Reparto B (30 host): Serve /27 (32 IP, 30 host).\n   • Subnet partendo dalla fine della precedente: 10.0.0.64/27 (Range: .65 - .94, Broadcast: .95)\n\n3. Reparto C (10 host): Serve /28 (16 IP, 14 host).\n   • Subnet partendo dalla fine della precedente: 10.0.0.96/28 (Range: .97 - .110, Broadcast: .111)'
  },
  {
    id: 'ipv4-11',
    title: 'Supernetting (Route Summarization)',
    difficulty: 'Esperto',
    question: 'Sei un amministratore di un router e hai le seguenti 4 reti nella routing table:\n192.168.0.0/24\n192.168.1.0/24\n192.168.2.0/24\n192.168.3.0/24\nQual è la rotta riassuntiva (supernet) più efficiente che copre esattamente queste quattro reti?',
    solution: '• I primi 2 ottetti sono identici (192.168).\n• Analizziamo il terzo ottetto in binario:\n  0 = 00000000\n  1 = 00000001\n  2 = 00000010\n  3 = 00000011\n• I primi 6 bit del terzo ottetto (000000) sono identici per tutte e quattro le reti.\n• I bit totali in comune sono: 8 (primo) + 8 (secondo) + 6 (terzo) = 22 bit in comune.\n\nRisultato: La rotta riassuntiva è 192.168.0.0/22.'
  }
];

const ipv6Exercises: Exercise[] = [
  {
    id: 'ipv6-1',
    title: 'Compressione Zeri (Base)',
    difficulty: 'Principiante',
    question: 'Abbrevia il seguente indirizzo IPv6 espanso secondo le regole standard:\n2001:0db8:0000:0000:0000:ff00:0042:8329',
    solution: '1. Rimuovi gli zeri iniziali in ogni blocco hextet: 2001:db8:0:0:0:ff00:42:8329\n2. Sostituisci i gruppi di zeri consecutivi più lunghi con i doppi due punti "::"\n\nRisultato: 2001:db8::ff00:42:8329'
  },
  {
    id: 'ipv6-2',
    title: 'Espansione Indirizzo',
    difficulty: 'Principiante',
    question: 'Espandi il seguente indirizzo IPv6 compresso nella sua forma completa a 32 cifre esadecimali (8 blocchi):\nfe80::1',
    solution: '1. "::" indica una serie di blocchi formati da zeri.\n2. L\'indirizzo ha visibili solo due blocchi (fe80 e 1), quindi ne mancano 6 (8 - 2 = 6).\n3. Riempi i 6 blocchi mancanti con zeri: fe80:0000:0000:0000:0000:0000:0000:0001\n\nRisultato: fe80:0000:0000:0000:0000:0000:0000:0001'
  },
  {
    id: 'ipv6-3',
    title: 'Indirizzo di Loopback',
    difficulty: 'Principiante',
    question: 'Qual è l\'indirizzo IPv6 di loopback (l\'equivalente di 127.0.0.1 in IPv4) in forma abbreviata?',
    solution: 'L\'indirizzo di loopback IPv6 espanso è 0000:0000:0000:0000:0000:0000:0000:0001.\nApplicando le regole di compressione, tutti i primi 7 blocchi formano "::".\n\nRisultato: ::1'
  },
  {
    id: 'ipv6-4',
    title: 'Identificazione Prefix e Interface ID',
    difficulty: 'Intermedio',
    question: 'Dato l\'indirizzo 2001:db8:acad:1:a1b2:c3d4:e5f6:7890/64, separa il Prefix di Rete dall\'Interface ID.',
    solution: '• La notazione /64 significa che i primi 64 bit (i primi 4 blocchi) sono per la rete.\n• I restanti 64 bit (gli ultimi 4 blocchi) sono l\'Interface ID (l\'host).\n\n• Prefix: 2001:db8:acad:1::/64\n• Interface ID: a1b2:c3d4:e5f6:7890'
  },
  {
    id: 'ipv6-5',
    title: 'Creazione Subnet da un /48',
    difficulty: 'Intermedio',
    question: 'Ti viene assegnato il prefisso aziendale 2001:db8:abcd::/48. Vuoi creare la prima subnet e la decima subnet per le tue LAN. Ricorda che la lunghezza standard per le LAN è /64.',
    solution: 'Da /48 a /64 abbiamo 16 bit (un intero blocco hextet) da usare come "Subnet ID", che va da 0000 a FFFF.\n\n• Prima subnet (Subnet ID 0): 2001:db8:abcd:0000::/64 (abbreviata: 2001:db8:abcd::/64)\n• Decima subnet (Subnet ID 9): 2001:db8:abcd:0009::/64 (abbreviata: 2001:db8:abcd:9::/64)'
  },
  {
    id: 'ipv6-6',
    title: 'Link-Local e Multicast',
    difficulty: 'Avanzato',
    question: 'Come riconosci a colpo d\'occhio un indirizzo Link-Local e un indirizzo Multicast in IPv6?',
    solution: '• Link-Local: Inizia sempre con FE80::/10 (in pratica, i primi 10 bit sono 1111 1110 10, e solitamente vedi FE80... FE81... fino a FEBF, ma FE80 è lo standard universale).\n• Multicast: Inizia sempre con FF00::/8 (il primo ottetto è interamente a 1: 1111 1111, quindi inizia sempre per FF).'
  },
  {
    id: 'ipv6-7',
    title: 'Tipi di Global Unicast',
    difficulty: 'Avanzato',
    question: 'A cosa corrisponde la gamma 2000::/3 in IPv6?',
    solution: 'La gamma 2000::/3 rappresenta gli indirizzi "Global Unicast" attualmente assegnati per l\'uso pubblico su Internet.\nQuesto significa che i primi 3 bit sono 001. Di conseguenza, tutti gli indirizzi IPv6 pubblici instradabili su internet oggi iniziano con un esadecimale pari a 2 o 3 (es. 2001:, 2a02:, 3ffe:).'
  },
  {
    id: 'ipv6-8',
    title: 'Pianificazione di Rete Aziendale',
    difficulty: 'Esperto',
    question: 'Un Provider (ISP) fornisce alla tua azienda multinazionale un blocco /32. Tu, come capo dell\'IT, decidi di assegnare a ogni tua sede nel mondo un prefisso /48. \nQuante sedi diverse potrai gestire? E ogni sede quante reti LAN /64 potrà creare?',
    solution: '1. Sedi gestibili:\n   Passare da un /32 a un /48 significa usare 16 bit per identificare la sede (48 - 32 = 16).\n   Sedi totali: 2^16 = 65.536 sedi diverse.\n\n2. LAN per ogni sede:\n   Ogni sede ha un /48. Passare da /48 a /64 per le LAN significa usare altri 16 bit per il Subnet ID (64 - 48 = 16).\n   Reti LAN per sede: 2^16 = 65.536 reti LAN per ogni singola sede.\n\nRisultato: Con un blocco /32 puoi servire 65.536 sedi, e ognuna avrà a disposizione 65.536 LAN. L\'abbondanza dell\'IPv6!'
  }
];

function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <Card className="mb-4 shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-3">
            <span>{exercise.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold tracking-wide ${difficultyColors[exercise.difficulty]}`}>
              {exercise.difficulty}
            </span>
          </CardTitle>
          {showSolution && <CheckCircle className="h-4 w-4 text-green-500 hidden sm:block" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm font-medium whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-100 dark:border-slate-800">
          {exercise.question}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={showSolution ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setShowSolution(!showSolution)}
            className="w-full sm:w-auto"
          >
            {showSolution ? (
              <><EyeOff className="h-4 w-4 mr-2" /> Nascondi Soluzione</>
            ) : (
              <><Eye className="h-4 w-4 mr-2" /> Mostra Soluzione</>
            )}
          </Button>
          {showSolution && <CheckCircle className="h-4 w-4 text-green-500 sm:hidden" />}
        </div>

        {showSolution && (
          <div className="bg-muted/80 p-4 rounded-lg text-sm border-l-4 border-l-green-500 whitespace-pre-wrap mt-4 animate-in fade-in slide-in-from-top-2">
            {exercise.solution}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ExercisesModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <ClipboardList className="h-4 w-4 mr-2" />
          <span>Esercizi</span>
        </Button>
      </DialogTrigger>
      {/* Mobile only icon trigger if screen is very small */}
      <DialogTrigger asChild className="sm:hidden">
        <Button variant="ghost" size="icon" title="Esercizi">
          <ClipboardList className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Palestra Subnetting
          </DialogTitle>
          <DialogDescription>
            Più di 15 esercizi strutturati per livello di difficoltà. Dalle basi matematiche ai progetti complessi di VLSM. Allenati prima della verifica!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ipv4" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 sticky top-0 z-10 bg-background">
            <TabsTrigger value="ipv4" className="font-semibold">Esercizi IPv4 ({ipv4Exercises.length})</TabsTrigger>
            <TabsTrigger value="ipv6" className="font-semibold">Esercizi IPv6 ({ipv6Exercises.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ipv4" className="space-y-4 py-4 focus:outline-none">
            {ipv4Exercises.map((exercise) => (
              <ExerciseItem key={exercise.id} exercise={exercise} />
            ))}
          </TabsContent>

          <TabsContent value="ipv6" className="space-y-4 py-4 focus:outline-none">
            {ipv6Exercises.map((exercise) => (
              <ExerciseItem key={exercise.id} exercise={exercise} />
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

import { BookOpen, Binary, Network, Calculator, Lightbulb, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function GuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <BookOpen className="h-4 w-4 mr-2" />
          <span>Guida</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <Tabs defaultValue="ipv4" className="w-full">
          <div className="sticky top-0 bg-background border-b px-6 pt-6 pb-3">
            <DialogHeader className="pr-10">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Guida Completa al Subnetting
              </DialogTitle>
              <DialogDescription>
                Impara il subnetting IPv4 e IPv6 da zero con questa guida passo-passo
              </DialogDescription>
            </DialogHeader>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="ipv4">IPv4</TabsTrigger>
              <TabsTrigger value="ipv6">IPv6</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 pb-6">

          {/* IPv4 SECTION */}
          <TabsContent value="ipv4" className="space-y-6 py-4">
            {/* Sezione 1: Storia dell'Indirizzamento IP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  1. La Storia dell&apos;Indirizzamento IP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  L&apos;indirizzamento IP ha radici profonde nella storia di Internet. All&apos;inizio degli anni &apos;70, con lo sviluppo di <strong>ARPANET</strong> (il precursore di Internet), si rese necessario un sistema standardizzato per far comunicare computer di reti diverse.
                </p>
                
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold">La Nascita di IPv4 (1981)</h4>
                  <p>
                    Nel 1981 venne pubblicato il documento ufficiale (RFC 791) che definiva l&apos;<strong>Internet Protocol version 4 (IPv4)</strong>. Venne stabilito che gli indirizzi sarebbero stati lunghi 32 bit, permettendo teoricamente circa <strong>4,3 miliardi di indirizzi unici</strong>. All&apos;epoca, quando i computer erano macchinari giganteschi e costosi, 4 miliardi sembravano un numero infinito!
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">L&apos;Era delle Classi (Classful Addressing)</h4>
                  <p>
                    Inizialmente, lo spazio degli indirizzi IP fu rigidamente diviso in &quot;Classi&quot; predefinite. Questo sistema assegnava i blocchi di indirizzi in modo fisso:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                    <li><strong>Classe A:</strong> Per governi e multinazionali (16 milioni di host per rete).</li>
                    <li><strong>Classe B:</strong> Per grandi aziende e università (65.000 host per rete).</li>
                    <li><strong>Classe C:</strong> Per piccole reti (254 host per rete).</li>
                  </ul>
                  <p className="mt-2 text-red-600 dark:text-red-400 font-medium">
                    Il problema? Uno spreco enorme! Se un&apos;azienda aveva 300 computer, una Classe C (254) era troppo piccola, ma una Classe B (65.000) era inutilmente gigantesca, sprecando decine di migliaia di indirizzi IP preziosi.
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">L&apos;Esaurimento e la Soluzione: Il CIDR</h4>
                  <p>
                    Nei primi anni &apos;90, con il boom del World Wide Web, divenne chiaro che gli indirizzi IPv4 si sarebbero esauriti molto prima del previsto. Per ritardare l&apos;esaurimento (in attesa di IPv6), nel 1993 fu introdotto il <strong>CIDR (Classless Inter-Domain Routing)</strong>. 
                  </p>
                  <p>
                    Il CIDR eliminò le vecchie &quot;Classi&quot; rigide, permettendo di ritagliare reti <em>su misura</em> per le reali necessità delle aziende, usando le <strong>Subnet Mask</strong> per definire i confini delle reti in modo flessibile.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 2: Il Sistema Binario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Binary className="h-5 w-5 text-primary" />
                  2. Nozioni sull&apos;Indirizzamento: Il Sistema Binario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  I computer &quot;pensano&quot; in <strong>binario</strong>: solo 0 e 1. Tutte le nozioni di rete, anche se le leggiamo con numeri decimali, sono basate su sequenze di bit.
                </p>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold">Conversione Decimale → Binario (per l&apos;IP 192.168.1.100):</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-mono bg-background p-2 rounded">
                      <span>192</span>
                      <span>→</span>
                      <span>11000000</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-mono bg-background p-2 rounded">
                      <span>168</span>
                      <span>→</span>
                      <span>10101000</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-mono bg-background p-2 rounded">
                      <span>1</span>
                      <span>→</span>
                      <span>00000001</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-mono bg-background p-2 rounded">
                      <span>100</span>
                      <span>→</span>
                      <span>01100100</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-sm font-mono bg-background p-3 rounded">
                    <div className="text-xs text-muted-foreground mb-1">L&apos;indirizzo in forma binaria completa:</div>
                    <div className="break-all">11000000.10101000.00000001.01100100</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      ↑ Sono esattamente 32 bit (4 ottetti × 8 bit)
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs">
                    <strong>💡 Tip:</strong> Ogni ottetto è di 8 bit. Un numero a 8 bit può avere 2^8 (cioè 256) combinazioni. Ecco perché ogni numero di un IP va da 0 a 255!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 3: Subnet Mask */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  3. Nozioni sull&apos;Indirizzamento: La Subnet Mask
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Ora che sappiamo che tutto è in binario, introduciamo la <strong>Subnet Mask</strong> (Maschera di Sottorete). Essa funge da &quot;filtro&quot; per dividere i 32 bit in due parti distinte:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🌐 Parte Rete (I bit a &quot;1&quot;)</h4>
                    <p className="text-xs">
                      Identifica la tua strada (o il CAP). Tutti i computer della stessa rete locale devono avere questa parte perfettamente identica.
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🏠 Parte Host (I bit a &quot;0&quot;)</h4>
                    <p className="text-xs">
                      Identifica il numero civico specifico di un dispositivo all&apos;interno di quella strada. Deve essere unico per ogni computer.
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="text-sm font-semibold">Esempio Visivo in Decimale:</p>

                  <div className="space-y-2 text-sm font-mono">
                    <div className="bg-background p-3 rounded">
                      <div className="text-xs text-muted-foreground mb-1">IP Address:</div>
                      <div><span className="text-blue-600">192.168.1</span>.<span className="text-green-600">100</span></div>
                    </div>

                    <div className="bg-background p-3 rounded">
                      <div className="text-xs text-muted-foreground mb-1">Subnet Mask:</div>
                      <div><span className="text-blue-600">255.255.255</span>.<span className="text-green-600">0</span></div>
                    </div>
                  </div>

                  <div className="text-xs bg-primary/10 p-3 rounded">
                    <p className="mb-2"><strong>La Logica della Maschera:</strong></p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>I 255 (tutti &quot;1&quot; in binario) &quot;bloccano&quot; i numeri: il <span className="text-blue-600">192.168.1</span> è la base fissa della rete.</li>
                      <li>Lo 0 (tutti &quot;0&quot; in binario) lascia libero l&apos;ultimo blocco: i numeri da 1 a 254 possono essere assegnati ai vari PC (<span className="text-green-600">100</span> in questo caso).</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 4: Cos'è un indirizzo IP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  4. Il Protocollo IP (Cos&apos;è un Indirizzo IP?)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Alla luce di quanto appena visto sulla natura binaria e sulle subnet mask, possiamo definire formalmente cosa sia un <strong>Indirizzo IP (Internet Protocol)</strong>.
                </p>
                <p className="text-sm">
                  È l&apos;identificativo numerico fondamentale (composto da 32 bit in IPv4) che assegna una posizione logica univoca a qualsiasi dispositivo connesso a una rete informatica. Permette ai router di sapere dove spedire i &quot;pacchetti&quot; di dati.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">📍 IP Pubblico</h4>
                    <p className="text-xs text-muted-foreground">
                      Un indirizzo univoco in <strong>tutto il mondo</strong>. I router di internet lo usano per recapitare i dati a casa tua o ai grandi server (es. 8.8.8.8 è un server di Google).
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🏠 IP Privato</h4>
                    <p className="text-xs text-muted-foreground">
                      Un indirizzo valido <strong>solo all&apos;interno</strong> della tua rete locale (es. 192.168.1.100). Viene nascosto a internet tramite un processo chiamato NAT (Network Address Translation).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 5: Notazione CIDR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  5. Notazione CIDR (Classless Inter-Domain Routing)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium mb-2">Perché scriverla lunga quando si può abbreviare?</p>
                  <p className="text-sm">
                    Come accennato nella storia, il CIDR è nato per slegare le reti dai vecchi confini fissi delle classi. Ma il CIDR ha portato anche un immenso vantaggio pratico: un nuovo modo, conciso ed elegante, per comunicare la Subnet Mask, chiamato <strong>notazione Slash</strong> (o notazione a prefisso).
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <p>
                    Invece di scrivere laboriosamente la maschera per esteso (<code className="bg-muted px-1.5 py-0.5 rounded">255.255.255.0</code>), si conta semplicemente <strong>il numero di bit a &quot;1&quot;</strong> presenti nella maschera (da sinistra verso destra). 
                  </p>
                  <p>
                    Visto che 255 in binario corrisponde a otto bit &quot;1&quot; (11111111), la maschera 255.255.255.0 è formata da 8 + 8 + 8 = 24 bit a &quot;1&quot;. Quindi la si può indicare semplicemente scrivendo <strong>/24</strong> alla fine dell&apos;indirizzo IP.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-3">La Matematica Dietro al CIDR:</p>
                  <div className="space-y-3">
                    <div className="text-sm font-mono bg-background p-3 rounded">
                      <div className="text-xs text-muted-foreground mb-1">Esempio con /24:</div>
                      <div>Bit a 1:  <span className="text-blue-600">11111111.11111111.11111111</span>.<span className="text-green-600">00000000</span></div>
                      <div>Decimale: <span className="text-blue-600">255     .255     .255</span>     .<span className="text-green-600">0</span></div>
                    </div>
                    <div className="text-sm font-mono bg-background p-3 rounded">
                      <div className="text-xs text-muted-foreground mb-1">Esempio con /26:</div>
                      <div>Bit a 1:  <span className="text-blue-600">11111111.11111111.11111111.11</span><span className="text-green-600">000000</span></div>
                      <div>Decimale: <span className="text-blue-600">255     .255     .255     .192</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mt-4">
                  <h4 className="font-semibold">I Superpoteri del CIDR: La Flessibilità</h4>
                  <p>
                    Oltre ad accorciare la scrittura, la notazione CIDR esprime una granularità pazzesca:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Un <strong>/24</strong> lascia 8 bit per gli host (2^8 = 256 IP, 254 utilizzabili).</li>
                    <li>Aggiungendo un solo bit alla rete (<strong>/25</strong>), si dimezzano gli host disponibili (2^7 = 128 IP, 126 utilizzabili).</li>
                    <li>Sottraendo un bit alla rete (<strong>/23</strong>), si raddoppiano gli host disponibili (2^9 = 512 IP, 510 utilizzabili). Questa tecnica è nota anche come <strong>Supernetting</strong> o Route Summarization, ed è essenziale nei router di Internet per snellire le enormi tabelle di routing.</li>
                  </ul>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mt-4">
                  <p className="text-sm font-semibold mb-2">📊 Tabella di Riferimento Rapido CIDR:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">CIDR</th>
                          <th className="p-2 text-left">Subnet Mask</th>
                          <th className="p-2 text-left">Host Utilizzabili</th>
                          <th className="p-2 text-left">Uso Comune</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        <tr className="border-t">
                          <td className="p-2">/23</td>
                          <td className="p-2">255.255.254.0</td>
                          <td className="p-2">510</td>
                          <td className="p-2 font-sans">Scuole / Aziende Medie</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/24</td>
                          <td className="p-2">255.255.255.0</td>
                          <td className="p-2">254</td>
                          <td className="p-2 font-sans">Rete piccola/domestica</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/25</td>
                          <td className="p-2">255.255.255.128</td>
                          <td className="p-2">126</td>
                          <td className="p-2 font-sans">Suddivisione in due (Subnet)</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/26</td>
                          <td className="p-2">255.255.255.192</td>
                          <td className="p-2">62</td>
                          <td className="p-2 font-sans">Piccolo ufficio</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/27</td>
                          <td className="p-2">255.255.255.224</td>
                          <td className="p-2">30</td>
                          <td className="p-2 font-sans">Team/Dipartimento</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/30</td>
                          <td className="p-2">255.255.255.252</td>
                          <td className="p-2">2</td>
                          <td className="p-2 font-sans">Link punto-a-punto router</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 6: Esempio Pratico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  6. Esempio Pratico Passo-Passo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-semibold">Scenario: Vuoi creare una rete per un ufficio con 50 computer</p>

                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Step 1: Scegli l&apos;IP di partenza</p>
                    <p className="text-sm font-mono">192.168.1.0</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (IP privato - perfetto per reti locali)
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Step 2: Calcola il CIDR necessario</p>
                    <p className="text-sm">50 computer + 2 (network + broadcast) = 52 indirizzi necessari</p>
                    <p className="text-sm mt-2">2^6 = 64 indirizzi → Usiamo <strong>/26</strong></p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (/26 = 64 indirizzi, di cui 62 utilizzabili)
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Step 3: Risultato finale</p>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rete:</span>
                        <span>192.168.1.0/26</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subnet Mask:</span>
                        <span>255.255.255.192</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Primo IP:</span>
                        <span>192.168.1.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ultimo IP:</span>
                        <span>192.168.1.62</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Broadcast:</span>
                        <span>192.168.1.63</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 7: Come Calcolare Manualmente */}
            <Card>
              <CardHeader>
                <CardTitle>7. Come Calcolare Subnet Manualmente (Metodo Rapido)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Impara a calcolare subnet con carta e penna! Ecco un metodo semplice:</p>

                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Passo 1: Memorizza la &quot;Tabella Magica&quot;</p>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-xs font-mono text-center">
                      <div className="bg-background p-2 rounded">128</div>
                      <div className="bg-background p-2 rounded">64</div>
                      <div className="bg-background p-2 rounded">32</div>
                      <div className="bg-background p-2 rounded">16</div>
                      <div className="bg-background p-2 rounded">8</div>
                      <div className="bg-background p-2 rounded">4</div>
                      <div className="bg-background p-2 rounded">2</div>
                      <div className="bg-background p-2 rounded">1</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Questi sono i valori dei bit in un ottetto</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Passo 2: Formula Veloce per Host</p>
                    <div className="bg-background p-3 rounded text-sm">
                      <p className="font-mono mb-2">Host Utilizzabili = 2^n - 2</p>
                      <p className="text-xs text-muted-foreground">
                        dove <strong>n</strong> = numero di bit per gli host (32 - CIDR)
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Passo 3: Trucco del &quot;Block Size&quot;</p>
                    <div className="bg-background p-3 rounded space-y-2">
                      <p className="text-sm">Per /26: 256 - 192 = <strong>64</strong> (block size)</p>
                      <p className="text-sm">Le subnet iniziano ogni 64 indirizzi:</p>
                      <div className="font-mono text-xs space-y-1 mt-2">
                        <div>• 0, 64, 128, 192</div>
                        <div className="text-muted-foreground">→ 192.168.1.0, 192.168.1.64, 192.168.1.128, 192.168.1.192</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">📝 Esercizio Pratico:</p>
                  <p className="text-sm mb-2">Calcola 172.16.50.0/27 manualmente:</p>
                  <ul className="text-xs space-y-1 list-decimal list-inside ml-2">
                    <li>27 bit di rete = 32-27 = 5 bit per host</li>
                    <li>2^5 = 32 indirizzi totali, 30 utilizzabili</li>
                    <li>Block size = 256 - 224 = 32</li>
                    <li>Subnet più vicina a .50 = .32 (32, 64, 96...)</li>
                    <li>Range: 172.16.50.32 - 172.16.50.63</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 8: Errori Comuni */}
            <Card>
              <CardHeader>
                <CardTitle>8. Errori Comuni da Evitare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="text-sm font-semibold">❌ Dimenticare Network e Broadcast</p>
                    <p className="text-xs text-muted-foreground">
                      Ricorda sempre di sottrarre 2 dal totale degli indirizzi disponibili!
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="text-sm font-semibold">❌ Confondere CIDR più grande = più host</p>
                    <p className="text-xs text-muted-foreground">
                      Al contrario! /24 ha PIÙ host di /28. Più grande il numero CIDR, più piccola la rete, perché significa che più bit sono &quot;bloccati&quot; per la rete.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="text-sm font-semibold">❌ Usare .0 o .255 come IP host (in una /24)</p>
                    <p className="text-xs text-muted-foreground">
                      In una /24, 192.168.1.0 è network e 192.168.1.255 è broadcast - non assegnabili a un PC!
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="text-sm font-semibold">❌ Non allineare le subnet</p>
                    <p className="text-xs text-muted-foreground">
                      Le subnet devono iniziare su multipli del block size (es. /26: 0, 64, 128, 192)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 9: Casi d'Uso Reali */}
            <Card>
              <CardHeader>
                <CardTitle>9. Casi d&apos;Uso nel Mondo Reale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">🏢 Azienda con 3 Dipartimenti</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Problema:</strong> Dividere 192.168.10.0/24 per Vendite (100 PC), IT (50 PC), Admin (20 PC)</p>
                      <p><strong>Soluzione VLSM:</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
                        <li>Vendite: 192.168.10.0/25 (126 host) ✓</li>
                        <li>IT: 192.168.10.128/26 (62 host) ✓</li>
                        <li>Admin: 192.168.10.192/27 (30 host) ✓</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">🏠 Rete Domestica</p>
                    <div className="text-xs">
                      <p><strong>Tipico:</strong> 192.168.1.0/24</p>
                      <p className="mt-1">Perfetto per casa! 254 dispositivi disponibili (Wi-Fi, PC, smartphone, IoT, etc.)</p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">🔗 Link Punto-a-Punto</p>
                    <div className="text-xs">
                      <p><strong>Router-to-Router:</strong> 10.0.0.0/30</p>
                      <p className="mt-1">Solo 2 IP utilizzabili - ideale per collegare due router sprecando zero IP!</p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">☁️ Cloud/Server Farm</p>
                    <div className="text-xs">
                      <p><strong>Tipico:</strong> 10.0.0.0/16 suddiviso in reti /24 per ciascun servizio</p>
                      <p className="mt-1">Permette 256 subnet da 254 host ciascuna - massima flessibilità per architetture complesse.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 10: Tips & Tricks */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>💡 10. Tips & Tricks per Imparare</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Memorizza le potenze di 2:</strong> 2, 4, 8, 16, 32, 64, 128, 256</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Usa questo tool:</strong> Prova diversi IP e CIDR per vedere i risultati in tempo reale</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Parti da /24:</strong> È la subnet più comune e la più facile da visualizzare mentalmente.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Ricorda la regola inversa:</strong> Più grande è il CIDR (es. /30), meno host sono disponibili.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Pratica:</strong> Fai esercizi con carta e penna, e usa la scheda &quot;Esercizi&quot; in alto per metterti alla prova!</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sezione 11: Glossario */}
            <Card>
              <CardHeader>
                <CardTitle>📖 11. Glossario Rapido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Network Address:</strong>
                    <p className="text-xs text-muted-foreground">Il primissimo IP della subnet. Identifica la rete stessa e non è assegnabile ai PC.</p>
                  </div>
                  <div>
                    <strong>Broadcast Address:</strong>
                    <p className="text-xs text-muted-foreground">L&apos;ultimo IP della subnet. È l&apos;indirizzo usato per inviare un messaggio a *tutti* i dispositivi della rete contemporaneamente.</p>
                  </div>
                  <div>
                    <strong>Host:</strong>
                    <p className="text-xs text-muted-foreground">Qualsiasi dispositivo finale connesso alla rete (PC, smartphone, stampante, Smart TV, ecc.) a cui è assegnato un IP univoco.</p>
                  </div>
                  <div>
                    <strong>Subnet:</strong>
                    <p className="text-xs text-muted-foreground">Una &quot;sottorete&quot;, ovvero una divisione logica di una rete IP più grande, per migliorare prestazioni e sicurezza.</p>
                  </div>
                  <div>
                    <strong>Gateway (Default Gateway):</strong>
                    <p className="text-xs text-muted-foreground">L&apos;indirizzo IP del router interno alla rete, che funge da &quot;porta d&apos;uscita&quot; per raggiungere Internet (solitamente è il primo IP utilizzabile, es. .1).</p>
                  </div>
                  <div>
                    <strong>VLSM (Variable Length Subnet Mask):</strong>
                    <p className="text-xs text-muted-foreground">Tecnica avanzata di subnetting che permette di dividere una rete in subnet di dimensioni *diverse* per evitare sprechi di indirizzi IP.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IPv6 SECTION */}
          <TabsContent value="ipv6" className="space-y-6 py-4">
            {/* Sezione 1: Cos'è un indirizzo IPv6 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  1. Cos&apos;è un Indirizzo IPv6?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  <strong>IPv6 (Internet Protocol version 6)</strong> è la versione più recente del protocollo Internet,
                  progettata per sostituire IPv4. La caratteristica principale è lo spazio di indirizzamento
                  di <strong>128 bit</strong>, che fornisce circa <strong>340 undecilioni</strong> di indirizzi unici!
                </p>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold">Esempio pratico:</p>
                  <p className="text-sm font-mono">2001:0db8:85a3:0000:0000:8a2e:0370:7334</p>
                  <p className="text-xs text-muted-foreground">
                    Questo indirizzo è composto da 8 gruppi di 4 cifre esadecimali (chiamati <strong>hextets</strong>) separati da due punti.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🌍 Spazio Enorme</h4>
                    <p className="text-xs text-muted-foreground">
                      2^128 indirizzi vs 2^32 di IPv4 - praticamente infiniti!
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">⚡ Auto-configurazione</h4>
                    <p className="text-xs text-muted-foreground">
                      Supporto nativo per SLAAC - configurazione automatica
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 2: Il Sistema Esadecimale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Binary className="h-5 w-5 text-primary" />
                  2. Il Sistema Esadecimale e Formato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  IPv6 usa il sistema <strong>esadecimale</strong> (base 16) per rappresentare i 128 bit.
                  I caratteri vanno da 0-9 e a-f (16 possibili valori).
                </p>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold">Regole di Abbreviazione:</p>

                  <div className="space-y-2">
                    <div className="bg-background p-3 rounded">
                      <p className="font-medium text-sm mb-1">1. Rimozione degli zeri iniziali</p>
                      <p className="font-mono text-xs">
                        2001:0db8:0000:0042 → 2001:db8:0:42
                      </p>
                    </div>
                    <div className="bg-background p-3 rounded">
                      <p className="font-medium text-sm mb-1">2. Compressione con :: (una sola volta)</p>
                      <p className="font-mono text-xs">
                        2001:0db8:0000:0000:0000:0000:0000:0001 → 2001:db8::1
                      </p>
                    </div>
                    <div className="bg-background p-3 rounded">
                      <p className="font-medium text-sm mb-1">3. Combinazione di entrambe</p>
                      <p className="font-mono text-xs">
                        fe80:0000:0000:0000:0204:61ff:fe9d:f156 → fe80::204:61ff:fe9d:f156
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs">
                    <strong>💡 Tip:</strong> Ogni hextet è di 16 bit. 8 hextets × 16 bit = 128 bit totali!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 3: Tipi di Indirizzi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  3. Tipi di Indirizzi IPv6
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  IPv6 ha diversi tipi di indirizzi, ognuno con uno scopo specifico:
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🌐 Global Unicast (2000::/3)</h4>
                    <p className="text-xs">
                      Indirizzi pubblici routable globalmente su Internet. Equivalente agli IP pubblici IPv4.
                    </p>
                    <p className="font-mono text-xs mt-1">Es: 2001:db8::/32</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🔗 Link-Local (fe80::/10)</h4>
                    <p className="text-xs">
                      Validi solo sul link locale, auto-configurati. Non routable oltre il segmento di rete.
                    </p>
                    <p className="font-mono text-xs mt-1">Es: fe80::1</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🏠 Unique Local (fc00::/7)</h4>
                    <p className="text-xs">
                      Equivalente agli indirizzi privati IPv4 (192.168.x.x). Per reti private.
                    </p>
                    <p className="font-mono text-xs mt-1">Es: fd00::/8</p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-950 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">📡 Multicast (ff00::/8)</h4>
                    <p className="text-xs">
                      Per comunicazioni one-to-many. IPv6 non usa broadcast, solo multicast.
                    </p>
                    <p className="font-mono text-xs mt-1">Es: ff02::1</p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">⚙️ Indirizzi Speciali:</p>
                  <ul className="text-xs space-y-1">
                    <li><span className="font-mono">::1</span> - Loopback (come 127.0.0.1 in IPv4)</li>
                    <li><span className="font-mono">::</span> - Unspecified (come 0.0.0.0 in IPv4)</li>
                    <li><span className="font-mono">::ffff:0:0/96</span> - IPv4-mapped IPv6 addresses</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 4: Notazione CIDR */}
            <Card>
              <CardHeader>
                <CardTitle>4. Notazione CIDR (Prefix Length)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Come in IPv4, si usa la notazione <code className="bg-muted px-2 py-1 rounded">/n</code> dove n indica quanti bit identificano la rete (da 0 a 128).
                </p>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">📊 Allocazioni Comuni in IPv6:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Prefix</th>
                          <th className="p-2 text-left">Numero di Subnet/Host</th>
                          <th className="p-2 text-left">Uso Tipico</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        <tr className="border-t">
                          <td className="p-2">/3</td>
                          <td className="p-2">Global Unicast Space</td>
                          <td className="p-2 font-sans">Internet globale</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/32</td>
                          <td className="p-2">65,536 subnet /64</td>
                          <td className="p-2 font-sans">Allocazione ISP</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/48</td>
                          <td className="p-2">65,536 subnet /64</td>
                          <td className="p-2 font-sans">Organizzazione/Sito</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/56</td>
                          <td className="p-2">256 subnet /64</td>
                          <td className="p-2 font-sans">Utente domestico</td>
                        </tr>
                        <tr className="border-t bg-primary/10">
                          <td className="p-2">/64</td>
                          <td className="p-2">2^64 host</td>
                          <td className="p-2 font-sans"><strong>Subnet LAN standard</strong></td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">/128</td>
                          <td className="p-2">1 host</td>
                          <td className="p-2 font-sans">Singolo dispositivo</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-l-4 border-primary pl-3 bg-primary/5 p-3 rounded-r">
                  <p className="font-medium text-sm mb-1">⚠️ Best Practice: Usa sempre /64 per le LAN</p>
                  <p className="text-xs">
                    Anche con pochi dispositivi, /64 garantisce compatibilità con SLAAC e tutti i protocolli IPv6!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 5: Esempio Pratico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  5. Esempio Pratico Passo-Passo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-semibold">Scenario: Pianificare la rete IPv6 per un&apos;organizzazione</p>

                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Step 1: Ottieni allocazione dall&apos;ISP</p>
                    <p className="text-sm font-mono">2001:db8:1234::/48</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hai 65,536 possibili subnet /64 disponibili!
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Step 2: Pianifica le subnet per dipartimenti</p>
                    <p className="text-sm">Con /48, puoi creare subnet /64 per ogni ufficio/reparto:</p>
                    <ul className="text-xs mt-2 space-y-1 font-mono">
                      <li>→ Ufficio 1: 2001:db8:1234:0001::/64</li>
                      <li>→ Ufficio 2: 2001:db8:1234:0002::/64</li>
                      <li>→ Data Center: 2001:db8:1234:000a::/64</li>
                      <li>→ WiFi Ospiti: 2001:db8:1234:00ff::/64</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Step 3: Configurazione automatica</p>
                    <p className="text-sm">Con SLAAC, i dispositivi si configurano automaticamente!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Il router invia Router Advertisement con il prefix, i dispositivi generano il proprio indirizzo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 6: Subnetting IPv6 */}
            <Card>
              <CardHeader>
                <CardTitle>6. Come Fare Subnetting in IPv6</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Il subnetting in IPv6 è più semplice di IPv4, grazie allo spazio enorme!</p>

                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Differenze Chiave da IPv4:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>Non servono network address e broadcast address riservati</li>
                      <li>Non c&apos;è bisogno di &quot;risparmiare&quot; indirizzi - lo spazio è enorme</li>
                      <li>Si usano nibble boundaries (4 bit) per facilità di lettura</li>
                      <li>Standard: /64 per le LAN, /48 per organizzazioni</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Metodo Pratico:</p>
                    <div className="bg-background p-3 rounded space-y-2 text-xs">
                      <div>
                        <strong>1. Parti dal prefix ricevuto:</strong>
                        <p className="font-mono">2001:db8::/32</p>
                      </div>
                      <div>
                        <strong>2. Estendi a /48 per il sito:</strong>
                        <p className="font-mono">2001:db8:XXXX::/48 (65,536 possibilità)</p>
                      </div>
                      <div>
                        <strong>3. Crea subnet /64 per ogni LAN:</strong>
                        <p className="font-mono">2001:db8:XXXX:YYYY::/64</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">📝 Esercizio:</p>
                  <p className="text-sm mb-2">Da 2001:db8:abcd::/48, crea 4 subnet per:</p>
                  <ul className="text-xs space-y-1 ml-2">
                    <li>• LAN Ufficio → 2001:db8:abcd:0001::/64</li>
                    <li>• WiFi → 2001:db8:abcd:0002::/64</li>
                    <li>• Server → 2001:db8:abcd:0010::/64</li>
                    <li>• DMZ → 2001:db8:abcd:00ff::/64</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 7: Errori Comuni */}
            <Card>
              <CardHeader>
                <CardTitle>7. Errori Comuni da Evitare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="text-sm font-semibold">❌ Usare subnet più piccole di /64 per LAN</p>
                    <p className="text-xs text-muted-foreground">
                      SLAAC richiede /64! Non funzionerà con prefix più lunghi.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="text-sm font-semibold">❌ Cercare di &quot;risparmiare&quot; indirizzi</p>
                    <p className="text-xs text-muted-foreground">
                      In IPv6 non è necessario! Hai miliardi di miliardi di indirizzi disponibili.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="text-sm font-semibold">❌ Non abbreviare correttamente</p>
                    <p className="text-xs text-muted-foreground">
                      Ricorda: :: può essere usato una sola volta per indirizzo!
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="text-sm font-semibold">❌ Dimenticare link-local addresses</p>
                    <p className="text-xs text-muted-foreground">
                      Ogni interfaccia IPv6 ha sempre un indirizzo link-local (fe80::)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 8: Casi d'Uso Reali */}
            <Card>
              <CardHeader>
                <CardTitle>8. Casi d&apos;Uso nel Mondo Reale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">🏢 Grande Organizzazione</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Allocazione:</strong> 2001:db8::/32 dall&apos;ISP</p>
                      <p><strong>Struttura:</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
                        <li>Sede 1: 2001:db8:0001::/48 (65K subnet)</li>
                        <li>Sede 2: 2001:db8:0002::/48 (65K subnet)</li>
                        <li>Data Center: 2001:db8:ff00::/48</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">🏠 Rete Domestica</p>
                    <div className="text-xs">
                      <p><strong>Allocazione ISP:</strong> 2001:db8:1234:5600::/56</p>
                      <p className="mt-1">256 subnet /64 per casa! Puoi avere una subnet dedicata per ogni stanza!</p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">🔗 IoT e Smart Devices</p>
                    <div className="text-xs">
                      <p><strong>Vantaggio IPv6:</strong> Ogni dispositivo ha un IP pubblico!</p>
                      <p className="mt-1">Non serve più NAT - comunicazione diretta end-to-end.</p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">☁️ Cloud Infrastructure</p>
                    <div className="text-xs">
                      <p><strong>Best Practice:</strong> /48 per cliente, /64 per ogni VPC/subnet</p>
                      <p className="mt-1">Isolamento semplice e massima scalabilità!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 9: Best Practices */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>💡 Best Practices e Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Usa sempre /64 per LAN:</strong> È lo standard e garantisce compatibilità totale</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Pianifica la gerarchia:</strong> Usa nibble boundaries per leggibilità (/48, /52, /56, /64)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Documenta l&apos;allocazione:</strong> Mantieni una mappa degli assegnamenti</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Abilita SLAAC:</strong> Lascia che i dispositivi si configurino automaticamente</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Non risparmiare indirizzi:</strong> Lo spazio è virtualmente infinito!</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Usa questo tool:</strong> Sperimenta con diversi prefix e vedi le possibilità</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sezione 10: Glossario */}
            <Card>
              <CardHeader>
                <CardTitle>📖 Glossario Rapido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Hextet:</strong>
                    <p className="text-xs text-muted-foreground">Gruppo di 4 cifre esadecimali in un indirizzo IPv6</p>
                  </div>
                  <div>
                    <strong>SLAAC:</strong>
                    <p className="text-xs text-muted-foreground">Stateless Address Autoconfiguration - configurazione automatica</p>
                  </div>
                  <div>
                    <strong>Link-Local:</strong>
                    <p className="text-xs text-muted-foreground">Indirizzo valido solo sul segmento di rete locale (fe80::)</p>
                  </div>
                  <div>
                    <strong>Global Unicast:</strong>
                    <p className="text-xs text-muted-foreground">Indirizzo IPv6 pubblico routable su Internet</p>
                  </div>
                  <div>
                    <strong>Prefix Length:</strong>
                    <p className="text-xs text-muted-foreground">Numero di bit che identificano la rete (notazione /n)</p>
                  </div>
                  <div>
                    <strong>EUI-64:</strong>
                    <p className="text-xs text-muted-foreground">Metodo per generare l&apos;identificatore di interfaccia da MAC</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

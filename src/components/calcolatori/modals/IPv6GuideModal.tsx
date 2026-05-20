

import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export function IPv6GuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Guida IPv6</span>
          <span className="sm:hidden">Guida</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guida Completa IPv6 Subnetting</DialogTitle>
          <DialogDescription>
            Tutto ciò che devi sapere sul subnetting IPv6
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* Introduzione */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Introduzione a IPv6</h3>
            <div className="space-y-2">
              <p>
                IPv6 (Internet Protocol version 6) è la versione più recente del protocollo Internet,
                progettata per sostituire IPv4. La caratteristica principale è lo spazio di indirizzamento
                di 128 bit, che fornisce 2^128 (circa 340 undecilioni) di indirizzi unici.
              </p>
              <p className="font-mono text-xs bg-muted p-2 rounded">
                Esempio: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
              </p>
            </div>
          </section>

          <Separator />

          {/* Formato Indirizzo */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Formato dell&apos;Indirizzo IPv6</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Struttura Base</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>128 bit divisi in 8 gruppi di 16 bit (chiamati &quot;hextets&quot; o &quot;fields&quot;)</li>
                  <li>Ogni gruppo rappresentato da 4 cifre esadecimali (0-9, a-f)</li>
                  <li>I gruppi sono separati da due punti (:)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Regole di Abbreviazione</h4>
                <div className="space-y-2">
                  <div className="bg-muted p-3 rounded">
                    <p className="font-medium mb-1">1. Rimozione degli zeri iniziali</p>
                    <p className="font-mono text-xs">
                      2001:0db8:0000:0042 → 2001:db8:0:42
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <p className="font-medium mb-1">2. Compressione con :: (una sola volta per indirizzo)</p>
                    <p className="font-mono text-xs">
                      2001:0db8:0000:0000:0000:0000:0000:0001 → 2001:db8::1
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <p className="font-medium mb-1">3. Combinazione di entrambe</p>
                    <p className="font-mono text-xs">
                      fe80:0000:0000:0000:0204:61ff:fe9d:f156 → fe80::204:61ff:fe9d:f156
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Tipi di Indirizzo */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Tipi di Indirizzi IPv6</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                    Global Unicast (2000::/3)
                  </h4>
                  <p className="text-xs">
                    Indirizzi pubblici routable globalmente su Internet. Equivalente agli IP pubblici IPv4.
                  </p>
                  <p className="font-mono text-xs mt-1">Es: 2001:db8::/32</p>
                </div>

                <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                    Link-Local (fe80::/10)
                  </h4>
                  <p className="text-xs">
                    Validi solo sul link locale, auto-configurati. Non routable oltre il segmento di rete.
                  </p>
                  <p className="font-mono text-xs mt-1">Es: fe80::1</p>
                </div>

                <div className="border rounded-lg p-3 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">
                    Unique Local (fc00::/7)
                  </h4>
                  <p className="text-xs">
                    Equivalente agli indirizzi privati IPv4 (10.0.0.0/8, 192.168.0.0/16).
                    Per reti private.
                  </p>
                  <p className="font-mono text-xs mt-1">Es: fd00::/8</p>
                </div>

                <div className="border rounded-lg p-3 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                    Multicast (ff00::/8)
                  </h4>
                  <p className="text-xs">
                    Per comunicazioni one-to-many. IPv6 non usa broadcast, solo multicast.
                  </p>
                  <p className="font-mono text-xs mt-1">Es: ff02::1 (tutti i nodi)</p>
                </div>
              </div>

              <div className="border rounded-lg p-3 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Indirizzi Speciali
                </h4>
                <ul className="text-xs space-y-1 mt-2">
                  <li><span className="font-mono">::1</span> - Loopback (equivalente a 127.0.0.1 in IPv4)</li>
                  <li><span className="font-mono">::</span> - Unspecified (equivalente a 0.0.0.0 in IPv4)</li>
                  <li><span className="font-mono">::ffff:0:0/96</span> - IPv4-mapped IPv6 addresses</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* Prefix Length */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Prefix Length (Notazione CIDR)</h3>
            <div className="space-y-3">
              <p>
                Il prefix length indica quanti bit dall&apos;inizio dell&apos;indirizzo identificano la rete.
                Scritto come /n dove n va da 0 a 128.
              </p>

              <div className="bg-muted p-3 rounded space-y-2">
                <h4 className="font-medium">Allocazioni Comuni</h4>
                <div className="space-y-1 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <span>/3</span>
                    <span className="text-muted-foreground">Global Unicast Space</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span>/32</span>
                    <span className="text-muted-foreground">Allocazione ISP tipica</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span>/48</span>
                    <span className="text-muted-foreground">Allocazione organizzazione/sito</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span>/56</span>
                    <span className="text-muted-foreground">Allocazione utente domestico</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-semibold">
                    <span>/64</span>
                    <span className="text-muted-foreground">Subnet standard (RACCOMANDATO)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span>/128</span>
                    <span className="text-muted-foreground">Singolo host</span>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-primary pl-3 bg-primary/5 p-3 rounded-r">
                <p className="font-medium mb-1">Best Practice: Usa sempre /64 per le LAN</p>
                <p className="text-xs">
                  Anche se hai pochi dispositivi, usa sempre /64 per le subnet LAN. Questo è richiesto
                  per SLAAC (Stateless Address Autoconfiguration) e garantisce compatibilità con tutti
                  i protocolli IPv6.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Subnetting */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Subnetting in IPv6</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Differenze rispetto a IPv4</h4>
                <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                  <li>Non c&apos;è bisogno di network address e broadcast address riservati</li>
                  <li>Lo spazio di indirizzamento è così vasto che la conservazione degli indirizzi non è un problema</li>
                  <li>Si usa sempre la notazione prefix length (/n), mai subnet mask in formato decimale</li>
                  <li>Le subnet sono generalmente allineate ai nibble (4 bit) per facilità di lettura</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Esempio Pratico</h4>
                <div className="bg-muted p-3 rounded space-y-2 text-xs">
                  <div>
                    <strong>Allocazione iniziale ISP:</strong>
                    <p className="font-mono">2001:db8::/32</p>
                  </div>
                  <div>
                    <strong>Assegnazione a organizzazione:</strong>
                    <p className="font-mono">2001:db8:1234::/48</p>
                    <p className="text-muted-foreground">
                      (da /32 a /48 = 2^16 = 65,536 organizzazioni possibili)
                    </p>
                  </div>
                  <div>
                    <strong>Subnet interne all&apos;organizzazione:</strong>
                    <p className="font-mono">
                      2001:db8:1234:0001::/64 - Ufficio 1<br />
                      2001:db8:1234:0002::/64 - Ufficio 2<br />
                      2001:db8:1234:000a::/64 - Data Center<br />
                      ...
                    </p>
                    <p className="text-muted-foreground">
                      (da /48 a /64 = 2^16 = 65,536 subnet possibili)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* SLAAC */}
          <section>
            <h3 className="text-lg font-semibold mb-3">SLAAC (Stateless Address Autoconfiguration)</h3>
            <div className="space-y-2">
              <p>
                SLAAC permette ai dispositivi di auto-configurare automaticamente i propri indirizzi IPv6
                senza bisogno di un server DHCP.
              </p>
              <div className="bg-muted p-3 rounded space-y-2 text-xs">
                <p><strong>Come funziona:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Il dispositivo genera un indirizzo link-local (fe80::)</li>
                  <li>Invia un Router Solicitation (RS) message</li>
                  <li>Riceve un Router Advertisement (RA) con il prefix di rete</li>
                  <li>Combina il prefix con un identificatore di interfaccia (EUI-64 o random)</li>
                  <li>L&apos;indirizzo risultante è utilizzabile sulla rete</li>
                </ol>
                <p className="border-l-2 border-primary pl-2 mt-2">
                  <strong>Nota:</strong> SLAAC richiede che la subnet sia /64, motivo per cui /64
                  è lo standard per le LAN IPv6.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Best Practices */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <div className="border-l-4 border-green-500 pl-3 bg-green-50 dark:bg-green-950/20 p-2 rounded-r">
                  <p className="font-medium text-sm">✓ Usa sempre /64 per subnet LAN</p>
                  <p className="text-xs text-muted-foreground">
                    Anche con pochi host, /64 garantisce compatibilità con SLAAC e altri protocolli
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-3 bg-green-50 dark:bg-green-950/20 p-2 rounded-r">
                  <p className="font-medium text-sm">✓ Pianifica la gerarchia delle subnet</p>
                  <p className="text-xs text-muted-foreground">
                    Usa nibble (4 bit) boundaries per facilità di lettura e gestione
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-3 bg-green-50 dark:bg-green-950/20 p-2 rounded-r">
                  <p className="font-medium text-sm">✓ Documenta il tuo schema di indirizzamento</p>
                  <p className="text-xs text-muted-foreground">
                    Mantieni una mappa chiara di come sono allocate le subnet
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-3 bg-red-50 dark:bg-red-950/20 p-2 rounded-r">
                  <p className="font-medium text-sm">✗ Non cercare di &quot;risparmiare&quot; indirizzi</p>
                  <p className="text-xs text-muted-foreground">
                    A differenza di IPv4, in IPv6 c&apos;è abbondanza di indirizzi. Usa /64 anche se hai 2 host
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-3 bg-red-50 dark:bg-red-950/20 p-2 rounded-r">
                  <p className="font-medium text-sm">✗ Non usare subnet più piccole di /64 per LAN</p>
                  <p className="text-xs text-muted-foreground">
                    Può causare problemi con SLAAC e altri meccanismi di auto-configurazione
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Strumenti Calcolatore */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Come Usare Questo Calcolatore</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Subnet Calculator</h4>
                <p className="text-xs">
                  Inserisci un indirizzo IPv6 e un prefix per ottenere tutte le informazioni sulla subnet:
                  network address, range di indirizzi, formato compresso/espanso, tipo di indirizzo, e altro.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">VLSM Calculator</h4>
                <p className="text-xs">
                  Dividi una rete IPv6 in subnet di dimensioni variabili. Inserisci la rete base e specifica
                  quanti indirizzi necessiti per ogni subnet. Il calcolatore ottimizzerà automaticamente l&apos;allocazione.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Subnet Visualizer</h4>
                <p className="text-xs">
                  Genera tutte le subnet possibili dividendo una rete. Utile per vedere come una rete può essere
                  suddivisa e per pianificare l&apos;architettura di rete.
                </p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

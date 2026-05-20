

import { useState } from 'react';
import { Eye, Info, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { generateIPv6Subnets, type IPv6SubnetInfo, compressIPv6 } from '@/lib/ipv6';

export function IPv6SubnetVisualizer() {
  const [networkIP, setNetworkIP] = useState('2001:0db8::/48');
  const [originalPrefix, setOriginalPrefix] = useState('48');
  const [newPrefix, setNewPrefix] = useState('64');
  const [maxSubnets, setMaxSubnets] = useState('50');
  const [subnets, setSubnets] = useState<IPv6SubnetInfo[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setError('');
    setSubnets([]);

    // Parse network address and prefix
    let netIP = networkIP;
    let origPrefix = parseInt(originalPrefix);

    // Check if networkIP contains /prefix notation
    if (networkIP.includes('/')) {
      const parts = networkIP.split('/');
      netIP = parts[0];
      origPrefix = parseInt(parts[1]);
      setOriginalPrefix(parts[1]); // Update prefix field
    }

    const newPrefixNum = parseInt(newPrefix);
    const maxNum = parseInt(maxSubnets);

    if (!netIP) {
      setError('Inserisci un indirizzo di rete IPv6');
      return;
    }

    if (isNaN(origPrefix) || origPrefix < 0 || origPrefix > 128) {
      setError('Prefix originale non valido (0-128)');
      return;
    }

    if (isNaN(newPrefixNum) || newPrefixNum < 0 || newPrefixNum > 128) {
      setError('Nuovo prefix non valido (0-128)');
      return;
    }

    if (newPrefixNum <= origPrefix) {
      setError('Il nuovo prefix deve essere maggiore del prefix originale');
      return;
    }

    if (isNaN(maxNum) || maxNum < 1 || maxNum > 1000) {
      setError('Numero massimo di subnet deve essere tra 1 e 1000');
      return;
    }

    const generatedSubnets = generateIPv6Subnets(netIP, origPrefix, newPrefixNum, maxNum);

    if (generatedSubnets.length === 0) {
      setError('Impossibile generare subnet con i parametri forniti');
      return;
    }

    setSubnets(generatedSubnets);
  };

  const exportToCSV = () => {
    if (subnets.length === 0) return;

    const headers = [
      'Subnet #',
      'Network Address (Compressed)',
      'Network Address (Expanded)',
      'Prefix',
      'First Address',
      'Last Address',
      'Total Addresses',
      'Address Type',
      'Scope',
    ];

    const rows = subnets.map((subnet, index) => [
      (index + 1).toString(),
      subnet.networkAddressCompressed,
      subnet.networkAddress,
      `/${subnet.prefix}`,
      subnet.firstAddress,
      subnet.lastAddress,
      subnet.totalAddresses,
      subnet.addressType,
      subnet.scope,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipv6_subnets_${compressIPv6(networkIP.split('/')[0])}_${originalPrefix}_to_${newPrefix}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPossibleSubnets = originalPrefix && newPrefix
    ? Math.pow(2, Math.min(parseInt(newPrefix) - parseInt(originalPrefix), 20))
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>IPv6 Subnet Visualizer</CardTitle>
          </div>
          <CardDescription>
            Genera e visualizza tutte le subnet possibili dividendo una rete IPv6
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="networkIPViz">Rete IPv6 Base</Label>
              <Input
                id="networkIPViz"
                placeholder="2001:0db8::/48"
                value={networkIP}
                onChange={(e) => setNetworkIP(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrefix">Prefix Originale</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted text-sm font-medium">
                  /
                </span>
                <Input
                  id="originalPrefix"
                  type="number"
                  min="0"
                  max="127"
                  placeholder="48"
                  value={originalPrefix}
                  onChange={(e) => setOriginalPrefix(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPrefix">Nuovo Prefix (Subnet)</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted text-sm font-medium">
                  /
                </span>
                <Input
                  id="newPrefix"
                  type="number"
                  min="1"
                  max="128"
                  placeholder="64"
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSubnets">Max Subnet da Mostrare</Label>
              <Input
                id="maxSubnets"
                type="number"
                min="1"
                max="1000"
                placeholder="50"
                value={maxSubnets}
                onChange={(e) => setMaxSubnets(e.target.value)}
              />
            </div>
          </div>

          {originalPrefix && newPrefix && parseInt(newPrefix) > parseInt(originalPrefix) && (
            <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-sm">
              <strong>Subnet totali possibili:</strong>{' '}
              {totalPossibleSubnets >= 1048576
                ? `${totalPossibleSubnets.toExponential(2)} (2^${parseInt(newPrefix) - parseInt(originalPrefix)})`
                : totalPossibleSubnets.toLocaleString()}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1 md:flex-initial">
              <Eye className="mr-2 h-4 w-4" />
              Genera Subnet
            </Button>
            {subnets.length > 0 && (
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {subnets.length > 0 && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Riepilogo Generazione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Rete Base</div>
                  <div className="font-mono font-medium text-sm">
                    {compressIPv6(networkIP.split('/')[0])}/{originalPrefix}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Prefix Subnet</div>
                  <div className="font-mono font-medium">/{newPrefix}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Subnet Generate</div>
                  <div className="font-mono font-medium">{subnets.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Indirizzi per Subnet</div>
                  <div className="font-mono font-medium text-sm">{subnets[0].totalAddresses}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subnet Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Subnet IPv6 Generate</CardTitle>
              <CardDescription>
                {subnets.length === parseInt(maxSubnets) &&
                  `Mostrate ${subnets.length} subnet su ${totalPossibleSubnets >= 1048576 ? 'molte altre' : totalPossibleSubnets.toLocaleString()} totali. Aumenta il limite per vederne di più.`
                }
                {subnets.length < parseInt(maxSubnets) &&
                  `Tutte le ${subnets.length} subnet disponibili`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subnets.map((subnet, index) => (
                  <Card key={index} className="border-muted hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Subnet #{index + 1}
                        </CardTitle>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          subnet.addressType.includes('Global')
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : subnet.addressType.includes('Link-Local')
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}>
                          {subnet.addressType}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Network Address</div>
                        <div className="font-mono text-xs font-semibold break-all">
                          {subnet.networkAddressCompressed}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground mt-0.5">
                          /{subnet.prefix}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Range Indirizzi</div>
                        <div className="font-mono text-xs space-y-1">
                          <div className="text-green-600 dark:text-green-400 truncate" title={subnet.firstAddress}>
                            {subnet.firstAddress}
                          </div>
                          <div className="text-center text-muted-foreground">↓</div>
                          <div className="text-red-600 dark:text-red-400 truncate" title={subnet.lastAddress}>
                            {subnet.lastAddress}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Indirizzi:</span>
                        <span className="font-mono text-xs font-medium">
                          {subnet.totalAddresses}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visual Hierarchy */}
          <Card>
            <CardHeader>
              <CardTitle>Gerarchia Visuale</CardTitle>
              <CardDescription>
                Rappresentazione grafica delle prime subnet generate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                  <div className="font-mono font-semibold text-sm mb-2">
                    Rete Base: {compressIPv6(networkIP.split('/')[0])}/{originalPrefix}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
                    {subnets.slice(0, 8).map((subnet, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-background border border-primary/20 hover:border-primary/50 transition-colors"
                      >
                        <div className="text-xs font-medium mb-1">#{index + 1}</div>
                        <div className="font-mono text-xs break-all">
                          {subnet.networkAddressCompressed}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          /{subnet.prefix}
                        </div>
                      </div>
                    ))}
                    {subnets.length > 8 && (
                      <div className="p-3 rounded-md bg-muted/50 border border-dashed border-muted-foreground/30 flex items-center justify-center">
                        <div className="text-xs text-muted-foreground text-center">
                          + altre {subnets.length - 8}<br />subnet...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Informazione Didattica - Subnet IPv6</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <strong>Divisione delle Subnet:</strong> Quando dividi una rete IPv6 in subnet più piccole,
                aumenti il prefix length. Ad esempio, dividere una /48 in subnet /64 crea 2^(64-48) = 65,536 subnet.
              </div>
              <div>
                <strong>Gerarchia degli Indirizzi:</strong> IPv6 utilizza un sistema gerarchico di allocazione:
                <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
                  <li>/3 - Spazio Global Unicast (2000::/3)</li>
                  <li>/12 a /23 - Allocazioni RIR (Regional Internet Registry)</li>
                  <li>/32 - Allocazione tipica ISP</li>
                  <li>/48 - Allocazione tipica organizzazione/sito</li>
                  <li>/56 - Allocazione tipica utente domestico</li>
                  <li>/64 - Subnet singola (standard)</li>
                  <li>/128 - Host singolo</li>
                </ul>
              </div>
              <div>
                <strong>Best Practice /64:</strong> Si raccomanda di utilizzare sempre /64 per le subnet,
                anche se si hanno pochi dispositivi. Questo è richiesto per SLAAC e garantisce compatibilità futura.
              </div>
              <div>
                <strong>Abbondanza di Indirizzi:</strong> Una singola subnet /64 contiene più indirizzi
                (18.4 quintilioni) di tutto lo spazio IPv4 (4.3 miliardi). Questo elimina completamente
                il problema della scarsità di indirizzi.
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

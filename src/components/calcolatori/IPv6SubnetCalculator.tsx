

import { useState } from 'react';
import { Calculator, Info, FileDown, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { calculateIPv6Subnet, type IPv6SubnetInfo, COMMON_IPV6_PREFIXES } from '@/lib/ipv6';
import { exportIPv6SubnetToPDF } from '@/lib/pdfExport';

export function IPv6SubnetCalculator() {
  const [ipAddress, setIpAddress] = useState('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  const [prefix, setPrefix] = useState('64');
  const [result, setResult] = useState<IPv6SubnetInfo | null>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCalculate = () => {
    setError('');
    const prefixNum = parseInt(prefix);

    if (!ipAddress) {
      setError('Inserisci un indirizzo IPv6');
      return;
    }

    if (!prefix || isNaN(prefixNum)) {
      setError('Inserisci un prefix valido (0-128)');
      return;
    }

    const subnetResult = calculateIPv6Subnet(ipAddress, prefixNum);

    if (!subnetResult) {
      setError('Indirizzo IPv6 o prefix non valido');
      return;
    }

    setResult(subnetResult);
  };

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, fieldName)}
      className="h-6 w-6 p-0"
    >
      {copiedField === fieldName ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  // Auto-calculate on mount
  useState(() => {
    handleCalculate();
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>IPv6 Subnet Calculator</CardTitle>
          </div>
          <CardDescription>
            Inserisci un indirizzo IPv6 e il prefix length per calcolare tutti i dettagli della subnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="ipv6">Indirizzo IPv6</Label>
              <Input
                id="ipv6"
                placeholder="2001:0db8:85a3::8a2e:0370:7334"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Supporta formato completo, compresso (::) e IPv4-mapped
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix Length</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted text-sm font-medium">
                  /
                </span>
                <Input
                  id="prefix"
                  type="number"
                  min="0"
                  max="128"
                  placeholder="64"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Common Prefix Quick Select */}
          <div className="space-y-2">
            <Label>Prefix comuni</Label>
            <Select onValueChange={(value) => setPrefix(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un prefix comune..." />
              </SelectTrigger>
              <SelectContent>
                {COMMON_IPV6_PREFIXES.map(({ prefix, name, description }) => (
                  <SelectItem key={prefix} value={prefix.toString()}>
                    <div className="flex flex-col">
                      <div className="font-medium">/{prefix} - {name}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleCalculate} className="flex-1 md:flex-initial">
              <Calculator className="mr-2 h-4 w-4" />
              Calcola Subnet
            </Button>
            {result && (
              <Button variant="outline" onClick={() => exportIPv6SubnetToPDF(result)}>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Subnet IPv6</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Indirizzo IPv6 (Input)</div>
                  <div className="font-mono font-medium text-sm flex items-center gap-2">
                    {result.ipAddress}
                    <CopyButton text={result.ipAddress} fieldName="input" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Prefix Length</div>
                  <div className="font-mono font-medium">/{result.prefix}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Formato Espanso</div>
                  <div className="font-mono text-sm flex items-center gap-2">
                    {result.ipAddressExpanded}
                    <CopyButton text={result.ipAddressExpanded} fieldName="expanded" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Formato Compresso</div>
                  <div className="font-mono text-sm flex items-center gap-2">
                    {result.ipAddressCompressed}
                    <CopyButton text={result.ipAddressCompressed} fieldName="compressed" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Tipo Indirizzo</div>
                  <div className="font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      result.addressType.includes('Global') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      result.addressType.includes('Link-Local') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      result.addressType.includes('Unique Local') ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      result.addressType.includes('Loopback') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {result.addressType}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Scope</div>
                  <div className="font-medium">{result.scope}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Indirizzi Totali</div>
                  <div className="font-mono font-medium">{result.totalAddresses}</div>
                </div>

                {result.ipv4Mapped && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">IPv4 Mapped</div>
                    <div className="font-mono font-medium flex items-center gap-2">
                      {result.ipv4Mapped}
                      <CopyButton text={result.ipv4Mapped} fieldName="ipv4mapped" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Network Details */}
          <Card>
            <CardHeader>
              <CardTitle>Dettagli di Rete</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Parametro</TableHead>
                    <TableHead>Valore</TableHead>
                    <TableHead className="w-[100px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium">Network Address</TableCell>
                    <TableCell className="font-mono text-sm font-semibold">
                      {result.networkAddressCompressed}
                    </TableCell>
                    <TableCell>
                      <CopyButton text={result.networkAddressCompressed} fieldName="network" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Network (Espanso)</TableCell>
                    <TableCell className="font-mono text-xs">
                      {result.networkAddress}
                    </TableCell>
                    <TableCell>
                      <CopyButton text={result.networkAddress} fieldName="networkExp" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Subnet Mask</TableCell>
                    <TableCell className="font-mono text-sm">{result.subnetMask}</TableCell>
                    <TableCell>
                      <CopyButton text={result.subnetMask} fieldName="mask" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Primo Indirizzo</TableCell>
                    <TableCell className="font-mono text-sm">{result.firstAddress}</TableCell>
                    <TableCell>
                      <CopyButton text={result.firstAddress} fieldName="first" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ultimo Indirizzo</TableCell>
                    <TableCell className="font-mono text-sm">{result.lastAddress}</TableCell>
                    <TableCell>
                      <CopyButton text={result.lastAddress} fieldName="last" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Binary Representation */}
          <Card>
            <CardHeader>
              <CardTitle>Rappresentazione Binaria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-mono text-xs bg-muted p-3 rounded-md overflow-x-auto">
                  {result.binary}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ogni gruppo rappresenta 16 bit (un hextets). Totale: 128 bit
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reverse DNS */}
          <Card>
            <CardHeader>
              <CardTitle>Reverse DNS (PTR Record)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-mono text-xs bg-muted p-3 rounded-md overflow-x-auto flex items-center justify-between">
                  <span className="break-all">{result.reverseDNS}</span>
                  <CopyButton text={result.reverseDNS} fieldName="reverse" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Formato per zone ip6.arpa, utilizzato per reverse DNS lookup
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Educational Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Informazione Didattica - IPv6</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <strong>Formato IPv6:</strong> Un indirizzo IPv6 è composto da 128 bit, divisi in 8 gruppi di 16 bit (hextets)
                rappresentati in notazione esadecimale separati da due punti.
              </div>
              <div>
                <strong>Compressione con :::</strong> Una sequenza consecutiva di gruppi di zeri può essere compressa con &quot;::&quot;.
                Questa compressione può essere usata una sola volta per indirizzo. Es: 2001:0db8:0000:0000:0000:0000:0000:0001
                diventa 2001:db8::1
              </div>
              <div>
                <strong>Prefix Length:</strong> Simile al CIDR in IPv4, indica quanti bit dall&apos;inizio dell&apos;indirizzo
                identificano la rete. /64 è il prefix standard per le subnet LAN.
              </div>
              <div>
                <strong>Nessun Broadcast:</strong> IPv6 non utilizza broadcast addresses. Al loro posto utilizza multicast
                e anycast per comunicazioni one-to-many.
              </div>
              <div>
                <strong>Tipi di Indirizzo:</strong>
                <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
                  <li><strong>Global Unicast (2000::/3):</strong> Indirizzi pubblici routable su Internet</li>
                  <li><strong>Link-Local (fe80::/10):</strong> Utilizzati solo sul link locale, non routable</li>
                  <li><strong>Unique Local (fc00::/7):</strong> Equivalente agli indirizzi privati IPv4</li>
                  <li><strong>Multicast (ff00::/8):</strong> Indirizzi per comunicazioni multicast</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

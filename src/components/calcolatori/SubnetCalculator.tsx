import { useState, useEffect, useCallback } from 'react';
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
import { calculateSubnet, type SubnetInfo } from '@/lib/subnet';
import { exportSubnetToPDF } from '@/lib/pdfExport';

export function SubnetCalculator() {
  const [ipAddress, setIpAddress] = useState('192.168.1.100');
  const [cidr, setCidr] = useState('24');
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState('');
  const [ipError, setIpError] = useState(false);
  const [cidrError, setCidrError] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    setError('');
    const cidrNum = parseInt(cidr);

    if (!ipAddress) {
      setError('Inserisci un indirizzo IP');
      return;
    }

    if (!cidr || isNaN(cidrNum)) {
      setError('Inserisci un CIDR valido (0-32)');
      return;
    }

    const subnetResult = calculateSubnet(ipAddress, cidrNum);

    if (!subnetResult) {
      setError('Indirizzo IP o CIDR non valido');
      return;
    }

    setResult(subnetResult);
  }, [ipAddress, cidr]);

  // Auto-calculate on mount
  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  // Real-time validation
  const validateIP = (value: string) => {
    setIpAddress(value);
    if (value && !/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
      setIpError(true);
    } else if (value) {
      const valid = value.split('.').every(o => { const n = parseInt(o); return n >= 0 && n <= 255; });
      setIpError(!valid);
    } else {
      setIpError(false);
    }
  };

  const validateCIDR = (value: string) => {
    setCidr(value);
    const num = parseInt(value);
    setCidrError(value !== '' && (isNaN(num) || num < 0 || num > 32));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Subnet Calculator</CardTitle>
          </div>
          <CardDescription>
            Inserisci un indirizzo IP e la notazione CIDR per calcolare tutti i dettagli della subnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="ip">Indirizzo IP</Label>
              <Input
                id="ip"
                placeholder="192.168.1.100"
                value={ipAddress}
                onChange={(e) => validateIP(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className={ipError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidr">CIDR</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted text-sm font-medium">
                  /
                </span>
                <Input
                  id="cidr"
                  type="number"
                  min="0"
                  max="32"
                  placeholder="24"
                  value={cidr}
                  onChange={(e) => validateCIDR(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className={`flex-1 ${cidrError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
              </div>
            </div>
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
              <Button variant="outline" onClick={() => exportSubnetToPDF(result)}>
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
              <CardTitle>Informazioni Subnet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Indirizzo IP</div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-medium">{result.ipAddress}</span>
                    <button onClick={() => copyToClipboard(result.ipAddress, 'ip')} className="p-1 rounded hover:bg-muted transition-colors">
                      {copied === 'ip' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono hidden md:block">
                    {result.binary}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Notazione CIDR</div>
                  <div className="font-mono font-medium">/{result.cidr}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Classe IP</div>
                  <div className="font-medium">{result.ipClass}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Tipo IP</div>
                  <div className="font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.ipType === 'Private' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      result.ipType === 'Public' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                      {result.ipType}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Host Totali</div>
                  <div className="font-mono font-medium">{result.totalHosts.toLocaleString()}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Host Utilizzabili</div>
                  <div className="font-mono font-medium">{result.usableHosts.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Completi</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Parametro</TableHead>
                    <TableHead>Decimale</TableHead>
                    <TableHead className="hidden md:table-cell">Binario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Subnet Mask</TableCell>
                    <TableCell className="font-mono">{result.subnetMask}</TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">{result.subnetMaskBinary}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Wildcard Mask</TableCell>
                    <TableCell className="font-mono">{result.wildcardMask}</TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">-</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium">Network Address</TableCell>
                    <TableCell className="font-mono font-semibold">
                      <div className="flex items-center gap-1">
                        {result.networkAddress}
                        <button onClick={() => copyToClipboard(result.networkAddress, 'net')} className="p-1 rounded hover:bg-muted transition-colors">
                          {copied === 'net' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">{result.networkAddressBinary}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Primo IP Utilizzabile</TableCell>
                    <TableCell className="font-mono">{result.firstUsableIP}</TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ultimo IP Utilizzabile</TableCell>
                    <TableCell className="font-mono">{result.lastUsableIP}</TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">-</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium">Broadcast Address</TableCell>
                    <TableCell className="font-mono font-semibold">
                      <div className="flex items-center gap-1">
                        {result.broadcastAddress}
                        <button onClick={() => copyToClipboard(result.broadcastAddress, 'bcast')} className="p-1 rounded hover:bg-muted transition-colors">
                          {copied === 'bcast' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">{result.broadcastAddressBinary}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Educational Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Informazione Didattica</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Network Address:</strong> Il primo indirizzo della subnet, usato per identificare la rete stessa. Non può essere assegnato a un host.
              </p>
              <p>
                <strong>Broadcast Address:</strong> L&apos;ultimo indirizzo della subnet, usato per inviare pacchetti a tutti gli host della rete. Non può essere assegnato a un host.
              </p>
              <p>
                <strong>IP Utilizzabili:</strong> Gli indirizzi compresi tra il network address e il broadcast address, che possono essere assegnati ai dispositivi.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

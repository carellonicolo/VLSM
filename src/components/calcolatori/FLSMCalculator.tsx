import { useState } from 'react';
import { Network, FileDown, Info, Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { generateSubnets, calculateCIDRForHosts, type SubnetInfo } from '@/lib/subnet';
import { exportFLSMToPDF } from '@/lib/pdfExport';

export function FLSMCalculator() {
  const [networkIP, setNetworkIP] = useState('192.168.1.0');
  const [originalCIDR, setOriginalCIDR] = useState('24');
  
  const [mode, setMode] = useState<'cidr' | 'subnets' | 'hosts'>('subnets');
  const [targetValue, setTargetValue] = useState('4');

  const [result, setResult] = useState<SubnetInfo[] | null>(null);
  const [error, setError] = useState('');
  const [newCidrUsed, setNewCidrUsed] = useState<number | null>(null);

  const handleCalculate = () => {
    setError('');
    setResult(null);
    setNewCidrUsed(null);

    const origCidrNum = parseInt(originalCIDR);

    if (!networkIP) {
      setError('Inserisci un indirizzo di rete');
      return;
    }

    if (!originalCIDR || isNaN(origCidrNum) || origCidrNum < 0 || origCidrNum > 32) {
      setError('Inserisci un CIDR valido (0-32)');
      return;
    }

    const valueNum = parseInt(targetValue);
    if (!targetValue || isNaN(valueNum) || valueNum <= 0) {
      setError('Inserisci un valore target valido (maggiore di 0)');
      return;
    }

    let calculatedNewCidr = origCidrNum;

    try {
      if (mode === 'cidr') {
        calculatedNewCidr = valueNum;
        if (calculatedNewCidr <= origCidrNum || calculatedNewCidr > 32) {
          setError(`Il nuovo CIDR deve essere maggiore di quello originale (/${origCidrNum}) e massimo 32`);
          return;
        }
      } else if (mode === 'subnets') {
        let bits = 0;
        while (Math.pow(2, bits) < valueNum) {
          bits++;
        }
        calculatedNewCidr = origCidrNum + bits;
        if (calculatedNewCidr > 32) {
          setError(`Troppe subnet richieste. Il CIDR risultante supererebbe /32`);
          return;
        }
      } else if (mode === 'hosts') {
        calculatedNewCidr = calculateCIDRForHosts(valueNum);
        if (calculatedNewCidr <= origCidrNum) {
          setError(`Gli host richiesti necessitano di una rete più grande di quella di partenza (/${origCidrNum})`);
          return;
        }
      }

      const subnets = generateSubnets(networkIP, origCidrNum, calculatedNewCidr);
      
      if (subnets.length === 0) {
        setError('Errore durante la generazione delle subnet. Verifica i parametri.');
        return;
      }

      if (subnets.length > 4096) {
        setError(`L'operazione genererebbe ${subnets.length} subnet, il limite di visualizzazione è 4096 per motivi di performance. Scegli una suddivisione minore.`);
        return;
      }

      setResult(subnets);
      setNewCidrUsed(calculatedNewCidr);
    } catch {
      setError('Valori non validi o operazione impossibile');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>FLSM Calculator</CardTitle>
          </div>
          <CardDescription>
            Fixed Length Subnet Masking - Suddividi una rete in sottoreti di dimensioni uguali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="flsm-network">Indirizzo di Rete Partenza</Label>
              <Input
                id="flsm-network"
                placeholder="192.168.1.0"
                value={networkIP}
                onChange={(e) => setNetworkIP(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flsm-orig-cidr">CIDR Partenza</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted text-sm font-medium">
                  /
                </span>
                <Input
                  id="flsm-orig-cidr"
                  type="number"
                  min="0"
                  max="31"
                  placeholder="24"
                  value={originalCIDR}
                  onChange={(e) => setOriginalCIDR(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <Label className="text-base">Come vuoi suddividere la rete?</Label>
            <Select value={mode} onValueChange={(val: 'cidr' | 'subnets' | 'hosts') => setMode(val)}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Seleziona modalità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subnets">Per Numero di Subnet</SelectItem>
                <SelectItem value="hosts">Per Host Necessari</SelectItem>
                <SelectItem value="cidr">Nuovo CIDR Specifico</SelectItem>
              </SelectContent>
            </Select>

            <div className="pt-2 max-w-sm">
              <Label htmlFor="target-value">
                {mode === 'subnets' && 'Numero di Subnet richieste:'}
                {mode === 'hosts' && 'Host utili richiesti per subnet:'}
                {mode === 'cidr' && 'Nuovo CIDR (es. 26 per /26):'}
              </Label>
              <Input
                id="target-value"
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="mt-1"
                placeholder={mode === 'cidr' ? '26' : mode === 'subnets' ? '4' : '30'}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleCalculate} className="flex-1 md:flex-initial">
              <Network className="mr-2 h-4 w-4" />
              Calcola FLSM
            </Button>
            {result && result.length > 0 && newCidrUsed && (
              <Button variant="outline" onClick={() => exportFLSMToPDF(networkIP, parseInt(originalCIDR), newCidrUsed, result)}>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && result.length > 0 && newCidrUsed && (
        <>
          {/* Results Summary Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Riepilogo Suddivisione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Subnet Generate</p>
                  <p className="font-mono font-bold text-lg">{result.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Nuovo CIDR</p>
                  <p className="font-mono font-bold text-lg">/{newCidrUsed}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Host per Subnet</p>
                  <p className="font-mono font-bold text-lg">{result[0].usableHosts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Subnet Mask</p>
                  <p className="font-mono font-bold">{result[0].subnetMask}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compact Table View */}
          <Card>
            <CardHeader>
              <CardTitle>Tabella Sottoreti</CardTitle>
              <CardDescription>
                Tutte le sottoreti generate dalla divisione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Range IP Utilizzabile</TableHead>
                      <TableHead>Broadcast</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.map((subnet, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-mono font-semibold text-primary">{subnet.networkAddress}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {subnet.firstUsableIP} - {subnet.lastUsableIP}
                        </TableCell>
                        <TableCell className="font-mono">{subnet.broadcastAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Educational Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Cos&apos;è FLSM?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Fixed Length Subnet Masking (FLSM)</strong> è il metodo tradizionale di subnetting
                in cui una rete principale viene suddivisa in un numero specifico di sottoreti <strong>tutte della stessa identica dimensione</strong>.
              </p>
              <p>
                Questo approccio è semplice da gestire ma può essere meno efficiente del VLSM se le sottoreti hanno 
                esigenze di host molto diverse tra loro, poiché porta a uno spreco di indirizzi IP nelle reti più piccole.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

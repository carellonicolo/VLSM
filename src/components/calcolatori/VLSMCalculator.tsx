

import { useState } from 'react';
import { Network, Plus, Trash2, Info, FileDown } from 'lucide-react';
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
import { calculateVLSM, checkVLSMOverlap, type VLSMSubnet, type OverlapInfo } from '@/lib/subnet';
import { exportVLSMToPDF } from '@/lib/pdfExport';

interface SubnetRequirement {
  id: number;
  name: string;
  hosts: string;
}

export function VLSMCalculator() {
  const [networkIP, setNetworkIP] = useState('192.168.1.0');
  const [cidr, setCidr] = useState('24');
  const [subnets, setSubnets] = useState<SubnetRequirement[]>([
    { id: 1, name: 'Sales', hosts: '50' },
    { id: 2, name: 'IT', hosts: '25' },
    { id: 3, name: 'Management', hosts: '10' },
  ]);
  const [result, setResult] = useState<VLSMSubnet[] | null>(null);
  const [error, setError] = useState('');
  const [overlaps, setOverlaps] = useState<OverlapInfo[]>([]);
  const [nextId, setNextId] = useState(4);

  const addSubnet = () => {
    setSubnets([...subnets, { id: nextId, name: '', hosts: '' }]);
    setNextId(nextId + 1);
  };

  const removeSubnet = (id: number) => {
    setSubnets(subnets.filter(s => s.id !== id));
  };

  const updateSubnet = (id: number, field: 'name' | 'hosts', value: string) => {
    setSubnets(subnets.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleCalculate = () => {
    setError('');
    setResult(null);
    setOverlaps([]);

    const cidrNum = parseInt(cidr);

    if (!networkIP) {
      setError('Inserisci un indirizzo di rete');
      return;
    }

    if (!cidr || isNaN(cidrNum)) {
      setError('Inserisci un CIDR valido (0-32)');
      return;
    }

    if (subnets.length === 0) {
      setError('Aggiungi almeno una subnet');
      return;
    }

    // Validate subnets
    const validSubnets = subnets.filter(s => s.name.trim() && s.hosts.trim());
    if (validSubnets.length === 0) {
      setError('Completa almeno una subnet con nome e numero di host');
      return;
    }

    const subnetRequirements = validSubnets.map(s => ({
      name: s.name.trim(),
      hosts: parseInt(s.hosts),
    }));

    if (subnetRequirements.some(s => isNaN(s.hosts) || s.hosts <= 0)) {
      setError('Il numero di host deve essere un numero positivo');
      return;
    }

    const vlsmResult = calculateVLSM(networkIP, cidrNum, subnetRequirements);

    if (!vlsmResult) {
      setError('Impossibile allocare le subnet richieste. La rete potrebbe essere troppo piccola.');
      return;
    }

    setResult(vlsmResult);

    // Check for overlaps
    const overlapResults = checkVLSMOverlap(vlsmResult);
    setOverlaps(overlapResults);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>VLSM Calculator</CardTitle>
          </div>
          <CardDescription>
            Variable Length Subnet Masking - Suddividi una rete in subnet di dimensioni diverse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Network Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="network">Indirizzo di Rete</Label>
              <Input
                id="network"
                placeholder="192.168.1.0"
                value={networkIP}
                onChange={(e) => setNetworkIP(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vlsm-cidr">CIDR</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted text-sm font-medium">
                  /
                </span>
                <Input
                  id="vlsm-cidr"
                  type="number"
                  min="0"
                  max="32"
                  placeholder="24"
                  value={cidr}
                  onChange={(e) => setCidr(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Subnets Requirements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Requisiti Subnet</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addSubnet}
              >
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi Subnet
              </Button>
            </div>

            <div className="space-y-2">
              {subnets.map((subnet, index) => (
                <div key={subnet.id} className="flex gap-2">
                  <div className="flex items-center justify-center w-8 text-sm text-muted-foreground">
                    {index + 1}.
                  </div>
                  <Input
                    placeholder="Nome subnet (es. Sales)"
                    value={subnet.name}
                    onChange={(e) => updateSubnet(subnet.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Host richiesti"
                    value={subnet.hosts}
                    onChange={(e) => updateSubnet(subnet.id, 'hosts', e.target.value)}
                    className="w-32"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubnet(subnet.id)}
                    disabled={subnets.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
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
              Calcola VLSM
            </Button>
            {result && result.length > 0 && (
              <Button variant="outline" onClick={() => exportVLSMToPDF(networkIP, parseInt(cidr), result)}>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {overlaps.length > 0 && (
        <div className="p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-orange-600 dark:text-orange-400 font-semibold">⚠️ Attenzione: Sovrapposizione Subnet</span>
          </div>
          <ul className="text-sm text-orange-800 dark:text-orange-300 space-y-1">
            {overlaps.map((overlap, i) => (
              <li key={i}>• <strong>{overlap.subnet1}</strong> e <strong>{overlap.subnet2}</strong>: {overlap.description}</li>
            ))}
          </ul>
        </div>
      )}

      {result && result.length > 0 && (
        <>
          {/* Results Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subnet Allocate ({result.length})</CardTitle>
              <CardDescription>
                Le subnet sono ordinate per dimensione decrescente per ottimizzare l&apos;allocazione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.map((subnet, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{subnet.name}</CardTitle>
                        <span className="font-mono text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                          /{subnet.cidr}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Host Richiesti</div>
                          <div className="font-mono font-semibold">{subnet.requiredHosts}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Host Allocati</div>
                          <div className="font-mono font-semibold">{subnet.allocatedHosts}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Subnet Mask</div>
                          <div className="font-mono">{subnet.subnetMask}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Network Address</div>
                          <div className="font-mono">{subnet.networkAddress}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Range IP</div>
                          <div className="font-mono text-xs">
                            {subnet.firstUsableIP} - {subnet.lastUsableIP}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Broadcast</div>
                          <div className="font-mono">{subnet.broadcastAddress}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compact Table View */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Tabella</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Hosts</TableHead>
                      <TableHead>CIDR</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Range IP</TableHead>
                      <TableHead>Broadcast</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.map((subnet, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{subnet.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {subnet.requiredHosts} / {subnet.allocatedHosts}
                        </TableCell>
                        <TableCell className="font-mono">/{subnet.cidr}</TableCell>
                        <TableCell className="font-mono text-sm">{subnet.networkAddress}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {subnet.firstUsableIP}<br />
                          {subnet.lastUsableIP}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{subnet.broadcastAddress}</TableCell>
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
                <CardTitle className="text-base">Cos&apos;è VLSM?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Variable Length Subnet Masking (VLSM)</strong> permette di suddividere una rete
                in subnet di dimensioni diverse, ottimizzando l&apos;uso dello spazio di indirizzamento IP.
              </p>
              <p>
                Le subnet sono allocate in ordine decrescente di dimensione per garantire
                il miglior utilizzo dello spazio disponibile ed evitare frammentazione.
              </p>
              <p>
                <strong>Esempio:</strong> Una rete /24 può essere divisa in una subnet /26 (62 host),
                una /27 (30 host) e una /28 (14 host), utilizzando esattamente lo spazio necessario.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

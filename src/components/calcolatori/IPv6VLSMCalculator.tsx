

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
import { calculateIPv6VLSM, type IPv6VLSMSubnet } from '@/lib/ipv6';
import { exportIPv6VLSMToPDF } from '@/lib/pdfExport';

interface SubnetRequirement {
  id: number;
  name: string;
  addresses: string;
}

export function IPv6VLSMCalculator() {
  const [networkIP, setNetworkIP] = useState('2001:0db8::/32');
  const [prefix, setPrefix] = useState('32');
  const [subnets, setSubnets] = useState<SubnetRequirement[]>([
    { id: 1, name: 'Data Center', addresses: '65536' },
    { id: 2, name: 'Office Network', addresses: '1024' },
    { id: 3, name: 'DMZ', addresses: '256' },
  ]);
  const [result, setResult] = useState<IPv6VLSMSubnet[] | null>(null);
  const [error, setError] = useState('');
  const [nextId, setNextId] = useState(4);

  const addSubnet = () => {
    setSubnets([...subnets, { id: nextId, name: '', addresses: '' }]);
    setNextId(nextId + 1);
  };

  const removeSubnet = (id: number) => {
    setSubnets(subnets.filter(s => s.id !== id));
  };

  const updateSubnet = (id: number, field: 'name' | 'addresses', value: string) => {
    setSubnets(subnets.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleCalculate = () => {
    setError('');
    setResult(null);

    // Parse network address and prefix
    let netIP = networkIP;
    let netPrefix = parseInt(prefix);

    // Check if networkIP contains /prefix notation
    if (networkIP.includes('/')) {
      const parts = networkIP.split('/');
      netIP = parts[0];
      netPrefix = parseInt(parts[1]);
      setPrefix(parts[1]); // Update prefix field
    }

    if (!netIP) {
      setError('Inserisci un indirizzo di rete IPv6');
      return;
    }

    if (isNaN(netPrefix) || netPrefix < 0 || netPrefix > 128) {
      setError('Inserisci un prefix valido (0-128)');
      return;
    }

    if (subnets.length === 0) {
      setError('Aggiungi almeno una subnet');
      return;
    }

    // Validate subnets
    const validSubnets = subnets.filter(s => s.name.trim() && s.addresses.trim());
    if (validSubnets.length === 0) {
      setError('Completa almeno una subnet con nome e numero di indirizzi');
      return;
    }

    const subnetRequirements = validSubnets.map(s => ({
      name: s.name.trim(),
      addresses: s.addresses.trim(),
    }));

    // Validate addresses are numbers
    for (const req of subnetRequirements) {
      const num = parseFloat(req.addresses.replace(/[,\s]/g, ''));
      if (isNaN(num) || num <= 0) {
        setError('Il numero di indirizzi deve essere un numero positivo');
        return;
      }
    }

    const vlsmResult = calculateIPv6VLSM(netIP, netPrefix, subnetRequirements);

    if (!vlsmResult) {
      setError('Impossibile allocare le subnet richieste. Verifica i parametri inseriti.');
      return;
    }

    setResult(vlsmResult);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>IPv6 VLSM Calculator</CardTitle>
          </div>
          <CardDescription>
            Dividi una rete IPv6 in subnet di dimensioni variabili in base alle tue esigenze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="networkIP">Rete IPv6 Base</Label>
              <Input
                id="networkIP"
                placeholder="2001:0db8::/32"
                value={networkIP}
                onChange={(e) => setNetworkIP(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Può includere il prefix (es: 2001:db8::/32) o inserirlo separatamente
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
                  placeholder="32"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Subnet Requirements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Requisiti Subnet</Label>
              <Button onClick={addSubnet} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Subnet
              </Button>
            </div>

            <div className="space-y-2">
              {subnets.map((subnet) => (
                <div key={subnet.id} className="flex gap-2">
                  <Input
                    placeholder="Nome subnet"
                    value={subnet.name}
                    onChange={(e) => updateSubnet(subnet.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="N° indirizzi"
                    value={subnet.addresses}
                    onChange={(e) => updateSubnet(subnet.id, 'addresses', e.target.value)}
                    className="w-32 font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubnet(subnet.id)}
                    disabled={subnets.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
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
            {result && (
              <Button
                variant="outline"
                onClick={() => exportIPv6VLSMToPDF(networkIP, parseInt(prefix), result)}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subnet Allocate - IPv6 VLSM</CardTitle>
              <CardDescription>
                Le subnet sono state ordinate per dimensione (dalla più grande alla più piccola)
                per ottimizzare l&apos;allocazione dello spazio di indirizzamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome Subnet</TableHead>
                      <TableHead>Richiesti</TableHead>
                      <TableHead>Allocati</TableHead>
                      <TableHead>Prefix</TableHead>
                      <TableHead>Network Address</TableHead>
                      <TableHead>Range Utilizzabile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.map((subnet, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{subnet.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {parseFloat(subnet.requiredHosts).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-semibold text-primary">
                          {subnet.allocatedHosts}
                        </TableCell>
                        <TableCell className="font-mono">/{subnet.prefix}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {subnet.networkAddressCompressed}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <div className="max-w-[300px]">
                            {subnet.firstAddress}
                            <br />
                            <span className="text-muted-foreground">fino a</span>
                            <br />
                            {subnet.lastAddress}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.map((subnet, index) => (
              <Card key={index} className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{subnet.name}</CardTitle>
                  <CardDescription className="font-mono">
                    {subnet.networkAddressCompressed}/{subnet.prefix}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Indirizzi Richiesti:</span>
                    <span className="font-mono font-medium">
                      {parseFloat(subnet.requiredHosts).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Indirizzi Allocati:</span>
                    <span className="font-mono font-medium text-primary">
                      {subnet.allocatedHosts}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-1">Range:</div>
                    <div className="font-mono text-xs break-all">
                      <div className="text-green-600 dark:text-green-400">
                        {subnet.firstAddress}
                      </div>
                      <div className="text-muted-foreground text-center my-1">↓</div>
                      <div className="text-red-600 dark:text-red-400">
                        {subnet.lastAddress}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Educational Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Informazione Didattica - VLSM IPv6</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <strong>VLSM (Variable Length Subnet Masking):</strong> Permette di creare subnet di dimensioni diverse
                dalla stessa rete base, ottimizzando l&apos;uso dello spazio di indirizzamento.
              </div>
              <div>
                <strong>Ordinamento Automatico:</strong> Le subnet vengono automaticamente ordinate dalla più grande
                alla più piccola. Questo approccio minimizza la frammentazione dello spazio di indirizzamento.
              </div>
              <div>
                <strong>Prefix Length in IPv6:</strong> A differenza di IPv4, IPv6 utilizza sempre la notazione prefix.
                Valori comuni sono /48 (organizzazione), /56 (sito), /64 (subnet), /128 (host singolo).
              </div>
              <div>
                <strong>Vantaggi IPv6:</strong> Con uno spazio di indirizzamento di 128 bit, IPv6 offre
                praticamente indirizzi illimitati. Anche una singola /64 contiene 2^64 = 18,446,744,073,709,551,616 indirizzi!
              </div>
              <div>
                <strong>Best Practice:</strong> Per le subnet LAN, si raccomanda di utilizzare sempre /64,
                anche se si hanno pochi host. Questo permette l&apos;uso di SLAAC (Stateless Address Autoconfiguration)
                e semplifica la gestione della rete.
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

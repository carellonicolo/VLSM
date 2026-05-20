import { useState } from 'react';
import { Eye, Download, Info, FileDown } from 'lucide-react';
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
import { generateSubnets, type SubnetInfo } from '@/lib/subnet';
import { exportSubnetVisualizerToPDF } from '@/lib/pdfExport';

export function SubnetVisualizer() {
  const [networkIP, setNetworkIP] = useState('192.168.1.0');
  const [originalCIDR, setOriginalCIDR] = useState('24');
  const [newCIDR, setNewCIDR] = useState('26');
  const [subnets, setSubnets] = useState<SubnetInfo[]>([]);
  const [error, setError] = useState('');

  const handleVisualize = () => {
    setError('');
    setSubnets([]);

    const origCIDR = parseInt(originalCIDR);
    const newCIDRNum = parseInt(newCIDR);

    if (!networkIP) {
      setError('Inserisci un indirizzo di rete');
      return;
    }

    if (!originalCIDR || isNaN(origCIDR) || !newCIDR || isNaN(newCIDRNum)) {
      setError('Inserisci CIDR validi (0-32)');
      return;
    }

    if (newCIDRNum <= origCIDR) {
      setError('Il nuovo CIDR deve essere più grande (subnet più piccole) del CIDR originale');
      return;
    }

    if (newCIDRNum - origCIDR > 8) {
      setError('La differenza tra i CIDR è troppo grande. Verrebbero generate troppe subnet. Limita la differenza a 8.');
      return;
    }

    const generatedSubnets = generateSubnets(networkIP, origCIDR, newCIDRNum);

    if (generatedSubnets.length === 0) {
      setError('Impossibile generare subnet. Verifica gli indirizzi inseriti.');
      return;
    }

    setSubnets(generatedSubnets);
  };

  const exportToCSV = () => {
    if (subnets.length === 0) return;

    const headers = ['#', 'Network', 'CIDR', 'Subnet Mask', 'First IP', 'Last IP', 'Broadcast', 'Usable Hosts'];
    const rows = subnets.map((subnet, index) => [
      index + 1,
      subnet.networkAddress,
      subnet.cidr,
      subnet.subnetMask,
      subnet.firstUsableIP,
      subnet.lastUsableIP,
      subnet.broadcastAddress,
      subnet.usableHosts,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subnets_${networkIP}_${originalCIDR}_to_${newCIDR}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Subnet Visualizer</CardTitle>
          </div>
          <CardDescription>
            Genera e visualizza tutte le subnet possibili dividendo una rete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="viz-network">Indirizzo di Rete</Label>
              <Input
                id="viz-network"
                placeholder="192.168.1.0"
                value={networkIP}
                onChange={(e) => setNetworkIP(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="viz-original-cidr">CIDR Originale</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted text-sm font-medium">
                  /
                </span>
                <Input
                  id="viz-original-cidr"
                  type="number"
                  min="0"
                  max="32"
                  placeholder="24"
                  value={originalCIDR}
                  onChange={(e) => setOriginalCIDR(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="viz-new-cidr">Nuovo CIDR</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-muted text-sm font-medium">
                  /
                </span>
                <Input
                  id="viz-new-cidr"
                  type="number"
                  min="0"
                  max="32"
                  placeholder="26"
                  value={newCIDR}
                  onChange={(e) => setNewCIDR(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Quick CIDR Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Divisioni comuni:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setOriginalCIDR('24'); setNewCIDR('26'); }}
            >
              /24 → /26 (4 subnet)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setOriginalCIDR('24'); setNewCIDR('27'); }}
            >
              /24 → /27 (8 subnet)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setOriginalCIDR('24'); setNewCIDR('28'); }}
            >
              /24 → /28 (16 subnet)
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleVisualize} className="flex-1 md:flex-initial">
              <Eye className="mr-2 h-4 w-4" />
              Visualizza Subnet
            </Button>
            {subnets.length > 0 && (
              <>
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => exportSubnetVisualizerToPDF(networkIP, parseInt(originalCIDR), parseInt(newCIDR), subnets)}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {subnets.length > 0 && (
        <>
          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-3xl font-bold text-primary">{subnets.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Subnet Generate</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-bold">{subnets[0]?.usableHosts || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Host per Subnet</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-bold">{subnets[0]?.totalHosts || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Indirizzi Totali</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-bold">{subnets[0]?.subnetMask || '-'}</div>
                  <div className="text-sm text-muted-foreground mt-1">Subnet Mask</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subnets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Elenco Subnet ({subnets.length})</CardTitle>
              <CardDescription>
                Tutte le subnet generate dalla divisione di {networkIP}/{originalCIDR}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Network Address</TableHead>
                      <TableHead>CIDR</TableHead>
                      <TableHead>Primo IP</TableHead>
                      <TableHead>Ultimo IP</TableHead>
                      <TableHead>Broadcast</TableHead>
                      <TableHead className="text-right">Host</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subnets.map((subnet, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          {subnet.networkAddress}
                        </TableCell>
                        <TableCell className="font-mono">/{subnet.cidr}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {subnet.firstUsableIP}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {subnet.lastUsableIP}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {subnet.broadcastAddress}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {subnet.usableHosts}
                        </TableCell>
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
                <CardTitle className="text-base">Visualizzazione Subnet</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Subnetting:</strong> Processo di divisione di una rete in subnet più piccole.
                Aumentando il CIDR (es. da /24 a /26) si creano più reti con meno host per rete.
              </p>
              <p>
                <strong>Esempio pratico:</strong> Una rete /24 (256 indirizzi) può essere divisa in 4 subnet /26
                (64 indirizzi ciascuna), perfetto per separare dipartimenti o segmenti di rete.
              </p>
              <p>
                <strong>Nota:</strong> Ogni subnet ha il proprio network address e broadcast address,
                riducendo il numero di host utilizzabili di 2 unità per subnet.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

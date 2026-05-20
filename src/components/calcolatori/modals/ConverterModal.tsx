import { useState } from 'react';
import { ArrowRightLeft, Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function ConverterModal() {
  // States for Numbers Tab
  const [decNum, setDecNum] = useState('');
  const [binNum, setBinNum] = useState('');
  const [hexNum, setHexNum] = useState('');

  // States for IPs Tab
  const [ipDec, setIpDec] = useState('');
  const [ipBin, setIpBin] = useState('');

  // Number Conversion Handlers
  const handleDecNumChange = (val: string) => {
    setDecNum(val);
    if (!val || isNaN(Number(val))) {
      setBinNum('');
      setHexNum('');
      return;
    }
    try {
      const num = BigInt(val);
      if (num >= BigInt(0)) {
        setBinNum(num.toString(2));
        setHexNum(num.toString(16).toUpperCase());
      } else {
        setBinNum('');
        setHexNum('');
      }
    } catch {
      setBinNum('');
      setHexNum('');
    }
  };

  const handleBinNumChange = (val: string) => {
    const cleaned = val.replace(/[^01]/g, '');
    setBinNum(cleaned);
    if (!cleaned) {
      setDecNum('');
      setHexNum('');
      return;
    }
    try {
      // Usiamo BigInt per supportare numeri molto grandi
      const num = BigInt('0b' + cleaned);
      setDecNum(num.toString(10));
      setHexNum(num.toString(16).toUpperCase());
    } catch {
      setDecNum('');
      setHexNum('');
    }
  };

  const handleHexNumChange = (val: string) => {
    const cleaned = val.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    setHexNum(cleaned);
    if (!cleaned) {
      setDecNum('');
      setBinNum('');
      return;
    }
    try {
      const num = BigInt('0x' + cleaned);
      setDecNum(num.toString(10));
      setBinNum(num.toString(2));
    } catch {
      setDecNum('');
      setBinNum('');
    }
  };

  // IP Conversion Handlers
  const handleIpDecChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    setIpDec(cleaned);
    
    if (!cleaned) {
      setIpBin('');
      return;
    }

    const octets = cleaned.split('.');
    if (octets.length <= 4) {
      const binaryOctets = octets.map(octet => {
        if (!octet) return '';
        const num = parseInt(octet, 10);
        if (isNaN(num)) return '';
        // Clamp tra 0 e 255 solo visivamente per evitare errori strani
        const clamped = Math.max(0, Math.min(255, num));
        return clamped.toString(2).padStart(8, '0');
      });
      setIpBin(binaryOctets.filter(o => o).join('.'));
    }
  };

  const handleIpBinChange = (val: string) => {
    const cleaned = val.replace(/[^01.]/g, '');
    setIpBin(cleaned);

    if (!cleaned) {
      setIpDec('');
      return;
    }

    const octets = cleaned.split('.');
    if (octets.length <= 4) {
      const decOctets = octets.map(octet => {
        if (!octet) return '';
        // Limitiamo a 8 bit per sicurezza
        const clampedOctet = octet.slice(0, 8);
        return parseInt(clampedOctet, 2).toString(10);
      });
      setIpDec(decOctets.filter(o => o !== 'NaN' && o !== '').join('.'));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          <span>Convertitore</span>
        </Button>
      </DialogTrigger>
      {/* Mobile only icon trigger */}
      <DialogTrigger asChild className="sm:hidden">
        <Button variant="ghost" size="icon" title="Convertitore Rapido">
          <ArrowRightLeft className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Convertitore Rapido
          </DialogTitle>
          <DialogDescription>
            Effettua conversioni istantanee. Scrivi in un campo e gli altri si aggiorneranno automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="numbers" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="numbers">Numeri Singoli</TabsTrigger>
            <TabsTrigger value="ips">Indirizzi IP</TabsTrigger>
          </TabsList>

          <TabsContent value="numbers" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dec-input" className="text-blue-600 dark:text-blue-400 font-semibold">Decimale (Base 10)</Label>
                <Input 
                  id="dec-input" 
                  type="number" 
                  min="0"
                  placeholder="Es: 192" 
                  value={decNum}
                  onChange={(e) => handleDecNumChange(e.target.value)}
                  className="font-mono text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bin-input" className="text-green-600 dark:text-green-400 font-semibold">Binario (Base 2)</Label>
                <Input 
                  id="bin-input" 
                  type="text" 
                  placeholder="Es: 11000000" 
                  value={binNum}
                  onChange={(e) => handleBinNumChange(e.target.value)}
                  className="font-mono text-lg tracking-wider"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hex-input" className="text-purple-600 dark:text-purple-400 font-semibold">Esadecimale (Base 16)</Label>
                <Input 
                  id="hex-input" 
                  type="text" 
                  placeholder="Es: C0" 
                  value={hexNum}
                  onChange={(e) => handleHexNumChange(e.target.value)}
                  className="font-mono text-lg uppercase"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ips" className="space-y-4 py-4">
            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-4 text-sm text-muted-foreground">
                <p>Converti un intero indirizzo IP ottetto per ottetto. Puoi inserire i punti per separare i blocchi.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ip-dec-input" className="text-blue-600 dark:text-blue-400 font-semibold">IP Decimale (Dotted)</Label>
                <Input 
                  id="ip-dec-input" 
                  type="text" 
                  placeholder="Es: 192.168.1.1" 
                  value={ipDec}
                  onChange={(e) => handleIpDecChange(e.target.value)}
                  className="font-mono text-lg"
                />
              </div>
              
              <div className="flex items-center justify-center text-muted-foreground">
                <ArrowRightLeft className="h-6 w-6 rotate-90" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip-bin-input" className="text-green-600 dark:text-green-400 font-semibold">IP Binario (Dotted)</Label>
                <Input 
                  id="ip-bin-input" 
                  type="text" 
                  placeholder="Es: 11000000.10101000.00000001.00000001" 
                  value={ipBin}
                  onChange={(e) => handleIpBinChange(e.target.value)}
                  className="font-mono text-base tracking-widest sm:text-lg"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

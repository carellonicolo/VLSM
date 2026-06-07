import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Network, Calculator, Eye } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubnetCalculator } from '@/components/calcolatori/SubnetCalculator';
import { VLSMCalculator } from '@/components/calcolatori/VLSMCalculator';
import { FLSMCalculator } from '@/components/calcolatori/FLSMCalculator';
import { SubnetVisualizer } from '@/components/calcolatori/SubnetVisualizer';
import { IPv6SubnetCalculator } from '@/components/calcolatori/IPv6SubnetCalculator';
import { IPv6VLSMCalculator } from '@/components/calcolatori/IPv6VLSMCalculator';
import { IPv6SubnetVisualizer } from '@/components/calcolatori/IPv6SubnetVisualizer';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';
import { ThemeToggle } from '../ui/ThemeToggle';
import { HomeLink } from '../ui/HomeLink';
import { useTheme } from '../../hooks/useTheme';

const GuideModal = lazy(() =>
  import('@/components/calcolatori/modals/GuideModal').then((m) => ({ default: m.GuideModal }))
);
const ExercisesModal = lazy(() =>
  import('@/components/calcolatori/modals/ExercisesModal').then((m) => ({ default: m.ExercisesModal }))
);
const ConverterModal = lazy(() =>
  import('@/components/calcolatori/modals/ConverterModal').then((m) => ({ default: m.ConverterModal }))
);

type Protocol = 'ipv4' | 'ipv6';
type Tool = 'calculator' | 'flsm' | 'vlsm' | 'visualizer';

export function CalcolatoriPage() {
  const { theme, toggle } = useTheme();
  const [protocol, setProtocol] = useState<Protocol>('ipv4');
  const [tool, setTool] = useState<Tool>('calculator');

  const handleProtocolChange = (value: string) => {
    const next = value as Protocol;
    setProtocol(next);
    // FLSM non esiste per IPv6: rimbalza al calcolatore base.
    if (next === 'ipv6' && tool === 'flsm') {
      setTool('calculator');
    }
  };

  return (
    <div className="shell">
      <Header
        actions={
          <>
            <HomeLink />
            <ThemeToggle theme={theme} onToggle={toggle} />
          </>
        }
      />

      <main className="calcolatori-page">
        <div className="calcolatori-breadcrumb">
          <Link to="/" className="back-link">← Torna alla home</Link>
        </div>

        <div className="calcolatori-toolbar">
          <Suspense fallback={null}>
            <ConverterModal />
            <GuideModal />
            <ExercisesModal />
          </Suspense>
        </div>

        <div className="calc-tabs-bar">
          <Tabs value={tool} onValueChange={(v) => setTool(v as Tool)}>
            <TabsList className="h-auto p-1">
              <TabsTrigger value="calculator" className="gap-2">
                <Calculator className="h-4 w-4" />
                <span>Calculator</span>
              </TabsTrigger>
              {protocol === 'ipv4' && (
                <TabsTrigger value="flsm" className="gap-2">
                  <Network className="h-4 w-4" />
                  <span>FLSM</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="vlsm" className="gap-2">
                <Network className="h-4 w-4" />
                <span>VLSM</span>
              </TabsTrigger>
              <TabsTrigger value="visualizer" className="gap-2">
                <Eye className="h-4 w-4" />
                <span>Visualizer</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={protocol} onValueChange={handleProtocolChange}>
            <TabsList className="h-auto p-1">
              <TabsTrigger value="ipv4" className="gap-2">
                <span className="font-semibold">IPv4</span>
              </TabsTrigger>
              <TabsTrigger value="ipv6" className="gap-2">
                <span className="font-semibold">IPv6</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="calc-content">
          {protocol === 'ipv4' && tool === 'calculator' && <SubnetCalculator />}
          {protocol === 'ipv4' && tool === 'flsm' && <FLSMCalculator />}
          {protocol === 'ipv4' && tool === 'vlsm' && <VLSMCalculator />}
          {protocol === 'ipv4' && tool === 'visualizer' && <SubnetVisualizer />}
          {protocol === 'ipv6' && tool === 'calculator' && <IPv6SubnetCalculator />}
          {protocol === 'ipv6' && tool === 'vlsm' && <IPv6VLSMCalculator />}
          {protocol === 'ipv6' && tool === 'visualizer' && <IPv6SubnetVisualizer />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

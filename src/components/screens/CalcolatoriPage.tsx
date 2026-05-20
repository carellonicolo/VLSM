import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Network, Calculator, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { DashboardLink } from '../ui/DashboardLink';
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

export function CalcolatoriPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="shell">
      <Header
        actions={
          <>
            <DashboardLink />
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

        <div className="calcolatori-hero">
          <h2 className="calcolatori-hero-title">
            Strumento per il <span className="accent">calcolo delle subnet</span>
          </h2>
          <p className="calcolatori-hero-subtitle">
            Calcola subnet IPv4 e IPv6, VLSM, FLSM e visualizza la divisione di rete.
          </p>
        </div>

        <Tabs defaultValue="ipv4" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid h-auto p-1">
            <TabsTrigger value="ipv4" className="gap-2">
              <span className="font-semibold">IPv4</span>
            </TabsTrigger>
            <TabsTrigger value="ipv6" className="gap-2">
              <span className="font-semibold">IPv6</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ipv4" className="space-y-6">
            <Tabs defaultValue="calculator" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid h-auto p-1">
                <TabsTrigger value="calculator" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  <span>Calculator</span>
                </TabsTrigger>
                <TabsTrigger value="flsm" className="gap-2">
                  <Network className="h-4 w-4" />
                  <span>FLSM</span>
                </TabsTrigger>
                <TabsTrigger value="vlsm" className="gap-2">
                  <Network className="h-4 w-4" />
                  <span>VLSM</span>
                </TabsTrigger>
                <TabsTrigger value="visualizer" className="gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Visualizer</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="space-y-6">
                <SubnetCalculator />
              </TabsContent>
              <TabsContent value="flsm" className="space-y-6">
                <FLSMCalculator />
              </TabsContent>
              <TabsContent value="vlsm" className="space-y-6">
                <VLSMCalculator />
              </TabsContent>
              <TabsContent value="visualizer" className="space-y-6">
                <SubnetVisualizer />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="ipv6" className="space-y-6">
            <Tabs defaultValue="calculator" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid h-auto p-1">
                <TabsTrigger value="calculator" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  <span>Calculator</span>
                </TabsTrigger>
                <TabsTrigger value="vlsm" className="gap-2">
                  <Network className="h-4 w-4" />
                  <span>VLSM</span>
                </TabsTrigger>
                <TabsTrigger value="visualizer" className="gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Visualizer</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="space-y-6">
                <IPv6SubnetCalculator />
              </TabsContent>
              <TabsContent value="vlsm" className="space-y-6">
                <IPv6VLSMCalculator />
              </TabsContent>
              <TabsContent value="visualizer" className="space-y-6">
                <IPv6SubnetVisualizer />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

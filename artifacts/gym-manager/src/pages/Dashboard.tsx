import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MobileTopBar } from '@/components/MobileTopBar';
import { StatCard } from '@/components/StatCard';
import { StudentForm } from '@/components/StudentForm';
import { StudentTable } from '@/components/StudentTable';
import { HistoricoSection } from '@/components/HistoricoSection';
import { useGetStats } from '@workspace/api-client-react';
import { Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export type View = 'menu' | 'alunos' | 'financeiro';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('menu');
  const { data: stats, isLoading: isStatsLoading } = useGetStats();

  function navigate(view: View) {
    setActiveView(view);
    setSidebarOpen(false); // always close drawer on mobile when navigating
  }

  // ── View titles ──────────────────────────────────────────────────────────
  const VIEW_TITLES: Record<View, string> = {
    menu: 'Menu Principal',
    alunos: 'Alunos',
    financeiro: 'Financeiro & Gráficos',
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar — desktop always visible, mobile slide-out drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={navigate}
      />

      {/* Mobile sticky top bar */}
      <MobileTopBar onMenuClick={() => setSidebarOpen(true)} />

      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        {/* Spacer for mobile top bar */}
        <div className="h-14 lg:hidden" />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* Page header */}
          <header>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              {VIEW_TITLES[activeView]}
            </h1>
          </header>

          {/* ── View: Menu Principal ── */}
          {activeView === 'menu' && (
            <section className="space-y-6 pb-10">
              {/* Overview stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <StatCard
                  title="Total de Alunos"
                  value={isStatsLoading ? '—' : (stats?.totalStudents ?? 0)}
                  icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
                  isLoading={isStatsLoading}
                />
                <StatCard
                  title="Mensalidades Em Dia"
                  value={isStatsLoading ? '—' : (stats?.activeStudents ?? 0)}
                  icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  isLoading={isStatsLoading}
                />
                <StatCard
                  title="Mensalidades Atrasadas"
                  value={isStatsLoading ? '—' : (stats?.overdueStudents ?? 0)}
                  icon={<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  isLoading={isStatsLoading}
                />
              </div>

              {/* Registration form */}
              <div className="max-w-lg">
                <StudentForm />
              </div>
            </section>
          )}

          {/* ── View: Alunos ── */}
          {activeView === 'alunos' && (
            <section className="space-y-4 pb-10">
              <StudentTable />
            </section>
          )}

          {/* ── View: Financeiro & Gráficos ── */}
          {activeView === 'financeiro' && (
            <section className="space-y-6 pb-10">
              {/* Financial stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <StatCard
                  title="Faturamento Mensal"
                  value={isStatsLoading ? '—' : formatBRL(stats?.monthlyRevenue ?? 0)}
                  icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
                  isLoading={isStatsLoading}
                />
                <StatCard
                  title="Mensalidades Pagas"
                  value={isStatsLoading ? '—' : (stats?.activeStudents ?? 0)}
                  icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  isLoading={isStatsLoading}
                />
                <StatCard
                  title="Mensalidades Atrasadas"
                  value={isStatsLoading ? '—' : (stats?.overdueStudents ?? 0)}
                  icon={<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  isLoading={isStatsLoading}
                />
              </div>

              {/* Chart + ledger */}
              <HistoricoSection />
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MobileTopBar } from '@/components/MobileTopBar';
import { StatCard } from '@/components/StatCard';
import { StudentForm } from '@/components/StudentForm';
import { StudentTable } from '@/components/StudentTable';
import { HistoricoSection } from '@/components/HistoricoSection';
import { useGetStats } from '@workspace/api-client-react';
import { Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

type Tab = 'alunos' | 'financeiro';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('alunos');
  const { data: stats, isLoading: isStatsLoading } = useGetStats();

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar — desktop always visible, mobile slide-out drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile sticky top bar */}
      <MobileTopBar onMenuClick={() => setSidebarOpen(true)} />

      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        {/* Top spacer for mobile top bar */}
        <div className="h-14 lg:hidden" />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* Page header */}
          <header className="hidden lg:block">
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              MJ Fitness
            </h1>
          </header>

          {/* ── Tab navigation ── */}
          <div className="border-b border-border">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab('alunos')}
                className={cn(
                  "px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap",
                  activeTab === 'alunos'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                👥 Alunos & Cadastro
              </button>
              <button
                onClick={() => setActiveTab('financeiro')}
                className={cn(
                  "px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap",
                  activeTab === 'financeiro'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                📊 Financeiro & Gráficos
              </button>
            </div>
          </div>

          {/* ── Tab: Alunos & Cadastro ── */}
          {activeTab === 'alunos' && (
            <section className="space-y-4 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-4">
                  <StudentForm />
                </div>
                <div className="lg:col-span-8">
                  <StudentTable />
                </div>
              </div>
            </section>
          )}

          {/* ── Tab: Financeiro & Gráficos ── */}
          {activeTab === 'financeiro' && (
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
                  value={stats?.activeStudents ?? 0}
                  icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  isLoading={isStatsLoading}
                />
                <StatCard
                  title="Mensalidades Atrasadas"
                  value={stats?.overdueStudents ?? 0}
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

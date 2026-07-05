import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { StudentForm } from '@/components/StudentForm';
import { StudentTable } from '@/components/StudentTable';
import { PaymentForm } from '@/components/PaymentForm';
import { FinancialTable } from '@/components/FinancialTable';
import { useGetStats } from '@workspace/api-client-react';
import { Users, Activity, CalendarCheck, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetStats();

  const currentDate = format(new Date(), "d 'de' MMMM, yyyy", { locale: ptBR });

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page header */}
          <header>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
              Gerenciador de Academia
            </h1>
            <p className="text-muted-foreground mt-1.5 capitalize font-medium text-sm sm:text-base">
              {currentDate}
            </p>
          </header>

          {/* ── Student stat cards ── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Alunos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Total de Alunos"
                value={stats?.totalStudents ?? 0}
                icon={<Users className="w-6 h-6" />}
                isLoading={isStatsLoading}
              />
              <StatCard
                title="Matrículas Ativas"
                value={stats?.activeEnrollments ?? 0}
                icon={<Activity className="w-6 h-6" />}
                isLoading={isStatsLoading}
              />
              <StatCard
                title="Planos Anuais"
                value={stats?.annualPlans ?? 0}
                icon={<CalendarCheck className="w-6 h-6" />}
                isLoading={isStatsLoading}
              />
            </div>
          </section>

          {/* ── Financial stat cards ── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Financeiro
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Faturamento Mensal (R$)"
                value={isStatsLoading ? 0 : formatCurrency(stats?.monthlyRevenue ?? 0)}
                icon={<TrendingUp className="w-6 h-6" />}
                isLoading={isStatsLoading}
              />
              <StatCard
                title="Mensalidades Pagas"
                value={stats?.paidCount ?? 0}
                icon={<CheckCircle className="w-6 h-6" />}
                isLoading={isStatsLoading}
              />
              <StatCard
                title="Mensalidades Atrasadas"
                value={stats?.overdueCount ?? 0}
                icon={<AlertCircle className="w-6 h-6" />}
                isLoading={isStatsLoading}
              />
            </div>
          </section>

          {/* ── Students section ── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Cadastro de Alunos
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4">
                <StudentForm />
              </div>
              <div className="lg:col-span-8">
                <StudentTable />
              </div>
            </div>
          </section>

          {/* ── Financial section ── */}
          <section className="pb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Histórico Financeiro
            </h2>
            <div className="space-y-4">
              <PaymentForm />
              <FinancialTable />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

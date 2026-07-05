import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { StudentForm } from '@/components/StudentForm';
import { StudentTable } from '@/components/StudentTable';
import { useGetStats } from '@workspace/api-client-react';
import { Users, Activity, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetStats();
  
  const currentDate = format(new Date(), "d 'de' MMMM, yyyy", { locale: ptBR });

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 ml-0 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
                Gerenciador de Academia
              </h1>
              <p className="text-muted-foreground mt-1.5 capitalize font-medium">
                {currentDate}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 sticky top-6">
              <StudentForm />
            </div>
            <div className="lg:col-span-8">
              <StudentTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
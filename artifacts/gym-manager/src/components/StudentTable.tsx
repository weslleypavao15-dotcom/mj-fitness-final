import { useListStudents, useDeleteStudent, getListStudentsQueryKey, getGetStatsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Search, UserX, UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function StudentTable() {
  const queryClient = useQueryClient();
  const { data: students, isLoading } = useListStudents();
  const deleteStudent = useDeleteStudent();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o aluno ${name}?`)) return;
    
    deleteStudent.mutate({ id }, {
      onSuccess: () => {
        toast.success("Aluno excluído com sucesso!");
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
      onError: () => {
        toast.error("Erro ao excluir o aluno. Tente novamente.");
      }
    });
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch(plan) {
      case "Plano Mensal": 
        return "bg-blue-100/80 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "Plano Trimestral": 
        return "bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "Plano Anual": 
        return "bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      default: 
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredStudents = students?.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];

  return (
    <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-card-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">Alunos Cadastrados</h2>
          <p className="text-sm text-muted-foreground mt-1">Lista completa e gerenciamento de matrículas.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar aluno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary w-full sm:w-72 transition-all shadow-sm"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-card sticky top-0 z-10 border-b border-card-border shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <tr>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Nome</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Plano</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Data de Matrícula</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-5"><div className="h-5 bg-muted animate-pulse rounded-md w-40"></div></td>
                  <td className="px-6 py-5"><div className="h-6 bg-muted animate-pulse rounded-full w-28"></div></td>
                  <td className="px-6 py-5"><div className="h-5 bg-muted animate-pulse rounded-md w-24"></div></td>
                  <td className="px-6 py-5 text-right"><div className="h-8 w-8 bg-muted animate-pulse rounded-md ml-auto"></div></td>
                </tr>
              ))
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{student.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">ID: #{student.id.toString().padStart(4, '0')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getPlanBadgeStyle(student.plan))}>
                      {student.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground/80 font-medium">
                    {format(parseISO(student.enrollmentDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(student.id, student.name)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Excluir aluno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                      {searchTerm ? <UserX className="w-8 h-8 opacity-40" /> : <UserPlus className="w-8 h-8 opacity-40" />}
                    </div>
                    <p className="text-base font-semibold text-foreground/80">
                      {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
                    </p>
                    <p className="text-sm mt-1 max-w-sm">
                      {searchTerm 
                        ? `A busca por "${searchTerm}" não retornou resultados.` 
                        : "Utilize o formulário ao lado para registrar o primeiro aluno na base de dados."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
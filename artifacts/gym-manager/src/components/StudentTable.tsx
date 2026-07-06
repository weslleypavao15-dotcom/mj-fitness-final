import {
  useListStudents,
  useDeleteStudent,
  useRenewStudent,
  getListStudentsQueryKey,
  getGetStatsQueryKey,
  getListHistoricoQueryKey,
} from '@workspace/api-client-react';
import type { Student } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Search, UserX, UserPlus, RefreshCw, CalendarClock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RenovarModal } from './RenovarModal';

export function StudentTable() {
  const queryClient = useQueryClient();
  const { data: students, isLoading } = useListStudents();
  const deleteStudent = useDeleteStudent();
  const renewStudent = useRenewStudent();
  const [searchTerm, setSearchTerm] = useState('');
  const [renovarStudent, setRenovarStudent] = useState<Student | null>(null);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListHistoricoQueryKey() });
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o aluno "${name}"?`)) return;
    deleteStudent.mutate({ id }, {
      onSuccess: () => { toast.success("Aluno excluído."); invalidateAll(); },
      onError: () => toast.error("Erro ao excluir o aluno."),
    });
  };

  const handleRenewConfirm = (formaPagamento: string) => {
    if (!renovarStudent) return;
    renewStudent.mutate({ id: renovarStudent.id, data: { formaPagamento } }, {
      onSuccess: () => {
        toast.success(`Assinatura de "${renovarStudent.name}" renovada! +R$ 100,00 registrado.`);
        setRenovarStudent(null);
        invalidateAll();
      },
      onError: () => toast.error("Erro ao renovar assinatura."),
    });
  };

  const filtered = students?.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const statusStyle = (status: string) =>
    status === 'Em Dia'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';

  const SkeletonRow = () => (
    <tr>
      <td className="px-4 py-4"><div className="h-4 bg-muted animate-pulse rounded w-32" /></td>
      <td className="px-4 py-4"><div className="h-6 bg-muted animate-pulse rounded-full w-16" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-muted animate-pulse rounded w-20" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-muted animate-pulse rounded w-20" /></td>
      <td className="px-4 py-4 text-right"><div className="h-8 bg-muted animate-pulse rounded w-28 ml-auto" /></td>
    </tr>
  );

  return (
    <>
      {renovarStudent && (
        <RenovarModal
          studentName={renovarStudent.name}
          plano={renovarStudent.plano}
          onClose={() => setRenovarStudent(null)}
          onConfirm={handleRenewConfirm}
          isPending={renewStudent.isPending}
        />
      )}

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b border-card-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-display font-bold text-foreground">Alunos Cadastrados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Gerencie matrículas e renove assinaturas.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary w-full sm:w-56 transition-all"
            />
          </div>
        </div>

        {/* ── Mobile cards ── */}
        <div className="block lg:hidden divide-y divide-card-border/60">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="h-5 bg-muted animate-pulse rounded w-40" />
                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                <div className="h-8 bg-muted animate-pulse rounded w-full" />
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((student) => (
              <div key={student.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ID #{student.id.toString().padStart(4, '0')}
                      {student.plano ? ` · ${student.plano}` : ''}
                    </p>
                    {student.telefone && (
                      <p className="text-xs text-muted-foreground">{student.telefone}</p>
                    )}
                  </div>
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border shrink-0", statusStyle(student.status))}>
                    {student.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                  Vencimento: {format(parseISO(student.dataVencimento), "dd/MM/yyyy", { locale: ptBR })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setRenovarStudent(student)}
                    disabled={renewStudent.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-3 rounded-lg text-xs font-bold transition-all disabled:opacity-60"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renovar Assinatura
                  </button>
                  <button
                    onClick={() => handleDelete(student.id, student.name)}
                    disabled={deleteStudent.isPending}
                    className="p-2 rounded-lg border text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/15 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-muted-foreground">
              <div className="bg-muted/50 p-4 rounded-full inline-flex mb-3">
                {searchTerm ? <UserX className="w-7 h-7 opacity-40" /> : <UserPlus className="w-7 h-7 opacity-40" />}
              </div>
              <p className="text-sm font-semibold text-foreground/70">
                {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
              </p>
            </div>
          )}
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden lg:block overflow-x-auto flex-1">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-muted/20 border-b border-card-border sticky top-0">
              <tr>
                <th className="px-4 py-3.5 font-semibold text-muted-foreground whitespace-nowrap">Nome</th>
                <th className="px-4 py-3.5 font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 font-semibold text-muted-foreground whitespace-nowrap">Plano</th>
                <th className="px-4 py-3.5 font-semibold text-muted-foreground whitespace-nowrap">Vencimento</th>
                <th className="px-4 py-3.5 font-semibold text-muted-foreground whitespace-nowrap text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length > 0 ? (
                filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground whitespace-nowrap">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.cpf ?? `ID #${student.id.toString().padStart(4, '0')}`}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap", statusStyle(student.status))}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-foreground/80 whitespace-nowrap text-xs">
                      {student.plano ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-foreground/80 whitespace-nowrap">
                      {format(parseISO(student.dataVencimento), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRenovarStudent(student)}
                          disabled={renewStudent.isPending}
                          className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-60 whitespace-nowrap"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Renovar
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          disabled={deleteStudent.isPending}
                          className="p-1.5 rounded-lg border text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/15 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
                          title="Excluir aluno"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="bg-muted/50 p-4 rounded-full">
                        {searchTerm ? <UserX className="w-8 h-8 opacity-40" /> : <UserPlus className="w-8 h-8 opacity-40" />}
                      </div>
                      <p className="text-sm font-semibold text-foreground/70">
                        {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
                      </p>
                      <p className="text-xs">
                        {searchTerm
                          ? `A busca por "${searchTerm}" não retornou resultados.`
                          : "Use o formulário ao lado para registrar o primeiro aluno."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

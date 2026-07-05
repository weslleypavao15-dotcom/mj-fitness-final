import {
  useListPayments,
  useDeletePayment,
  getListPaymentsQueryKey,
  getGetStatsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Receipt, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function FinancialTable() {
  const queryClient = useQueryClient();
  const { data: payments, isLoading } = useListPayments();
  const deletePayment = useDeletePayment();

  const handleDelete = (id: number) => {
    if (!confirm("Tem certeza que deseja remover este registro de pagamento?")) return;
    deletePayment.mutate({ id }, {
      onSuccess: () => {
        toast.success("Pagamento removido com sucesso!");
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
      onError: () => {
        toast.error("Erro ao remover pagamento.");
      },
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatusStyle = (status: string) =>
    status === 'Pago'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-red-100 text-red-800 border-red-200';

  const totalVisible = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  return (
    <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-card-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/10">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-foreground">Histórico Financeiro</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {payments ? `${payments.length} registro${payments.length !== 1 ? 's' : ''}` : '—'}
            </p>
          </div>
        </div>
        {payments && payments.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 self-start sm:self-auto">
            <TrendingUp className="w-4 h-4 text-primary" />
            Total: {formatCurrency(totalVisible)}
          </div>
        )}
      </div>

      {/* Table with horizontal scroll for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm text-left">
          {/* Spreadsheet-style column headers */}
          <thead>
            <tr className="bg-muted/30 border-b border-card-border">
              <th className="px-5 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider whitespace-nowrap">#</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider whitespace-nowrap">Aluno</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider whitespace-nowrap text-right">Valor Pago</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider whitespace-nowrap">Data do Pagamento</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider whitespace-nowrap">Status</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider whitespace-nowrap text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/40">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="bg-card">
                  <td className="px-5 py-4"><div className="h-4 bg-muted animate-pulse rounded w-8" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-muted animate-pulse rounded w-32" /></td>
                  <td className="px-5 py-4 text-right"><div className="h-4 bg-muted animate-pulse rounded w-20 ml-auto" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-muted animate-pulse rounded w-24" /></td>
                  <td className="px-5 py-4"><div className="h-6 bg-muted animate-pulse rounded-full w-16" /></td>
                  <td className="px-5 py-4 text-right"><div className="h-8 w-8 bg-muted animate-pulse rounded-lg ml-auto" /></td>
                </tr>
              ))
            ) : payments && payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment.id} className="hover:bg-muted/20 transition-colors group bg-card">
                  {/* Row number — spreadsheet feel */}
                  <td className="px-5 py-4 text-xs text-muted-foreground font-mono font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground whitespace-nowrap">
                    {payment.studentName}
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-5 py-4 text-foreground/80 whitespace-nowrap">
                    {format(parseISO(payment.paymentDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap", getStatusStyle(payment.status))}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(payment.id)}
                      disabled={deletePayment.isPending}
                      className="p-2 rounded-lg border transition-colors text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/15 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
                      title="Remover pagamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="bg-muted/50 p-4 rounded-full">
                      <Receipt className="w-7 h-7 opacity-40" />
                    </div>
                    <p className="text-sm font-semibold text-foreground/70">Nenhum pagamento registrado</p>
                    <p className="text-xs max-w-xs">Use o formulário acima para registrar a primeira entrada financeira.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          {/* Footer totals row — spreadsheet feel */}
          {payments && payments.length > 0 && (
            <tfoot>
              <tr className="bg-muted/30 border-t-2 border-card-border">
                <td colSpan={2} className="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Geral
                </td>
                <td className="px-5 py-3 text-right font-mono font-bold text-foreground text-sm whitespace-nowrap">
                  {formatCurrency(totalVisible)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

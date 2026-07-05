import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreatePayment,
  useListStudents,
  getListPaymentsQueryKey,
  getGetStatsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DollarSign, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  studentId: z.coerce.number().int().min(1, "Selecione um aluno"),
  amount: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
  paymentDate: z.string().min(1, "A data de pagamento é obrigatória"),
  status: z.enum(["Pago", "Atrasado"]),
});

type FormValues = z.infer<typeof formSchema>;

export function PaymentForm() {
  const queryClient = useQueryClient();
  const { data: students } = useListStudents();
  const createPayment = useCreatePayment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 0,
      amount: undefined,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Pago',
    },
  });

  const onSubmit = (data: FormValues) => {
    createPayment.mutate(
      { data: { studentId: data.studentId, amount: data.amount, paymentDate: data.paymentDate, status: data.status } },
      {
        onSuccess: () => {
          toast.success("Pagamento registrado com sucesso!");
          reset({ studentId: 0, amount: undefined, paymentDate: new Date().toISOString().split('T')[0], status: 'Pago' });
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        },
        onError: () => {
          toast.error("Erro ao registrar pagamento. Tente novamente.");
        },
      }
    );
  };

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full px-3 py-2.5 rounded-lg border bg-background text-sm ring-offset-background",
      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-primary/50 focus-visible:border-primary transition-all",
      hasError
        ? "border-destructive focus-visible:ring-destructive/50"
        : "border-input"
    );

  return (
    <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-card-border bg-muted/30 flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/10">
          <DollarSign className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-display font-bold text-foreground">Registrar Pagamento</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Adicione uma entrada financeira.</p>
        </div>
      </div>

      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Aluno */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground tracking-tight">Aluno</label>
            <select {...register('studentId')} className={inputClass(!!errors.studentId)}>
              <option value={0} disabled>Selecionar aluno...</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.studentId && <p className="text-xs text-destructive font-medium">{errors.studentId.message}</p>}
          </div>

          {/* Valor */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground tracking-tight">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 120,00"
              {...register('amount')}
              className={inputClass(!!errors.amount)}
            />
            {errors.amount && <p className="text-xs text-destructive font-medium">{errors.amount.message}</p>}
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground tracking-tight">Data do Pagamento</label>
            <input
              type="date"
              {...register('paymentDate')}
              className={inputClass(!!errors.paymentDate)}
            />
            {errors.paymentDate && <p className="text-xs text-destructive font-medium">{errors.paymentDate.message}</p>}
          </div>

          {/* Status + button */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground tracking-tight">Status</label>
            <div className="flex gap-2">
              <select {...register('status')} className={cn(inputClass(!!errors.status), "flex-1")}>
                <option value="Pago">Pago</option>
                <option value="Atrasado">Atrasado</option>
              </select>
              <button
                type="submit"
                disabled={createPayment.isPending}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                {createPayment.isPending ? "..." : "Registrar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

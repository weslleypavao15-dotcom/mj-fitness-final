import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateStudent, getListStudentsQueryKey, getGetStatsQueryKey, getListHistoricoQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const FORMAS_PAGAMENTO = [
  '📱 Pix',
  '💵 Dinheiro',
  '💳 Cartão de Crédito',
  '💳 Cartão de Débito',
];

const PLANOS = [
  { label: 'Plano Mensal — R$ 100,00', value: 'Plano Mensal' },
];

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  plano: z.string().min(1, "Selecione um plano"),
  formaPagamento: z.string().min(1, "Selecione a forma de pagamento"),
  enrollmentDate: z.string().min(1, "A data de matrícula é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

export function StudentForm() {
  const queryClient = useQueryClient();
  const createStudent = useCreateStudent();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cpf: '',
      telefone: '',
      plano: PLANOS[0].value,
      formaPagamento: FORMAS_PAGAMENTO[0],
      enrollmentDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: FormValues) => {
    createStudent.mutate({ data }, {
      onSuccess: () => {
        toast.success("Aluno cadastrado! Primeira mensalidade registrada automaticamente.");
        reset({
          name: '',
          cpf: '',
          telefone: '',
          plano: PLANOS[0].value,
          formaPagamento: FORMAS_PAGAMENTO[0],
          enrollmentDate: new Date().toISOString().split('T')[0],
        });
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListHistoricoQueryKey() });
      },
      onError: () => {
        toast.error("Erro ao cadastrar o aluno. Tente novamente.");
      },
    });
  };

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full px-3 py-2.5 rounded-lg border bg-background text-sm",
      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-primary/50 focus-visible:border-primary transition-all",
      hasError ? "border-destructive focus-visible:ring-destructive/50" : "border-input"
    );

  const selectClass = (hasError: boolean) =>
    cn(
      "w-full px-3 py-2.5 rounded-lg border bg-background text-sm",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-primary/50 focus-visible:border-primary transition-all",
      hasError ? "border-destructive" : "border-input"
    );

  return (
    <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-card-border bg-muted/30">
        <h2 className="text-base font-display font-bold text-foreground">Cadastrar Novo Aluno</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Mensalidade fixa de <strong>R$ 100,00</strong>. Vencimento automático em 1 mês.
        </p>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Nome */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-foreground tracking-tight">
              Nome do Aluno
            </label>
            <input
              id="name"
              {...register('name')}
              placeholder="Ex: Carlos Silva"
              className={inputClass(!!errors.name)}
            />
            {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
          </div>

          {/* CPF + Telefone side-by-side on lg, stacked on mobile */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="cpf" className="text-xs font-semibold text-foreground tracking-tight">
                CPF
              </label>
              <input
                id="cpf"
                {...register('cpf')}
                placeholder="000.000.000-00"
                className={inputClass(!!errors.cpf)}
              />
              {errors.cpf && <p className="text-xs text-destructive font-medium">{errors.cpf.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="telefone" className="text-xs font-semibold text-foreground tracking-tight">
                Número de Telefone
              </label>
              <input
                id="telefone"
                {...register('telefone')}
                placeholder="(00) 00000-0000"
                className={inputClass(!!errors.telefone)}
              />
              {errors.telefone && <p className="text-xs text-destructive font-medium">{errors.telefone.message}</p>}
            </div>
          </div>

          {/* Plano */}
          <div className="space-y-1.5">
            <label htmlFor="plano" className="text-xs font-semibold text-foreground tracking-tight">
              Plano
            </label>
            <select
              id="plano"
              {...register('plano')}
              className={selectClass(!!errors.plano)}
            >
              {PLANOS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {errors.plano && <p className="text-xs text-destructive font-medium">{errors.plano.message}</p>}
          </div>

          {/* Data de Matrícula */}
          <div className="space-y-1.5">
            <label htmlFor="enrollmentDate" className="text-xs font-semibold text-foreground tracking-tight">
              Data de Matrícula
            </label>
            <input
              id="enrollmentDate"
              type="date"
              {...register('enrollmentDate')}
              className={inputClass(!!errors.enrollmentDate)}
            />
            {errors.enrollmentDate && (
              <p className="text-xs text-destructive font-medium">{errors.enrollmentDate.message}</p>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-1.5">
            <label htmlFor="formaPagamento" className="text-xs font-semibold text-foreground tracking-tight">
              Forma de Pagamento
            </label>
            <select
              id="formaPagamento"
              {...register('formaPagamento')}
              className={selectClass(!!errors.formaPagamento)}
            >
              {FORMAS_PAGAMENTO.map((fp) => (
                <option key={fp} value={fp}>{fp}</option>
              ))}
            </select>
            {errors.formaPagamento && <p className="text-xs text-destructive font-medium">{errors.formaPagamento.message}</p>}
          </div>

          {/* Info box */}
          <div className="p-3 bg-muted/40 rounded-lg border border-card-border text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground/70">Ao cadastrar, o sistema irá:</p>
            <p>✓ Registrar o aluno com vencimento em 1 mês</p>
            <p>✓ Lançar R$ 100,00 no histórico financeiro</p>
          </div>

          <button
            type="submit"
            disabled={createStudent.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-4 rounded-lg font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            {createStudent.isPending ? "Cadastrando..." : "Cadastrar Aluno"}
          </button>
        </form>
      </div>
    </div>
  );
}

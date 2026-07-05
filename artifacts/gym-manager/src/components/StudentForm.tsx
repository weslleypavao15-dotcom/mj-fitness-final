import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateStudent, getListStudentsQueryKey, getGetStatsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StudentInputPlan } from '@workspace/api-client-react';

const planOptions = ["Plano Mensal", "Plano Trimestral", "Plano Anual"] as const;

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  plan: z.enum([StudentInputPlan.Plano_Mensal, StudentInputPlan.Plano_Trimestral, StudentInputPlan.Plano_Anual]),
  enrollmentDate: z.string().min(1, "A data de matrícula é obrigatória")
});

type FormValues = z.infer<typeof formSchema>;

export function StudentForm() {
  const queryClient = useQueryClient();
  const createStudent = useCreateStudent();
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      plan: StudentInputPlan.Plano_Mensal,
      enrollmentDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = (data: FormValues) => {
    createStudent.mutate({ data }, {
      onSuccess: () => {
        toast.success("Aluno cadastrado com sucesso!");
        reset();
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
      onError: () => {
        toast.error("Erro ao cadastrar o aluno. Tente novamente.");
      }
    });
  };

  return (
    <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-card-border bg-muted/30">
        <h2 className="text-lg font-display font-bold text-foreground">Cadastrar Novo Aluno</h2>
        <p className="text-sm text-muted-foreground mt-1">Adicione um novo membro ao sistema.</p>
      </div>
      <div className="p-6 flex-1 bg-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-foreground tracking-tight">Nome do Aluno</label>
            <input
              id="name"
              {...register('name')}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all",
                errors.name ? "border-destructive focus-visible:ring-destructive/50 focus-visible:border-destructive" : "border-input"
              )}
              placeholder="Ex: Carlos Silva"
            />
            {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="plan" className="text-sm font-semibold text-foreground tracking-tight">Plano</label>
            <select
              id="plan"
              {...register('plan')}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all appearance-none cursor-pointer",
                errors.plan ? "border-destructive focus-visible:ring-destructive/50 focus-visible:border-destructive" : "border-input"
              )}
            >
              <option value={StudentInputPlan.Plano_Mensal}>Plano Mensal</option>
              <option value={StudentInputPlan.Plano_Trimestral}>Plano Trimestral</option>
              <option value={StudentInputPlan.Plano_Anual}>Plano Anual</option>
            </select>
            {errors.plan && <p className="text-xs text-destructive font-medium">{errors.plan.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="enrollmentDate" className="text-sm font-semibold text-foreground tracking-tight">Data de Matrícula</label>
            <input
              id="enrollmentDate"
              type="date"
              {...register('enrollmentDate')}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all cursor-text",
                errors.enrollmentDate ? "border-destructive focus-visible:ring-destructive/50 focus-visible:border-destructive" : "border-input"
              )}
            />
            {errors.enrollmentDate && <p className="text-xs text-destructive font-medium">{errors.enrollmentDate.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-4 rounded-lg font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-6 shadow-sm shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            {isSubmitting ? "Cadastrando..." : "Cadastrar Aluno"}
          </button>
        </form>
      </div>
    </div>
  );
}
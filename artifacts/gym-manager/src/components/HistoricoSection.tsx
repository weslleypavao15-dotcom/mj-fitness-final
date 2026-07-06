import { useListHistorico } from '@workspace/api-client-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const ACCENT = '#C41C1C';

function buildChartData(items: { paymentDate: string; amount: number }[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.paymentDate.slice(0, 7); // YYYY-MM
    map.set(key, (map.get(key) ?? 0) + item.amount);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => {
      const [year, month] = key.split('-');
      const label = format(new Date(Number(year), Number(month) - 1, 1), "MMM/yy", { locale: ptBR });
      return { mes: label, total };
    });
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-card-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-foreground capitalize">{label}</p>
      <p className="text-primary font-bold mt-0.5">{formatBRL(payload[0].value)}</p>
    </div>
  );
};

export function HistoricoSection() {
  const { data: historico, isLoading } = useListHistorico();

  const chartData = historico ? buildChartData(historico) : [];
  const totalGeral = historico?.reduce((sum, h) => sum + h.amount, 0) ?? 0;

  return (
    <div className="space-y-4">
      {/* ── Bar chart ── */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-card-border bg-muted/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/10">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-foreground">Receita por Período</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Entradas financeiras agrupadas por mês</p>
            </div>
          </div>
          {totalGeral > 0 && (
            <span className="text-sm font-bold text-foreground bg-primary/5 border border-primary/15 px-3 py-1.5 rounded-lg shrink-0">
              Total: {formatBRL(totalGeral)}
            </span>
          )}
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="h-52 bg-muted/30 animate-pulse rounded-lg" />
          ) : chartData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
              Nenhuma entrada financeira registrada ainda.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground, #6b7280)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground, #6b7280)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                  width={58}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted, #f3f4f6)', opacity: 0.5 }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={ACCENT} fillOpacity={index === chartData.length - 1 ? 1 : 0.65} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Spreadsheet table ── */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-card-border bg-muted/30 flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/10">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-foreground">Histórico Financeiro</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {historico ? `${historico.length} lançamento${historico.length !== 1 ? 's' : ''} registrado${historico.length !== 1 ? 's' : ''}` : '—'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-card-border">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">#</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Aluno</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-right">Valor</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Data</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4"><div className="h-4 bg-muted animate-pulse rounded w-6" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-muted animate-pulse rounded w-32" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 bg-muted animate-pulse rounded w-20 ml-auto" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-muted animate-pulse rounded w-24" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-muted animate-pulse rounded w-24" /></td>
                  </tr>
                ))
              ) : historico && historico.length > 0 ? (
                historico.map((item, index) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">
                      {item.studentName}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-primary whitespace-nowrap">
                      {formatBRL(item.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-foreground/70 whitespace-nowrap">
                      {format(parseISO(item.paymentDate), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-5 py-3.5 text-foreground/70 whitespace-nowrap text-sm">
                      {item.formaPagamento ?? '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    Nenhuma entrada financeira registrada.
                  </td>
                </tr>
              )}
            </tbody>
            {historico && historico.length > 0 && (
              <tfoot>
                <tr className="bg-muted/30 border-t-2 border-card-border">
                  <td colSpan={2} className="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Total Geral
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    {formatBRL(totalGeral)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

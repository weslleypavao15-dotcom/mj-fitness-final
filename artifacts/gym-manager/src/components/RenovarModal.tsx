import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';

const FORMAS_PAGAMENTO = [
  '📱 Pix',
  '💵 Dinheiro',
  '💳 Cartão de Crédito',
  '💳 Cartão de Débito',
];

interface RenovarModalProps {
  studentName: string;
  plano: string | null | undefined;
  onClose: () => void;
  onConfirm: (formaPagamento: string) => void;
  isPending: boolean;
}

export function RenovarModal({ studentName, plano, onClose, onConfirm, isPending }: RenovarModalProps) {
  const [formaPagamento, setFormaPagamento] = useState(FORMAS_PAGAMENTO[0]);

  const handleConfirm = () => {
    onConfirm(formaPagamento);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Renovar Assinatura</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan info */}
        <div className="bg-muted/40 border border-card-border rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Plano</span>
            <span className="text-sm font-semibold text-foreground">{plano ?? 'Plano Mensal'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="text-base font-bold text-primary">R$ 100,00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Extensão</span>
            <span className="text-sm font-semibold text-foreground">+1 mês</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-foreground tracking-tight">
            Forma de Pagamento
          </label>
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
          >
            {FORMAS_PAGAMENTO.map((fp) => (
              <option key={fp} value={fp}>{fp}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Renovando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

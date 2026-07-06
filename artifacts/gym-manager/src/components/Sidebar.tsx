import { LayoutDashboard, Users, TrendingUp, X } from 'lucide-react';
import type { View } from '@/pages/Dashboard';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: View;
  onNavigate: (view: View) => void;
}

const NAV_ITEMS: { view: View; label: string; icon: React.ReactNode }[] = [
  {
    view: 'menu',
    label: 'Menu Principal',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    view: 'alunos',
    label: 'Alunos',
    icon: <Users className="w-5 h-5" />,
  },
  {
    view: 'financeiro',
    label: 'Financeiro',
    icon: <TrendingUp className="w-5 h-5" />,
  },
];

export function Sidebar({ isOpen, onClose, activeView, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground',
          'flex flex-col border-r border-sidebar-border z-40',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border/40">
          <img
            src="/mj-fitness-logo.png"
            alt="MJ Fitness"
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex flex-col leading-tight flex-1">
            <span className="text-lg font-display font-bold tracking-wide text-sidebar-foreground">
              MJ Fitness
            </span>
            <span className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
              Academia
            </span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {NAV_ITEMS.map(({ view, label, icon }) => {
            const active = activeView === view;
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all',
                  'border text-left',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border/50 shadow-sm'
                    : 'border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <span className={cn('shrink-0', active ? 'text-primary' : '')}>
                  {icon}
                </span>
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-sidebar-border/40 bg-sidebar/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border border-primary/40">
              MJ
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">MJ Fitness</span>
              <span className="text-xs text-sidebar-foreground/40">Administrador</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

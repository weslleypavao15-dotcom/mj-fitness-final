import { LayoutDashboard, Users, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
        className={`
          fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground
          flex flex-col border-r border-sidebar-border z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo area */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border/40">
          <img
            src="/mj-fitness-logo.png"
            alt="MJ Fitness"
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex flex-col leading-tight flex-1">
            <span className="text-lg font-display font-bold tracking-wide text-sidebar-foreground">MJ Fitness</span>
            <span className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest">Academia</span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-sidebar-accent text-sidebar-accent-foreground font-medium border border-sidebar-border/50 shadow-sm">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Dashboard
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors cursor-pointer border border-transparent">
            <Users className="w-5 h-5" />
            Alunos
          </div>
        </nav>

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

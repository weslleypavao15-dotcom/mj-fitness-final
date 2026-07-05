import { Dumbbell, LayoutDashboard, Users } from 'lucide-react';
import { Link } from 'wouter';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border z-10 hidden lg:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
          <Dumbbell className="w-6 h-6" />
        </div>
        <span className="text-2xl font-display font-bold tracking-wide">GymPro</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-md bg-sidebar-accent text-sidebar-accent-foreground font-medium transition-colors border border-sidebar-border/50 shadow-sm">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3 px-4 py-3 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors cursor-pointer border border-transparent">
          <Users className="w-5 h-5" />
          Alunos
        </div>
      </nav>

      <div className="p-6 border-t border-sidebar-border/50 bg-sidebar/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-primary font-bold border border-sidebar-border">
            FT
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Academia Força Total</span>
            <span className="text-xs text-sidebar-foreground/50">Administrador</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
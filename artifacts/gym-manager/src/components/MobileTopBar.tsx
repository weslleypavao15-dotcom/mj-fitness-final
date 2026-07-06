import { Menu } from 'lucide-react';

interface MobileTopBarProps {
  onMenuClick: () => void;
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-3">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <img
        src="/mj-fitness-logo.png"
        alt="MJ Fitness"
        className="w-8 h-8 rounded-md object-cover"
      />
      <span className="text-base font-display font-bold text-sidebar-foreground tracking-wide">
        MJ Fitness
      </span>
    </div>
  );
}

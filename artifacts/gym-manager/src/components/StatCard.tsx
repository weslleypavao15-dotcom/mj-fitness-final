import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  isLoading?: boolean;
}

export function StatCard({ title, value, icon, isLoading }: StatCardProps) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
        {icon}
      </div>
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2.5 bg-primary/10 text-primary rounded-lg shadow-sm border border-primary/10 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      </div>
      <div className="relative z-10">
        {isLoading ? (
          <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
        ) : (
          <p className="text-4xl font-display font-bold text-foreground">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
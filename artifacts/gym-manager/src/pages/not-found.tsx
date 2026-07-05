import { Link } from 'wouter';
import { Dumbbell } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="bg-primary/10 p-6 rounded-full mb-8">
        <Dumbbell className="w-16 h-16 text-primary" />
      </div>
      <h1 className="text-8xl font-display font-black text-foreground mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold mb-2">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md font-medium">
        A página que você está procurando não existe, foi movida ou você não tem acesso.
      </p>
      <Link href="/" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95">
        Voltar para o Dashboard
      </Link>
    </div>
  );
}
import { Link } from 'react-router';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Pagina no encontrada.</p>
      <Link to="/dashboard" className={buttonVariants({ variant: 'secondary' })}>
        Volver al dashboard
      </Link>
    </div>
  );
}

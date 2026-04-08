import { Link } from 'react-router';
import { useMetrics } from '@/hooks/use-metrics';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Metrics() {
  const { data, isLoading, error } = useMetrics();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error al cargar metricas: {error.message}</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No hay metricas registradas.</p>;
  }

  return (
    <div className="space-y-2">
      {data.map((metric) => (
        <Link
          key={metric.name}
          to={`/metrics/${encodeURIComponent(metric.name)}`}
          className="flex items-center justify-between rounded-md border border-border p-4 transition-colors hover:bg-accent"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">{metric.name}</p>
            <p className="text-xs text-muted-foreground">
              {metric.description || 'Sin descripcion'}{metric.unit ? ` (${metric.unit})` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm">
              {metric.lastValue != null ? metric.lastValue.toFixed(2) : '—'}
            </span>
            <Badge variant="secondary">{metric.type}</Badge>
            <span className="text-xs text-muted-foreground">
              {metric.dataPointCount} pts
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

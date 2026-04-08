import { Link } from 'react-router';
import { useTraces } from '@/hooks/use-traces';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SPAN_STATUS_LABELS } from '@/lib/constants';

export default function Traces() {
  const { data, isLoading, error } = useTraces();
  console.log("🚀 ~ Traces ~ data:", data)

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
    return <p className="text-destructive">Error al cargar traces: {error.message}</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No hay traces registrados.</p>;
  }

  return (
    <div className="space-y-2">
      {data.map((trace) => (
        <Link
          key={trace.traceId}
          to={`/traces/${trace.traceId}`}
          className="flex items-center justify-between rounded-md border border-border p-4 transition-colors hover:bg-accent"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">{trace.rootSpanName ?? trace.traceId}</p>
            <p className="text-xs text-muted-foreground">
              {trace.serviceName} &middot; {trace.spanCount} spans
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {trace.durationMs != null ? `${trace.durationMs.toFixed(1)}ms` : '—'}
            </span>
            <Badge variant={trace.statusCode === 2 ? 'destructive' : 'secondary'}>
              {SPAN_STATUS_LABELS[trace.statusCode ?? 0] ?? 'Unknown'}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

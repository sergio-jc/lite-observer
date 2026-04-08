import { useParams } from 'react-router';
import { useTraceDetail } from '@/hooks/use-traces';
import { TraceSpansPanel } from '@/components/traces/trace-spans-panel';
import { Skeleton } from '@/components/ui/skeleton';

export default function TraceDetail() {
  const { traceId } = useParams<{ traceId: string }>();
  const { data: spans, isLoading, error } = useTraceDetail(traceId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error al cargar trace: {error.message}</p>;
  }

  if (!spans || spans.length === 0) {
    return <p className="text-muted-foreground">Trace no encontrado.</p>;
  }

  return (
    <div className="space-y-4 flex-1 flex">
      <TraceSpansPanel spans={spans} />
    </div>
  );
}

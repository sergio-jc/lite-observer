import { useParams } from 'react-router';
import { useTraceDetail } from '@/hooks/use-traces';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SPAN_STATUS_LABELS, SPAN_KIND_LABELS } from '@/lib/constants';

export default function TraceDetail() {
  const { traceId } = useParams<{ traceId: string }>();
  const { data: spans, isLoading, error } = useTraceDetail(traceId);
  console.log("🚀 ~ TraceDetail ~ spans:", spans)

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
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Trace ID</h2>
        <p className="font-mono text-sm">{traceId}</p>
      </div>

      <div className="space-y-2">
        {spans.map((span) => (
          <div
            key={span.spanId}
            className="rounded-md border border-border p-3"
            style={{ marginLeft: span.parentSpanId ? 24 : 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{span.name}</p>
                <p className="text-xs text-muted-foreground">
                  {span.serviceName} &middot; {SPAN_KIND_LABELS[span.kind] ?? 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {span.durationMs.toFixed(1)}ms
                </span>
                <Badge variant={span.statusCode === 2 ? 'destructive' : 'secondary'}>
                  {SPAN_STATUS_LABELS[span.statusCode] ?? 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

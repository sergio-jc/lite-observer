import { useLogs } from '@/hooks/use-logs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SEVERITY_LABELS } from '@/lib/constants';

function severityVariant(severity: number) {
  if (severity >= 17) return 'destructive' as const;
  if (severity >= 13) return 'outline' as const;
  return 'secondary' as const;
}

export default function Logs() {
  const { data, isLoading, error } = useLogs();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error al cargar logs: {error.message}</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No hay logs registrados.</p>;
  }

  return (
    <div className="space-y-1">
      {data.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-3 rounded-md border border-border p-3"
        >
          <Badge variant={severityVariant(log.severityNumber)} className="mt-0.5 shrink-0">
            {log.severityText || SEVERITY_LABELS[log.severityNumber] || 'Unknown'}
          </Badge>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate font-mono text-sm">{log.body || '(empty)'}</p>
            <p className="text-xs text-muted-foreground">
              {log.serviceName}
              {log.traceId ? ` · trace:${log.traceId.slice(0, 8)}…` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

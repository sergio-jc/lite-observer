import { useParams } from 'react-router';
import { useMetricDetail } from '@/hooks/use-metrics';
import { Skeleton } from '@/components/ui/skeleton';

export default function MetricDetail() {
  const { name } = useParams<{ name: string }>();
  const decodedName = name ? decodeURIComponent(name) : undefined;
  const { data, isLoading, error } = useMetricDetail(decodedName);

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
    return <p className="text-destructive">Error al cargar metrica: {error.message}</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">Sin data points para esta metrica.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Metrica</h2>
        <p className="text-lg font-semibold">{decodedName}</p>
        <p className="text-xs text-muted-foreground">
          {data[0].type} &middot; {data.length} data points
        </p>
      </div>

      <div className="rounded-md border border-border">
        <div className="grid grid-cols-4 gap-4 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
          <span>Valor</span>
          <span>Servicio</span>
          <span>Tiempo</span>
          <span>Tipo</span>
        </div>
        {data.map((dp) => (
          <div key={dp.id} className="grid grid-cols-4 gap-4 border-b border-border px-4 py-2 text-sm last:border-b-0">
            <span className="font-mono">{dp.value != null ? dp.value.toFixed(2) : '—'}</span>
            <span>{dp.serviceName}</span>
            <span className="text-xs text-muted-foreground">{dp.timeUnixNano}</span>
            <span>{dp.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

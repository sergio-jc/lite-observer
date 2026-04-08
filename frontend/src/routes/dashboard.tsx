import { useSummary } from '@/hooks/use-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data, isLoading, error } = useSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error al cargar el resumen: {error.message}</p>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.spans.total.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(data.spans.errorRate * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.metrics.total.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.logs.total.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Top Services</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos de servicios todavia.</p>
          ) : (
            <div className="space-y-2">
              {data.topServices.map((svc) => (
                <div key={svc.serviceName} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{svc.serviceName}</span>
                  <span className="text-muted-foreground">
                    {svc.spanCount} spans &middot; {svc.errorCount} errors
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

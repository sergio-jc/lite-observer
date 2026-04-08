import { Link } from "react-router";
import { useTraces } from "@/hooks/use-traces";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SPAN_STATUS_LABELS } from "@/lib/constants";

function formatUnixNanoToLocale(unixNano?: string | null) {
  if (!unixNano) return "—";

  try {
    const milliseconds = Number(BigInt(unixNano) / 1000000n);
    const date = new Date(milliseconds);

    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-ES", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function Traces() {
  const { data, isLoading, error } = useTraces();

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
    return (
      <p className="text-destructive">
        Error al cargar traces: {error.message}
      </p>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No hay traces registrados.</p>;
  }

  return (
    <div className="flex flex-1 flex-col">
      {data.map((trace) => (
        <Link
          key={trace.traceId}
          to={`/traces/${trace.traceId}`}
          className="flex items-center justify-between border border-border p-4 py-2 transition-colors hover:bg-accent"
        >
          <div className="space-y-0.5 flex items-center gap-2">
            <time className="text-xs text-muted-foreground font-mono">[{formatUnixNanoToLocale(trace.startTime)}]</time>
            <p className="text-sm font-medium">
              {trace.rootSpanName ?? trace.traceId}
            </p>
            {[`${trace.serviceName}`, `${trace.spanCount} spans`].map(
              (data) => (
                <p className="flex items-center gap-1" key={data}>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{data}</span>
                </p>
              ),
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {trace.durationMs != null
                ? `${trace.durationMs.toFixed(1)}ms`
                : "—"}
            </span>
            <Badge
              variant={trace.statusCode === 2 ? "destructive" : "secondary"}
            >
              {SPAN_STATUS_LABELS[trace.statusCode ?? 0] ?? "Unknown"}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

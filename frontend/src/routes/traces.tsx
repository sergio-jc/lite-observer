import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTraces } from "@/hooks/use-traces";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SPAN_STATUS_LABELS } from "@/lib/constants";
import { TracesFilterBar, type StatusFilter } from "@/components/traces/traces-filter-bar";

const PAGE_SIZE = 25;

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
  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);

  // Debounce search input 400ms antes de disparar la query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchFilter(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isFetching, error, refetch } = useTraces({
    search: searchFilter || undefined,
    status: status || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  function handleSearchChange(value: string) {
    setSearchInput(value);
  }

  function handleStatusChange(value: StatusFilter) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="flex flex-1 flex-col">
      <TracesFilterBar
        search={searchInput}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        onRefresh={refetch}
        isRefreshing={isFetching}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
      />

      {isLoading ? (
        <div className="space-y-3 p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <p className="text-destructive p-3">
          Error al cargar traces: {error.message}
        </p>
      ) : !data?.data || data.data.length === 0 ? (
        <p className="text-muted-foreground p-3">No hay traces registrados.</p>
      ) : (
        data.data.map((trace) => (
          <Link
            key={trace.traceId}
            to={`/traces/${trace.traceId}`}
            className="flex items-center justify-between border-b border-border p-4 py-2 transition-colors hover:bg-accent"
          >
            <div className="space-y-0.5 flex items-center gap-2">
              <time className="text-xs text-muted-foreground font-mono">[{formatUnixNanoToLocale(trace.startTime)}]</time>
              <p className="text-sm font-medium">
                {trace.rootSpanName ?? trace.traceId}
              </p>
              {[`${trace.serviceName}`, `${trace.spanCount} spans`].map(
                (item) => (
                  <p className="flex items-center gap-1" key={item}>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{item}</span>
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
        ))
      )}
    </div>
  );
}

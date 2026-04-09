import { RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type StatusFilter = "" | "unset" | "ok" | "error";

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "OK", value: "ok" },
  { label: "Error", value: "error" },
  { label: "Unset", value: "unset" },
];

interface TracesFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function TracesFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onRefresh,
  isRefreshing,
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: TracesFilterBarProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-background flex-wrap">
      {/* Búsqueda por servicio */}
      <div className="relative flex-1 min-w-40 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8"
          placeholder="Search by trace name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filtro de estado */}
      <div className="flex items-center rounded-lg border border-border overflow-hidden shrink-0">
        {STATUS_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={cn(
              "px-2.5 h-8 text-xs font-medium transition-colors border-r border-border last:border-r-0",
              status === value
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Botón de recarga */}
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label="Recargar"
        className="shrink-0"
      >
        <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
      </Button>

      <div className="flex-1" />

      {/* Paginación */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground tabular-nums">
          {totalItems === 0 ? "Sin resultados" : `${start}–${end} de ${totalItems}`}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums min-w-12 text-center">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

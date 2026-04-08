import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Span } from "@/types/api";
import { SPAN_KIND_LABELS, SPAN_STATUS_LABELS } from "@/lib/constants";
import SpansInteractiveMap from "./spans-interactive-map";

function formatUnixNanoToLocale(unixNano?: string | null) {
  if (!unixNano) return "—";

  try {
    const milliseconds = Number(BigInt(unixNano) / 1000000n);
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-ES");
  } catch {
    return "—";
  }
}

function stringifyValue(value: unknown) {
  if (value == null) return "—";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function SectionJson({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown> | null | undefined;
}) {
  const isEmpty = !value || Object.keys(value).length === 0;

  return (
    <section className="space-y-1.5">
      <h4 className="text-xs font-medium uppercase text-muted-foreground">
        {title}
      </h4>
      {isEmpty ? (
        <p className="rounded-md border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
          Sin datos
        </p>
      ) : (
        <pre className="max-h-56 overflow-auto rounded-md border border-border bg-muted/30 p-2 text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </section>
  );
}

interface TraceSpansPanelProps {
  spans: Span[];
}

export function TraceSpansPanel({ spans }: TraceSpansPanelProps) {
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);

  const selectedSpan = useMemo<Span | null>(() => {
    if (spans.length === 0) return null;
    if (!selectedSpanId) return spans[0] ?? null;
    return (
      spans.find((span) => span.spanId === selectedSpanId) ?? spans[0] ?? null
    );
  }, [spans, selectedSpanId]);

  return (
    <div className="space-y-4 flex flex-1 max-h-full">
      <SpansInteractiveMap
        spans={spans}
        selectedSpan={selectedSpan}
        setSelectedSpanId={setSelectedSpanId}
      />

      {selectedSpan && (
        <aside className="shrink-0 space-y-3 border border-border bg-background p-3 lg:w-[360px] max-h-full overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">
                {selectedSpan.name}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                spanId: <span className="font-mono">{selectedSpan.spanId}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelectedSpanId(null)}
              aria-label="Cerrar panel"
            >
              Cerrar
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-border p-2">
              <p className="text-muted-foreground">Servicio</p>
              <p className="font-medium">{selectedSpan.serviceName}</p>
            </div>
            <div className="rounded-md border border-border p-2">
              <p className="text-muted-foreground">Tipo</p>
              <p className="font-medium">
                {SPAN_KIND_LABELS[selectedSpan.kind] ?? "Unknown"}
              </p>
            </div>
            <div className="rounded-md border border-border p-2">
              <p className="text-muted-foreground">Duracion</p>
              <p className="font-medium">
                {selectedSpan.durationMs.toFixed(1)}ms
              </p>
            </div>
            <div className="rounded-md border border-border p-2">
              <p className="text-muted-foreground">Estado</p>
              <p className="font-medium">
                {SPAN_STATUS_LABELS[selectedSpan.statusCode] ?? "Unknown"}
              </p>
            </div>
          </div>

          <section className="space-y-1.5">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              Tiempos
            </h4>
            <div className="rounded-md border border-border bg-muted/30 p-2 text-xs">
              <p>
                <span className="text-muted-foreground">Inicio:</span>{" "}
                {formatUnixNanoToLocale(selectedSpan.startTimeUnixNano)}
              </p>
              <p>
                <span className="text-muted-foreground">Fin:</span>{" "}
                {formatUnixNanoToLocale(selectedSpan.endTimeUnixNano)}
              </p>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              Status Message
            </h4>
            <p className="rounded-md border border-border bg-muted/30 p-2 text-xs">
              {stringifyValue(selectedSpan.statusMessage)}
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              Scope
            </h4>
            <div className="rounded-md border border-border bg-muted/30 p-2 text-xs">
              <p>
                <span className="text-muted-foreground">Nombre:</span>{" "}
                {stringifyValue(selectedSpan.scopeName)}
              </p>
              <p>
                <span className="text-muted-foreground">Version:</span>{" "}
                {stringifyValue(selectedSpan.scopeVersion)}
              </p>
            </div>
          </section>

          <SectionJson
            title="Span Attributes"
            value={selectedSpan.spanAttributes}
          />
          <SectionJson
            title="Resource Attributes"
            value={selectedSpan.resourceAttributes}
          />

          <section className="space-y-1.5">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              Events
            </h4>
            <pre className="max-h-56 overflow-auto rounded-md border border-border bg-muted/30 p-2 text-xs">
              {stringifyValue(selectedSpan.events)}
            </pre>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              Links
            </h4>
            <pre className="max-h-56 overflow-auto rounded-md border border-border bg-muted/30 p-2 text-xs">
              {stringifyValue(selectedSpan.links)}
            </pre>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              Identificadores
            </h4>
            <div className="rounded-md border border-border bg-muted/30 p-2 text-xs">
              <p className="break-all">
                <span className="text-muted-foreground">traceId:</span>{" "}
                {selectedSpan.traceId}
              </p>
              <p className="break-all">
                <span className="text-muted-foreground">parentSpanId:</span>{" "}
                {stringifyValue(selectedSpan.parentSpanId)}
              </p>
            </div>
          </section>
        </aside>
      )}
    </div>
  );
}

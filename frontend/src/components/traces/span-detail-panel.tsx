import type { Span } from "@/types/api";
import React from "react";
import { SPAN_KIND_LABELS, SPAN_STATUS_LABELS } from "@/lib/constants";

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
  const entries = value ? Object.entries(value) : [];

  return (
    <section className="text-xs">
      <h4 className="text-muted-foreground text-sm p-2">{title}</h4>
      {isEmpty ? (
        <p className="text-muted-foreground px-2 pb-2">Sin datos</p>
      ) : (
        <div className="grid grid-cols-2 border border-border divide-x divide-y divide-border">
          {entries.map(([key, rawValue]) => {
            const parsedValue =
              typeof rawValue === "string"
                ? rawValue
                : JSON.stringify(rawValue, null, 2);

            return (
              <React.Fragment key={key}>
                <div className="p-2 text-muted-foreground break-all">
                  {key}
                </div>
                <div className="p-2 break-all font-medium whitespace-pre-wrap">
                  {parsedValue}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface Props {
  span: Span;
}

const SpanDetailPanel: React.FC<Props> = ({ span }) => {
  return (
    <aside className="shrink-0 border border-border bg-background lg:w-[360px] max-h-full overflow-y-auto flex-1">
      <div className="min-w-0 p-3">
        <h3 className="truncate text-md font-semibold">{span.name}</h3>
        <p className="truncate text-xs text-muted-foreground">
          Span ID: <span className="font-mono">{span.spanId}</span>
        </p>
      </div>
      {/* <div className="flex items-start justify-between gap-2">
        <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelectedSpanId(null)}
              aria-label="Cerrar panel"
            >
              Cerrar
            </Button>
      </div> */}

      <div className="grid grid-cols-2 text-xs border border-border divide-x divide-y divide-border">
        <div className="p-2">
          <p className="text-muted-foreground">Servicio</p>
          <p className="font-medium">{span.serviceName}</p>
        </div>
        <div className="p-2">
          <p className="text-muted-foreground">Tipo</p>
          <p className="font-medium">
            {SPAN_KIND_LABELS[span.kind] ?? "Unknown"}
          </p>
        </div>
        <div className="p-2">
          <p className="text-muted-foreground">Duracion</p>
          <p className="font-medium">{span.durationMs.toFixed(1)}ms</p>
        </div>
        <div className="p-2">
          <p className="text-muted-foreground">Estado</p>
          <p className="font-medium">
            {SPAN_STATUS_LABELS[span.statusCode] ?? "Unknown"}
          </p>
        </div>
        <div className="p-2">
          <p className="text-muted-foreground">Inicio</p>
          <p className="font-medium">
            {formatUnixNanoToLocale(span.startTimeUnixNano)}
          </p>
        </div>
        <div className="p-2">
          <p className="text-muted-foreground">Finalización</p>
          <p className="font-medium">
            {formatUnixNanoToLocale(span.endTimeUnixNano)}
          </p>
        </div>
      </div>

      <section className="border-x border-b border-border p-2 text-xs space-y-1.5 first:border-t">
        <h4 className="text-sm text-muted-foreground">Status message</h4>
        <p>{stringifyValue(span.statusMessage)}</p>
      </section>

      <section className="border-x border-b border-border p-2 text-xs space-y-1.5 first:border-t">
        <h4 className="text-sm text-muted-foreground">Scope</h4>
        <div>
          <p>
            <span className="text-muted-foreground">Nombre:</span>{" "}
            {stringifyValue(span.scopeName)}
          </p>
          <p>
            <span className="text-muted-foreground">Version:</span>{" "}
            {stringifyValue(span.scopeVersion)}
          </p>
        </div>
      </section>

      <SectionJson title="Span Attributes" value={span.spanAttributes} />
      <SectionJson
        title="Resource Attributes"
        value={span.resourceAttributes}
      />

      <section className="border-x border-b border-border p-2 text-xs space-y-1.5 first:border-t">
        <h4 className="text-sm text-muted-foreground">Events</h4>
        <pre className="max-h-56 overflow-auto">
          {stringifyValue(span.events)}
        </pre>
      </section>

      <section className="border-x border-b border-border p-2 text-xs space-y-1.5 first:border-t">
        <h4 className="text-sm text-muted-foreground">Links</h4>
        <pre className="max-h-56 overflow-auto">
          {stringifyValue(span.links)}
        </pre>
      </section>

      <section className="border-x border-b border-border p-2 text-xs space-y-1.5 first:border-t">
        <h4 className="text-sm text-muted-foreground">Identificadores</h4>
        <div>
          <p className="break-all">
            <span className="text-muted-foreground">traceId:</span>{" "}
            {span.traceId}
          </p>
          <p className="break-all">
            <span className="text-muted-foreground">parentSpanId:</span>{" "}
            {stringifyValue(span.parentSpanId)}
          </p>
        </div>
      </section>
    </aside>
  );
};

export default SpanDetailPanel;

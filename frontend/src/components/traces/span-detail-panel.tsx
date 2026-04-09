import type { Span } from "@/types/api";
import React from "react";
import { SPAN_KIND_LABELS, SPAN_STATUS_LABELS } from "@/lib/constants";
import { Button } from "../ui/button";
import { Clipboard } from "lucide-react";

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

const SectionArea: React.FC<
  React.PropsWithChildren<{ title: string; isEmpty: boolean }>
> = (props) => {
  const { children, title, isEmpty } = props;
  return (
    <section className="text-xs border-border border-b">
      <h4 className="text-muted-foreground text-sm p-2 border-border border-b">
        {title}
      </h4>
      {isEmpty ? (
        <p className="text-muted-foreground opacity-50 p-2 text-center">
          Sin datos
        </p>
      ) : (
        children
      )}
    </section>
  );
};

function SectionKeyValuePairs({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown> | null | undefined;
}) {
  const isEmpty = !value || Object.keys(value).length === 0;
  const entries = value ? Object.entries(value) : [];

  return (
    <SectionArea title={title} isEmpty={isEmpty}>
      <div className="grid grid-cols-2 border border-border divide-x divide-y divide-border">
        {entries.map(([key, rawValue]) => {
          const parsedValue =
            typeof rawValue === "string"
              ? rawValue
              : JSON.stringify(rawValue, null, 2);

          return (
            <React.Fragment key={key}>
              <div className="p-2 text-muted-foreground break-all font-mono">
                {key}
              </div>
              <div className="p-2 break-all font-medium whitespace-pre-wrap">
                {parsedValue}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </SectionArea>
  );
}

interface Props {
  span: Span;
}

const SpanDetailPanel: React.FC<Props> = ({ span }) => {
  return (
    <aside className="shrink-0 border border-border bg-background lg:w-[360px] max-h-full overflow-y-auto flex-1 relative">
      <div className="min-w-0 p-3 sticky top-0 z-10 bg-background border-b border-border flex items-center justify-between max-w-full">
        <div className="flex-1 flex-col gap-1 max-w-full min-w-0" >
          <h3 className="truncate text-md font-semibold">{span.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            Span ID: <span className="font-mono">{span.spanId}</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(span, null, 2));
          }}
          aria-label="Copy Content"
        >
          <Clipboard />
          Copy Content
        </Button>
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
      <SectionArea title="Status message" isEmpty={!span.statusMessage}>
        <p>{stringifyValue(span.statusMessage)}</p>
      </SectionArea>
      <SectionKeyValuePairs
        title="Scope"
        value={{
          name: span.scopeName,
          version: span.scopeVersion,
        }}
      />
      <SectionKeyValuePairs
        title="Span Attributes"
        value={span.spanAttributes}
      />
      <SectionKeyValuePairs
        title="Resource Attributes"
        value={span.resourceAttributes}
      />
      <SectionKeyValuePairs
        title="Identificadores"
        value={{
          traceId: span.traceId,
          parentSpanId: span.parentSpanId,
          spanId: span.spanId,
        }}
      />
      <SectionArea title="Events" isEmpty={!span.events}>
        <pre className="max-h-56 overflow-auto p-2">
          {stringifyValue(span.events)}
        </pre>
      </SectionArea>

      <SectionArea title="Links" isEmpty={!span.links}>
        <pre className="max-h-56 overflow-auto p-2">
          {stringifyValue(span.links)}
        </pre>
      </SectionArea>
    </aside>
  );
};

export default SpanDetailPanel;

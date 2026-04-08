import type { Span } from "@/types/api";
import React from "react";
import { SPAN_KIND_LABELS, SPAN_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "../ui/badge";

interface Props {
  spans: Span[];
  selectedSpan: Span | null;
  setSelectedSpanId: (spanId: string) => void;
}

const SpansInteractiveMap: React.FC<Props> = ({
  spans,
  selectedSpan,
  setSelectedSpanId,
}) => {
  return (
    <div className="min-w-0 flex-2 space-y-2 p-2">
      {spans.map((span) => {
        const isSelected = selectedSpan?.spanId === span.spanId;

        return (
          <button
            key={span.spanId}
            type="button"
            onClick={() => setSelectedSpanId(span.spanId)}
            className={`w-full rounded-md border p-3 text-left transition-colors ${
              isSelected
                ? "border-primary bg-accent/70"
                : "border-border hover:bg-accent"
            }`}
            // style={{ marginLeft: span.parentSpanId ? 24 : 0 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{span.name}</p>
                <p className="text-xs text-muted-foreground">
                  {span.serviceName} &middot;{" "}
                  {SPAN_KIND_LABELS[span.kind] ?? "Unknown"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {span.durationMs.toFixed(1)}ms
                </span>
                <Badge
                  variant={span.statusCode === 2 ? "destructive" : "secondary"}
                >
                  {SPAN_STATUS_LABELS[span.statusCode] ?? "Unknown"}
                </Badge>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SpansInteractiveMap;

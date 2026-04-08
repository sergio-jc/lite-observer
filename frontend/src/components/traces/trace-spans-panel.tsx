import { useMemo, useState } from "react";
import type { Span } from "@/types/api";
import SpansInteractiveMap from "./spans-interactive-map";
import SpanDetailPanel from "./span-detail-panel";

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
    <div className="flex flex-1 max-h-full">
      <SpansInteractiveMap
        spans={spans}
        selectedSpan={selectedSpan}
        setSelectedSpanId={setSelectedSpanId}
      />
      {selectedSpan && <SpanDetailPanel span={selectedSpan} />}
    </div>
  );
}

import type { Span } from "@/types/api";
import React, { useEffect, useMemo, useState } from "react";
import {
  ERROR_PALETTE_DARK,
  ERROR_PALETTE_LIGHT,
  PALETTE_DARK,
  PALETTE_LIGHT,
} from "./constants";

interface Props {
  spans: Span[];
  selectedSpan: Span | null;
  setSelectedSpanId: (spanId: string) => void;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

interface SpanNode {
  span: Span;
  children: SpanNode[];
  depth: number;
  startNs: bigint;
  endNs: bigint;
}

function buildSpanTree(spans: Span[]): {
  flatNodes: SpanNode[];
  traceStartNs: bigint;
  traceDurationNs: bigint;
} {
  if (spans.length === 0) {
    return { flatNodes: [], traceStartNs: 0n, traceDurationNs: 1n };
  }

  const nodeMap = new Map<string, SpanNode>();
  for (const span of spans) {
    nodeMap.set(span.spanId, {
      span,
      children: [],
      depth: 0,
      startNs: BigInt(span.startTimeUnixNano),
      endNs: BigInt(span.endTimeUnixNano),
    });
  }

  const roots: SpanNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.span.parentSpanId && nodeMap.has(node.span.parentSpanId)) {
      nodeMap.get(node.span.parentSpanId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const assignDepth = (node: SpanNode, depth: number) => {
    node.depth = depth;
    node.children.sort((a, b) => (a.startNs < b.startNs ? -1 : 1));
    for (const child of node.children) assignDepth(child, depth + 1);
  };

  roots.sort((a, b) => (a.startNs < b.startNs ? -1 : 1));
  for (const root of roots) assignDepth(root, 0);

  let traceStartNs = roots[0]!.startNs;
  let traceEndNs = roots[0]!.endNs;
  for (const node of nodeMap.values()) {
    if (node.startNs < traceStartNs) traceStartNs = node.startNs;
    if (node.endNs > traceEndNs) traceEndNs = node.endNs;
  }

  const flatNodes: SpanNode[] = [];
  const traverse = (node: SpanNode) => {
    flatNodes.push(node);
    for (const child of node.children) traverse(child);
  };
  for (const root of roots) traverse(root);

  const traceDurationNs = traceEndNs - traceStartNs || 1n;
  return { flatNodes, traceStartNs, traceDurationNs };
}

function formatDuration(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

const MIN_BAR_WIDTH_PERCENT = 0.5;

const SpansInteractiveMap: React.FC<Props> = ({
  spans,
  selectedSpan,
  setSelectedSpanId,
}) => {
  const isDark = useIsDark();
  const PALETTE = isDark ? PALETTE_DARK : PALETTE_LIGHT;
  const ERROR_PALETTE = isDark ? ERROR_PALETTE_DARK : ERROR_PALETTE_LIGHT;

  const serviceColorMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const span of spans) {
      if (!map.has(span.serviceName)) {
        map.set(span.serviceName, map.size);
      }
    }
    return map;
  }, [spans]);

  const { flatNodes, traceStartNs, traceDurationNs } = useMemo(
    () => buildSpanTree(spans),
    [spans],
  );

  const totalDurationMs = Number(traceDurationNs) / 1_000_000;

  if (flatNodes.length === 0) {
    return (
      <div className="flex-2 p-4 flex items-center justify-center text-muted-foreground text-sm">
        No hay spans disponibles
      </div>
    );
  }

  return (
    <div className="flex-2 flex flex-col max-h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center border-b px-3 py-2 text-xs text-muted-foreground font-medium shrink-0">
        <div className="w-[45%] pr-3">Span</div>
        <div className="flex-1 relative">
          <div className="flex justify-between">
            <span>0ms</span>
            <span>{formatDuration(totalDurationMs / 2)}</span>
            <span>{formatDuration(totalDurationMs)}</span>
          </div>
        </div>
      </div>

      {/* Span rows */}
      <div className="flex-1 overflow-y-auto">
        {flatNodes.map(({ span, depth, startNs, endNs }) => {
          const isSelected = selectedSpan?.spanId === span.spanId;
          const isError = span.statusCode === 2;

          const colorIdx =
            (serviceColorMap.get(span.serviceName) ?? 0) % PALETTE.length;
          const palette = isError ? ERROR_PALETTE : PALETTE[colorIdx]!;

          const offsetPercent =
            Number(((startNs - traceStartNs) * 10000n) / traceDurationNs) / 100;
          const widthPercent = Math.max(
            MIN_BAR_WIDTH_PERCENT,
            Number(((endNs - startNs) * 10000n) / traceDurationNs) / 100,
          );

          const rowBg = isSelected ? palette.bgSelected : palette.bg;
          const barColor = isSelected ? palette.barSelected : palette.bar;

          return (
            <button
              key={span.spanId}
              type="button"
              onClick={() => setSelectedSpanId(span.spanId)}
              className={`flex w-full items-center px-3 py-1.5 text-left border-b border-border/40 transition-all cursor-pointer
                ${isSelected ? "outline-border outline outline-t outline-b" : ""}
                ${isDark ? "hover:bg-white/4" : "hover:brightness-95"}`}
              style={{ backgroundColor: rowBg }}
            >
              {/* Label */}
              <div
                className="w-[45%] pr-3 shrink-0 flex items-center gap-1.5 min-w-0"
                style={{ paddingLeft: `${depth * 16 + 4}px` }}
              >
                {depth > 0 && (
                  <span
                    className="shrink-0 text-xs"
                    style={{ color: palette.labelColor, opacity: 0.4 }}
                  >
                    └
                  </span>
                )}
                <div
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: barColor }}
                />
                <div className="min-w-0">
                  <p
                    className="text-xs font-medium truncate leading-tight"
                    style={{
                      color: isSelected
                        ? palette.labelSelectedColor
                        : palette.labelColor,
                    }}
                  >
                    {span.name}
                  </p>
                  <p className="text-[10px] truncate leading-tight text-muted-foreground">
                    {span.serviceName}
                  </p>
                </div>
              </div>

              {/* Timeline bar */}
              <div className="flex-1 relative h-7 flex items-center">
                {/* Background tick marks */}
                <div className="absolute inset-0 flex pointer-events-none">
                  <div className="flex-1 border-r border-border/20" />
                  <div className="flex-1 border-r border-border/20" />
                  <div className="flex-1" />
                </div>

                {/* Span bar */}
                <div
                  className="absolute h-5 rounded flex items-center px-1.5 overflow-hidden"
                  style={{
                    left: `${offsetPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: barColor,
                    border: `1.5px solid ${isSelected ? palette.barSelected : palette.border}`,
                    minWidth: "4px",
                  }}
                >
                  <span
                    className="text-[10px] font-medium truncate whitespace-nowrap"
                    style={{
                      color: isSelected
                        ? palette.durationSelectedColor
                        : palette.durationColor,
                    }}
                  >
                    {formatDuration(span.durationMs)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SpansInteractiveMap;

import type { InferInsertModel } from 'drizzle-orm';
import type { spans } from '../db/schema.js';
import {
  base64ToHex,
  extractServiceName,
  flattenAttributes,
  computeDurationMs,
} from './common.js';
import type { KeyValue, Resource } from './common.js';

type SpanRow = InferInsertModel<typeof spans>;

interface OtlpSpan {
  traceId: string;
  spanId: string;
  traceState?: string;
  parentSpanId?: string;
  name: string;
  kind?: number;
  startTimeUnixNano?: string;
  endTimeUnixNano?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
  events?: OtlpEvent[];
  droppedEventsCount?: number;
  links?: OtlpLink[];
  droppedLinksCount?: number;
  status?: { code?: number; message?: string };
}

interface OtlpEvent {
  timeUnixNano?: string;
  name?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}

interface OtlpLink {
  traceId?: string;
  spanId?: string;
  traceState?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}

interface ScopeSpans {
  scope?: { name?: string; version?: string };
  spans?: OtlpSpan[];
}

interface ResourceSpans {
  resource?: Resource;
  scopeSpans?: ScopeSpans[];
}

export function parseResourceSpans(resourceSpans: ResourceSpans[]): SpanRow[] {
  console.log("🚀 ~ parseResourceSpans ~ resourceSpans:", resourceSpans)
  const rows: SpanRow[] = [];

  for (const rs of resourceSpans) {
    const serviceName = extractServiceName(rs.resource);
    const resourceAttributes = flattenAttributes(rs.resource?.attributes);

    for (const ss of rs.scopeSpans ?? []) {
      const scopeName = ss.scope?.name ?? '';
      const scopeVersion = ss.scope?.version ?? '';

      for (const span of ss.spans ?? []) {
        rows.push({
          traceId: base64ToHex(span.traceId),
          spanId: base64ToHex(span.spanId),
          parentSpanId: span.parentSpanId
            ? base64ToHex(span.parentSpanId)
            : null,
          name: span.name,
          kind: span.kind ?? 0,
          startTimeUnixNano: span.startTimeUnixNano ?? '0',
          endTimeUnixNano: span.endTimeUnixNano ?? '0',
          durationMs: computeDurationMs(
            span.startTimeUnixNano,
            span.endTimeUnixNano,
          ),
          statusCode: span.status?.code ?? 0,
          statusMessage: span.status?.message ?? '',
          serviceName,
          resourceAttributes,
          spanAttributes: flattenAttributes(span.attributes),
          events: (span.events ?? []).map((e) => ({
            timeUnixNano: e.timeUnixNano,
            name: e.name,
            attributes: flattenAttributes(e.attributes),
          })),
          links: (span.links ?? []).map((l) => ({
            traceId: l.traceId ? base64ToHex(l.traceId) : undefined,
            spanId: l.spanId ? base64ToHex(l.spanId) : undefined,
            attributes: flattenAttributes(l.attributes),
          })),
          scopeName,
          scopeVersion,
        });
      }
    }
  }

  return rows;
}

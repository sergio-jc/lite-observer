import { z } from 'zod';

// --- Traces ---

export const traceSummarySchema = z.object({
  traceId: z.string(),
  rootSpanName: z.string().nullable(),
  serviceName: z.string().nullable(),
  startTime: z.string().nullable(),
  durationMs: z.number().nullable(),
  spanCount: z.number(),
  statusCode: z.number().nullable(),
});
export type TraceSummary = z.infer<typeof traceSummarySchema>;

export const spanSchema = z.object({
  id: z.number(),
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string().nullable(),
  name: z.string(),
  kind: z.number(),
  startTimeUnixNano: z.string(),
  endTimeUnixNano: z.string(),
  durationMs: z.number(),
  statusCode: z.number(),
  statusMessage: z.string().nullable(),
  serviceName: z.string(),
  resourceAttributes: z.record(z.string(), z.unknown()).nullable(),
  spanAttributes: z.record(z.string(), z.unknown()).nullable(),
  events: z.unknown().nullable(),
  links: z.unknown().nullable(),
  scopeName: z.string().nullable(),
  scopeVersion: z.string().nullable(),
  createdAt: z.string(),
});
export type Span = z.infer<typeof spanSchema>;

// --- Metrics ---

export const metricSummarySchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  unit: z.string().nullable(),
  lastValue: z.number().nullable(),
  lastTime: z.string().nullable(),
  serviceName: z.string().nullable(),
  dataPointCount: z.number(),
});
export type MetricSummary = z.infer<typeof metricSummarySchema>;

export const metricDataPointSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  unit: z.string().nullable(),
  type: z.string(),
  value: z.number().nullable(),
  count: z.number().nullable(),
  sum: z.number().nullable(),
  buckets: z.unknown().nullable(),
  quantiles: z.unknown().nullable(),
  timeUnixNano: z.string(),
  startTimeUnixNano: z.string().nullable(),
  serviceName: z.string(),
  resourceAttributes: z.record(z.string(), z.unknown()).nullable(),
  attributes: z.record(z.string(), z.unknown()).nullable(),
  scopeName: z.string().nullable(),
  scopeVersion: z.string().nullable(),
  createdAt: z.string(),
});
export type MetricDataPoint = z.infer<typeof metricDataPointSchema>;

// --- Logs ---

export const logEntrySchema = z.object({
  id: z.number(),
  timeUnixNano: z.string(),
  observedTimeUnixNano: z.string().nullable(),
  severityNumber: z.number(),
  severityText: z.string().nullable(),
  body: z.string().nullable(),
  traceId: z.string().nullable(),
  spanId: z.string().nullable(),
  serviceName: z.string(),
  resourceAttributes: z.record(z.string(), z.unknown()).nullable(),
  attributes: z.record(z.string(), z.unknown()).nullable(),
  scopeName: z.string().nullable(),
  scopeVersion: z.string().nullable(),
  createdAt: z.string(),
});
export type LogEntry = z.infer<typeof logEntrySchema>;

// --- Summary ---

const serviceStatsSchema = z.object({
  serviceName: z.string(),
  spanCount: z.number(),
  errorCount: z.number(),
  avgDurationMs: z.number().nullable(),
});

export const summarySchema = z.object({
  spans: z.object({
    total: z.number(),
    errorCount: z.number(),
    errorRate: z.number(),
    p95DurationMs: z.number().nullable(),
    avgDurationMs: z.number().nullable(),
  }),
  metrics: z.object({
    total: z.number(),
  }),
  logs: z.object({
    total: z.number(),
    errorCount: z.number(),
  }),
  topServices: z.array(serviceStatsSchema),
});
export type Summary = z.infer<typeof summarySchema>;

// --- Health ---

export const healthStatusSchema = z.object({
  status: z.enum(['healthy', 'degraded']),
  db: z.enum(['ok', 'error']),
  uptime: z.number(),
});
export type HealthStatus = z.infer<typeof healthStatusSchema>;

import { z } from 'zod';

export const exportTraceServiceRequestSchema = z.object({
  resourceSpans: z.array(z.any()),
});

export const exportMetricsServiceRequestSchema = z.object({
  resourceMetrics: z.array(z.any()),
});

export const exportLogsServiceRequestSchema = z.object({
  resourceLogs: z.array(z.any()),
});

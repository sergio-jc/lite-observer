import { z } from 'zod';

export const traceListQuerySchema = z.object({
  service: z.string().optional(),
  status: z.enum(['unset', 'ok', 'error']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
});

export const metricListQuerySchema = z.object({
  service: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
});

export const metricTimeSeriesQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().min(1).max(10000).default(1000),
});

export const logListQuerySchema = z.object({
  service: z.string().optional(),
  severity: z.coerce.number().optional(),
  traceId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
});

export const statusCodeMap: Record<string, number> = {
  unset: 0,
  ok: 1,
  error: 2,
};

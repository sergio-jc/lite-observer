import type { InferInsertModel } from 'drizzle-orm';
import type { metricDataPoints } from '../db/schema.js';
import {
  extractServiceName,
  flattenAttributes,
} from './common.js';
import type { KeyValue, Resource } from './common.js';

type MetricRow = InferInsertModel<typeof metricDataPoints>;

interface NumberDataPoint {
  attributes?: KeyValue[];
  startTimeUnixNano?: string;
  timeUnixNano?: string;
  asDouble?: number;
  asInt?: string | number;
}

interface HistogramDataPoint {
  attributes?: KeyValue[];
  startTimeUnixNano?: string;
  timeUnixNano?: string;
  count?: string | number;
  sum?: number;
  min?: number;
  max?: number;
  bucketCounts?: (string | number)[];
  explicitBounds?: number[];
}

interface SummaryDataPoint {
  attributes?: KeyValue[];
  startTimeUnixNano?: string;
  timeUnixNano?: string;
  count?: string | number;
  sum?: number;
  quantileValues?: { quantile?: number; value?: number }[];
}

interface OtlpMetric {
  name: string;
  description?: string;
  unit?: string;
  gauge?: { dataPoints?: NumberDataPoint[] };
  sum?: { dataPoints?: NumberDataPoint[]; isMonotonic?: boolean; aggregationTemporality?: number };
  histogram?: { dataPoints?: HistogramDataPoint[]; aggregationTemporality?: number };
  summary?: { dataPoints?: SummaryDataPoint[] };
}

interface ScopeMetrics {
  scope?: { name?: string; version?: string };
  metrics?: OtlpMetric[];
}

interface ResourceMetrics {
  resource?: Resource;
  scopeMetrics?: ScopeMetrics[];
}

export function parseResourceMetrics(resourceMetrics: ResourceMetrics[]): MetricRow[] {
  const rows: MetricRow[] = [];

  for (const rm of resourceMetrics) {
    const serviceName = extractServiceName(rm.resource);
    const resourceAttributes = flattenAttributes(rm.resource?.attributes);

    for (const sm of rm.scopeMetrics ?? []) {
      const scopeName = sm.scope?.name ?? '';
      const scopeVersion = sm.scope?.version ?? '';

      for (const metric of sm.metrics ?? []) {
        const base = {
          name: metric.name,
          description: metric.description ?? '',
          unit: metric.unit ?? '',
          serviceName,
          resourceAttributes,
          scopeName,
          scopeVersion,
        };

        if (metric.gauge?.dataPoints) {
          for (const dp of metric.gauge.dataPoints) {
            rows.push({
              ...base,
              type: 'gauge',
              value: extractNumericValue(dp),
              count: null,
              sum: null,
              buckets: null,
              quantiles: null,
              timeUnixNano: dp.timeUnixNano ?? '0',
              startTimeUnixNano: dp.startTimeUnixNano ?? '',
              attributes: flattenAttributes(dp.attributes),
            });
          }
        }

        if (metric.sum?.dataPoints) {
          for (const dp of metric.sum.dataPoints) {
            rows.push({
              ...base,
              type: 'sum',
              value: extractNumericValue(dp),
              count: null,
              sum: null,
              buckets: null,
              quantiles: null,
              timeUnixNano: dp.timeUnixNano ?? '0',
              startTimeUnixNano: dp.startTimeUnixNano ?? '',
              attributes: flattenAttributes(dp.attributes),
            });
          }
        }

        if (metric.histogram?.dataPoints) {
          for (const dp of metric.histogram.dataPoints) {
            rows.push({
              ...base,
              type: 'histogram',
              value: null,
              count: dp.count != null ? Number(dp.count) : null,
              sum: dp.sum ?? null,
              buckets: {
                explicitBounds: dp.explicitBounds ?? [],
                bucketCounts: (dp.bucketCounts ?? []).map(Number),
                min: dp.min,
                max: dp.max,
              },
              quantiles: null,
              timeUnixNano: dp.timeUnixNano ?? '0',
              startTimeUnixNano: dp.startTimeUnixNano ?? '',
              attributes: flattenAttributes(dp.attributes),
            });
          }
        }

        if (metric.summary?.dataPoints) {
          for (const dp of metric.summary.dataPoints) {
            rows.push({
              ...base,
              type: 'summary',
              value: null,
              count: dp.count != null ? Number(dp.count) : null,
              sum: dp.sum ?? null,
              buckets: null,
              quantiles: dp.quantileValues ?? [],
              timeUnixNano: dp.timeUnixNano ?? '0',
              startTimeUnixNano: dp.startTimeUnixNano ?? '',
              attributes: flattenAttributes(dp.attributes),
            });
          }
        }
      }
    }
  }

  return rows;
}

function extractNumericValue(dp: NumberDataPoint): number | null {
  if (dp.asDouble !== undefined) return dp.asDouble;
  if (dp.asInt !== undefined) return Number(dp.asInt);
  return null;
}

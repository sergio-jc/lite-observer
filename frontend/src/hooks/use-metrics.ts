import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { MetricSummary, MetricDataPoint } from '@/types/api';

interface MetricListParams {
  service?: string;
  limit?: number;
}

interface MetricTimeSeriesParams {
  from?: string;
  to?: string;
  limit?: number;
}

export function useMetrics(params: MetricListParams = {}) {
  return useQuery({
    queryKey: ['metrics', params],
    queryFn: () =>
      apiFetch<MetricSummary[]>('/api/metrics', {
        service: params.service,
        limit: params.limit,
      }),
  });
}

export function useMetricDetail(
  name: string | undefined,
  params: MetricTimeSeriesParams = {},
) {
  return useQuery({
    queryKey: ['metrics', name, params],
    queryFn: () =>
      apiFetch<MetricDataPoint[]>(`/api/metrics/${name}`, {
        from: params.from,
        to: params.to,
        limit: params.limit,
      }),
    enabled: !!name,
  });
}

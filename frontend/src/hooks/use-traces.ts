import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { TraceSummary, Span } from '@/types/api';

interface TraceListParams {
  service?: string;
  status?: 'unset' | 'ok' | 'error';
  from?: string;
  to?: string;
  limit?: number;
}

export function useTraces(params: TraceListParams = {}) {
  return useQuery({
    queryKey: ['traces', params],
    queryFn: () =>
      apiFetch<TraceSummary[]>('/api/traces', {
        service: params.service,
        status: params.status,
        from: params.from,
        to: params.to,
        limit: params.limit,
      }),
  });
}

export function useTraceDetail(traceId: string | undefined) {
  return useQuery({
    queryKey: ['traces', traceId],
    queryFn: () => apiFetch<Span[]>(`/api/traces/${traceId}`),
    enabled: !!traceId,
  });
}

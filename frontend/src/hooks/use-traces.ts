import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { TraceListResponse, Span } from '@/types/api';

interface TraceListParams {
  search?: string;
  status?: 'unset' | 'ok' | 'error';
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export function useTraces(params: TraceListParams = {}) {
  return useQuery({
    queryKey: ['traces', params],
    queryFn: () =>
      apiFetch<TraceListResponse>('/api/traces', {
        search: params.search,
        status: params.status,
        from: params.from,
        to: params.to,
        limit: params.limit,
        offset: params.offset,
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

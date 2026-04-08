import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { LogEntry } from '@/types/api';

interface LogListParams {
  service?: string;
  severity?: number;
  traceId?: string;
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
}

export function useLogs(params: LogListParams = {}) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () =>
      apiFetch<LogEntry[]>('/api/logs', {
        service: params.service,
        severity: params.severity,
        traceId: params.traceId,
        from: params.from,
        to: params.to,
        search: params.search,
        limit: params.limit,
      }),
  });
}

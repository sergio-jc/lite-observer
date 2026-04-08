import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Summary } from '@/types/api';

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: () => apiFetch<Summary>('/api/summary'),
    refetchInterval: 30_000,
  });
}

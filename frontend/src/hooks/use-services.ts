import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => apiFetch<string[]>('/api/services'),
  });
}

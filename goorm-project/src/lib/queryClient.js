import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1분간 fresh → 포커스 리패치 부담↓
      gcTime: 5 * 60_000,
      retry: (failCount, err) => (err?.status === 401 ? 0 : failCount < 2),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: { retry: 0 },
  },
})

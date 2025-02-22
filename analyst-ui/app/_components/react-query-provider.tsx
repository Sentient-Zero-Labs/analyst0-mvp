"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const threeSecondsInMs = 1000 * 3;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: threeSecondsInMs,
    },
  },
});

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

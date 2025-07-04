import "@tanstack/react-query";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  // queryCache: new QueryCache({
  // 	onError: errorHandler,
  // }),
  // mutationCache: new MutationCache({
  // 	onError: errorHandler,
  // }),

  defaultOptions: {
    queries: {
      // refetchOnReconnect: true,
      // refetchOnMount: true,
      // refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 60 * 60 * 1000, // 60 minutes
      // staleTime: 10,
    },
  },
});

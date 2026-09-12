import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../server/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
  },
});
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: (import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "") + "/api/trpc",
      transformer: superjson,
      headers() {
        const token = typeof window !== "undefined" ? localStorage.getItem("dpsi_admin_token") : null;
        const isAuth = typeof window !== "undefined" ? localStorage.getItem("dpsi_admin_auth") : null;
        const tenantId = typeof window !== "undefined" ? localStorage.getItem("dpsi_admin_tenant") : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        if (isAuth === "true" || !!token) {
          headers["x-admin-auth"] = "true";
        }
        if (tenantId) {
          headers["x-tenant-id"] = tenantId;
        }
        return headers;
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
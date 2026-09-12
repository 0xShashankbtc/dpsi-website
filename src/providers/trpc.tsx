import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider, hydrate, dehydrate } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../server/router";
import type { ReactNode } from "react";
import { seedInitialQueryData } from "@/lib/initialDataSnapshot";

export const trpc = createTRPCReact<AppRouter>();

const CACHE_STORAGE_KEY = "dpsi_query_cache_v3";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// Synchronous hydration on module load for 0ms instantaneous first paint
if (typeof window !== "undefined") {
  try {
    const rawCache = localStorage.getItem(CACHE_STORAGE_KEY);
    if (rawCache) {
      const parsed = JSON.parse(rawCache);
      hydrate(queryClient, parsed);
    }
  } catch (err) {
    console.warn("[TRPC] Hydration notice:", err);
  }

  // Pre-seed any baseline snapshot queries missing from cache for first-time visitors
  seedInitialQueryData(queryClient);

  // Background debounced persistence to localStorage
  let persistTimer: any = null;
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === "updated" && event.action?.type === "success") {
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        try {
          const dehydrated = dehydrate(queryClient, {
            shouldDehydrateQuery: (query) => {
              const qk = query.queryKey;
              const first = Array.isArray(qk[0]) ? qk[0][0] : qk[0];
              const second = Array.isArray(qk[0]) ? qk[0][1] : "";
              if (
                first === "admin" ||
                second === "verifyTc" ||
                first === "auth" ||
                typeof first !== "string"
              ) {
                return false;
              }
              return query.state.status === "success";
            },
          });
          localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(dehydrated));
        } catch {
          // Ignore quota or serialization errors
        }
      }, 1000);
    }
  });
}

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: (import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "") + "/api/trpc",
      transformer: superjson,
      headers() {
        const isAdminRoute =
          typeof window !== "undefined" &&
          (window.location.pathname.startsWith("/admin") ||
            window.location.pathname.startsWith("/login"));
        const token =
          typeof window !== "undefined" && isAdminRoute
            ? localStorage.getItem("dpsi_admin_token")
            : null;
        const isAuth =
          typeof window !== "undefined" && isAdminRoute
            ? localStorage.getItem("dpsi_admin_auth")
            : null;
        const tenantId =
          typeof window !== "undefined" ? localStorage.getItem("dpsi_admin_tenant") : null;
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
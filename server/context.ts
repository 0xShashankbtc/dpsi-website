import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  username: string;
  role: "superadmin" | "admin" | "editor";
  tenantId?: string; // e.g. "dpsi", "gd_goenka", "all"
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user: AuthUser | null;
  tenantId: string;
};

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dpsi_cms_super_secret_jwt_key_2026_dev" : "");
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("[Security] WARNING: JWT_SECRET environment variable is missing in production.");
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  let user: AuthUser | null = null;
  const rawHeaderTenant = opts.req.headers.get("x-tenant-id")?.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || "";

  // Extract JWT from Authorization header
  const authHeader = opts.req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && JWT_SECRET) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as any;
      user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        tenantId: decoded.tenantId || "dpsi",
      };
    } catch {
      // Token expired or invalid signature
    }
  }

  // Fallback: Support local development mode ONLY
  if (!user && process.env.NODE_ENV !== "production") {
    const adminHeader = opts.req.headers.get("x-admin-auth");
    if (adminHeader === "true" || process.env.ENABLE_DEV_ADMIN === "true") {
      user = {
        id: "admin-master",
        username: "Admin",
        role: "superadmin",
        tenantId: "all",
      };
    }
  }

  // Strict Tenant Resolution & IDOR Prevention
  let resolvedTenantId = "dpsi";
  if (user) {
    if (user.role === "superadmin") {
      resolvedTenantId = (rawHeaderTenant && rawHeaderTenant !== "all") ? rawHeaderTenant : (user.tenantId && user.tenantId !== "all" ? user.tenantId : "dpsi");
    } else {
      // Non-superadmin users are strictly locked to their token's tenantId
      resolvedTenantId = (user.tenantId && user.tenantId !== "all") ? user.tenantId : "dpsi";
    }
  } else {
    // Public queries can route to requested tenant or default to "dpsi"
    resolvedTenantId = rawHeaderTenant || "dpsi";
  }

  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    user,
    tenantId: resolvedTenantId,
  };
}
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

const JWT_SECRET = process.env.JWT_SECRET || "dpsi_cms_super_secret_jwt_key_2026_99x";

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  let user: AuthUser | null = null;
  let resolvedTenantId = opts.req.headers.get("x-tenant-id")?.trim().toLowerCase() || "";

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
      if (!resolvedTenantId && user.tenantId && user.tenantId !== "all") {
        resolvedTenantId = user.tenantId;
      }
    } catch {
      // Token expired or invalid signature
    }
  }

  // Fallback: Support local development mode only
  if (!user && process.env.NODE_ENV !== "production") {
    const adminHeader = opts.req.headers.get("x-admin-auth");
    if (adminHeader === "true" || process.env.ENABLE_DEV_ADMIN === "true" || !process.env.JWT_SECRET) {
      user = {
        id: "admin-master",
        username: "Admin",
        role: "superadmin",
        tenantId: "all",
      };
    }
  }

  if (!resolvedTenantId) {
    resolvedTenantId = "dpsi";
  }

  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    user,
    tenantId: resolvedTenantId,
  };
}
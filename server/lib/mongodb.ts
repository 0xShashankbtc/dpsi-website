import mongoose from "mongoose";

export type AllowedDbName = "dpsi_main" | "dpsi_gallery" | "dpsi_tc" | "dpsi_admin" | (string & {});

/**
 * Resolves the physical database name for a specific tenant and scope.
 * Default tenant ("dpsi" / "default") maps to dpsi_main, dpsi_gallery, dpsi_tc, dpsi_admin.
 * Other client tenants map to tenant_<tenantId>_<scope>.
 */
export function resolveDbName(tenantId: string, scope: "main" | "gallery" | "tc" | "admin"): string {
  if (scope === "admin") return "dpsi_admin";
  const cleanTenant = (tenantId || "dpsi").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  if (cleanTenant === "dpsi" || cleanTenant === "default" || cleanTenant === "dps_indirapuram") {
    return `dpsi_${scope}`;
  }
  return `tenant_${cleanTenant}_${scope}`;
}

interface MongoCache {
  baseConn: mongoose.Connection | null;
  basePromise: Promise<mongoose.Connection> | null;
  connections: Record<string, mongoose.Connection | null>;
}

declare global {
  var _mongoCache: MongoCache | undefined;
}

const cached: MongoCache = global._mongoCache || {
  baseConn: null,
  basePromise: null,
  connections: {},
};

if (!global._mongoCache) {
  global._mongoCache = cached;
}

export async function getDbConnection(dbName: string): Promise<mongoose.Connection> {
  const rawUri = (process.env.MONGODB_URI || "").trim().replace(/^["']|["']$/g, "");
  if (!rawUri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  // 1. Establish single shared base cluster connection
  if (!cached.basePromise || (cached.baseConn && cached.baseConn.readyState !== 1 && cached.baseConn.readyState !== 2)) {
    console.log("[MongoDB] Initializing shared cluster connection...");
    const conn = mongoose.createConnection(rawUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 0,
      tls: true,
      retryWrites: true,
      w: "majority",
    });

    conn.on("error", (err) => {
      console.error("[MongoDB] Shared connection error:", err.message);
    });

    conn.on("disconnected", () => {
      console.warn("[MongoDB] Shared connection disconnected.");
      cached.baseConn = null;
      cached.basePromise = null;
      cached.connections = {};
    });

    cached.basePromise = conn
      .asPromise()
      .then((c) => {
        console.log("[MongoDB] ✅ Shared cluster connection active!");
        cached.baseConn = c;
        return c;
      })
      .catch((err) => {
        console.error("[MongoDB] ❌ Connection failed:", err.message);
        cached.basePromise = null;
        cached.baseConn = null;
        cached.connections = {};
        throw err;
      });
  }

  const base = await cached.basePromise;
  
  // 2. Reuse sub-connection using useDb on the same socket pool (sub-30ms)
  if (!cached.connections[dbName] || cached.connections[dbName]!.readyState !== 1) {
    cached.connections[dbName] = base.useDb(dbName, { useCache: true });
  }

  return cached.connections[dbName]!;
}

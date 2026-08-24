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
  connections: Record<string, mongoose.Connection | null>;
  promises: Record<string, Promise<mongoose.Connection> | null>;
}

declare global {
  var _mongoCache: MongoCache | undefined;
}

const cached: MongoCache = global._mongoCache || {
  connections: {},
  promises: {},
};

if (!global._mongoCache) {
  global._mongoCache = cached;
}

export async function getDbConnection(dbName: string): Promise<mongoose.Connection> {
  const key = dbName;

  // 1. Return active cached connection if ready
  if (cached.connections[key] && cached.connections[key]!.readyState === 1) {
    return cached.connections[key]!;
  }

  const rawUri = (process.env.MONGODB_URI || "").trim().replace(/^["']|["']$/g, "");
  if (!rawUri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  // 2. Construct database-specific URI
  let uri = rawUri;
  if (uri.includes("?")) {
    const [base, query] = uri.split("?");
    const cleanBase = base.replace(/\/+$/, "");
    uri = `${cleanBase}/${dbName}?${query}`;
  } else {
    uri = `${uri.replace(/\/+$/, "")}/${dbName}`;
  }

  if (!cached.promises[key]) {
    console.log(`[MongoDB] Initializing connection to [${dbName}]...`);
    const conn = mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
      minPoolSize: 0,
      tls: true,
    });

    conn.on("error", (err) => {
      console.error(`MongoDB [${dbName}] error:`, err.message);
    });

    conn.on("disconnected", () => {
      console.warn(`MongoDB [${dbName}] disconnected.`);
      cached.connections[key] = null;
      cached.promises[key] = null;
    });

    cached.promises[key] = conn
      .asPromise()
      .then((c) => {
        console.log(`[MongoDB] ✅ Connected to [${dbName}]!`);
        cached.connections[key] = c;
        return c;
      })
      .catch((err) => {
        console.error(`[MongoDB] ❌ Connection failed for [${dbName}]:`, err.message);
        cached.promises[key] = null;
        cached.connections[key] = null;
        throw err;
      });
  }

  return cached.promises[key]!;
}

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

// Optimized options for rapid instant connectivity in Serverless & Node environments
const MONGO_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 1, // Keep warm socket alive to eliminate TCP/TLS handshake latency
  maxIdleTimeMS: 60000, // Keep idle sockets alive for 60s
  heartbeatFrequencyMS: 10000, // Keep-alive heartbeats to Atlas
  autoIndex: false, // Huge speed boost: skip index builds on every connection in production
  autoCreate: false, // Skip collection creation round-trips
  bufferCommands: true, // Buffer commands so queries start immediately without waiting
};

export async function getDbConnection(dbName: string): Promise<mongoose.Connection> {
  const rawUri = (process.env.MONGODB_URI || "").trim().replace(/^["']|["']$/g, "");
  if (!rawUri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  // 1. Establish single shared base cluster connection
  if (!cached.basePromise || (cached.baseConn && cached.baseConn.readyState !== 1 && cached.baseConn.readyState !== 2)) {
    const conn = mongoose.createConnection(rawUri, MONGO_OPTIONS);

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
  
  // 2. Reuse sub-connection using useDb on the same socket pool (sub-5ms)
  if (!cached.connections[dbName] || cached.connections[dbName]!.readyState !== 1) {
    cached.connections[dbName] = base.useDb(dbName, { useCache: true });
  }

  return cached.connections[dbName]!;
}

// Eager non-blocking warm-up on module evaluation so the connection is ready before the first request arrives
if (typeof process !== "undefined" && process.env.MONGODB_URI) {
  setTimeout(() => {
    getDbConnection("dpsi_main").catch(() => {});
  }, 0);
}


import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    instance = drizzle(env.databaseUrl, {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}

type InsertResultHeader = { insertId?: number };

export function getInsertId(result: unknown): number {
  if (Array.isArray(result) && result[0] && typeof result[0] === "object" && "insertId" in result[0]) {
    return Number((result[0] as InsertResultHeader).insertId ?? 0);
  }
  if (result && typeof result === "object" && "insertId" in result) {
    return Number((result as InsertResultHeader).insertId ?? 0);
  }
  return 0;
}
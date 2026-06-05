import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Canonical database type (schema-typed). Both drivers are coerced to this.
type DbType = ReturnType<typeof drizzleNeon<typeof schema>>;

// Prevent multiple instances in dev (Next.js hot-reload safe)
declare global {

  var _db: DbType | undefined;
}

/**
 * Detect whether DATABASE_URL points to Neon or a local/Docker PostgreSQL.
 */
function isNeonUrl(url: string): boolean {
  return url.includes("neon.tech") || url.includes("neon.cloud");
}

function getDb() {
  if (global._db) return global._db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Please add it to your .env.local file.");
  }

  if (isNeonUrl(connectionString)) {
    // Neon HTTP driver requires the direct endpoint (no -pooler) and does not
    // support the channel_binding TCP parameter — strip both from the URL
    const httpUrl = connectionString
      .replace("-pooler", "")
      .replace(/[?&]channel_binding=[^&]*/g, "")
      .replace(/\?$/, "");
    const sql = neon(httpUrl);
    global._db = drizzleNeon(sql, { schema });
  } else {
    // Local / Docker PostgreSQL via postgres.js — coerce to the Neon-typed shape
    const sql = postgres(connectionString, { max: 10 });
    global._db = drizzlePg(sql, { schema }) as unknown as DbType;
  }

  return global._db!;
}

// Proxy that lazily initializes on first property access
export const db = new Proxy({} as DbType, {
  get(_target, prop) {
    return getDb()[prop as keyof DbType];
  },
});

/**
 * Execute a database operation with automatic retry for Neon cold-start timeouts.
 * Use this for critical queries that must succeed:
 *   const products = await withRetry(db => db.query.products.findMany());
 */
export async function withRetry<T>(
  operation: (dbInstance: typeof db) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation(db);
    } catch (error) {
      lastError = error;

      // Only retry on network/timeout errors (Neon cold starts)
      const e = error as {
        cause?: { code?: string; message?: string; sourceError?: { cause?: { code?: string } } };
        message?: string;
      };
      const cause = e.cause;
      const isRetryable =
        cause?.code === "ETIMEDOUT" ||
        cause?.sourceError?.cause?.code === "ETIMEDOUT" ||
        e.message?.includes("fetch failed") ||
        cause?.message?.includes("fetch failed");

      if (!isRetryable || attempt === maxRetries - 1) throw error;

      const delay = 500 * Math.pow(2, attempt); // 500ms, 1s, 2s
      console.warn(`[db] Query timeout (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

export type DB = ReturnType<typeof getDb>;

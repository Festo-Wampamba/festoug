import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Prevent multiple instances in dev (Next.js hot-reload safe)
declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> | undefined;
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
    global._db = drizzleNeon(sql, { schema }) as any;
  } else {
    // Local / Docker PostgreSQL via postgres.js
    const sql = postgres(connectionString, { max: 10 });
    global._db = drizzlePg(sql, { schema }) as any;
  }

  return global._db!;
}

// Proxy that lazily initializes on first property access
export const db = new Proxy({} as ReturnType<typeof drizzleNeon<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
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
    } catch (error: any) {
      lastError = error;

      // Only retry on network/timeout errors (Neon cold starts)
      const cause = error?.cause;
      const isRetryable =
        cause?.code === "ETIMEDOUT" ||
        cause?.sourceError?.cause?.code === "ETIMEDOUT" ||
        error?.message?.includes("fetch failed") ||
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

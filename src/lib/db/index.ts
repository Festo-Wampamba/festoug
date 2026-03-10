import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Prevent multiple instances in dev (Next.js hot-reload safe)
declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof drizzle> | undefined;
}

function getDb() {
  if (global._db) return global._db;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Please add it to your .env.local file."
    );
  }

  // Neon HTTP connection reliably supports serverless without socket exhaustion.
  // We must strip "-pooler" from the URL, as the HTTP API requires the direct endpoint.
  const httpConnectionString = connectionString.replace("-pooler", "");
  const sql = neon(httpConnectionString);
  global._db = drizzle(sql, { schema });
  
  return global._db;
}

// Proxy that lazily initializes on first property access
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

export type DB = ReturnType<typeof getDb>;

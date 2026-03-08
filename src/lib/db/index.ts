import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prevent multiple instances in dev (Next.js hot-reload safe)
declare global {
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined;
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

  let pgClient: ReturnType<typeof postgres>;

  if (process.env.NODE_ENV === "production") {
    pgClient = postgres(connectionString, { max: 10 });
  } else {
    if (!global._pgClient) {
      global._pgClient = postgres(connectionString, { max: 5 });
    }
    pgClient = global._pgClient;
  }

  global._db = drizzle(pgClient, { schema });
  return global._db;
}

// Proxy that lazily initializes on first property access
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

export type DB = ReturnType<typeof getDb>;

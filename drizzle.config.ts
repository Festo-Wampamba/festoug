import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local so drizzle-kit CLI commands can access DATABASE_URL
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});

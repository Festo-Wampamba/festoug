import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";

/**
 * Fixed-window rate limiter stored in Postgres (the same `rateLimit` table Better
 * Auth uses), so counts are shared across every server instance and survive
 * restarts. One atomic upsert per call — works on the neon-http driver.
 * Keys are prefixed "app:" so they never collide with Better Auth's rows.
 */
export async function rateLimit(
  identifier: string,
  options: { limit: number; windowSeconds: number }
): Promise<{ success: boolean }> {
  const key = `app:${identifier}`;
  const now = Date.now();
  const windowStart = now - options.windowSeconds * 1000;

  try {
    const [row] = await db
      .insert(rateLimits)
      .values({ id: key, key, count: 1, lastRequest: now })
      .onConflictDoUpdate({
        target: rateLimits.id,
        set: {
          // lastRequest holds the start of the current window.
          count: sql`case when ${rateLimits.lastRequest} < ${windowStart} then 1 else ${rateLimits.count} + 1 end`,
          lastRequest: sql`case when ${rateLimits.lastRequest} < ${windowStart} then ${now} else ${rateLimits.lastRequest} end`,
        },
      })
      .returning({ count: rateLimits.count });
    return { success: (row?.count ?? 1) <= options.limit };
  } catch (error) {
    // Fail closed: these guard paid APIs and outbound email.
    console.error("[rate-limit] database check failed:", error instanceof Error ? error.message : String(error));
    return { success: false };
  }
}

/**
 * Client IP for rate-limit keys. Trusted only because Vercel overwrites
 * x-real-ip / x-forwarded-for with the real client address. If this app is
 * moved behind another proxy (e.g. nginx), that proxy must overwrite both
 * headers itself, or clients can pick their own key.
 */
export function getClientIp(source: Request | Headers): string {
  const headers = source instanceof Headers ? source : source.headers;
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

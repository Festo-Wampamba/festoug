/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach per IP address.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(identifier, {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    });
    return { success: true, remaining: options.limit - 1, resetAt: now + options.windowSeconds * 1000 };
  }

  if (entry.count >= options.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: options.limit - entry.count, resetAt: entry.resetAt };
}

/** Extract client IP from request headers */
export function getClientIp(req: Request & { ip?: string }): string {
  // If running in an environment where req.ip is populated (e.g. Next.js Edge/Middleware)
  if (req.ip) return req.ip;
  // Fallback to proxy headers. Prioritize x-real-ip as it's typically set by the immediate proxy (e.g. Nginx, Vercel).
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Fallback to x-forwarded-for, but be aware it can be spoofed if not stripped by the proxy.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * proxy.ts — Next.js 16 Auth Guard (replaces middleware.ts)
 *
 * Purpose: Optimistic, lightweight checks only.
 * - Reads the session cookie to decide on redirects.
 * - Does NOT do heavy DB lookups here (role-check is done in DAL / Server Actions).
 */
export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth; // session from the JWT cookie (no DB hit)
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  // ── Redirect auth pages when already signed in ──────────────────────────
  if (isLoggedIn && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ── Protect customer dashboard ───────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // ── Protect admin routes (optimistic role hint from JWT) ─────────────────
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    if (role !== "ADMIN") {
      // Redirect non-admins to a 403 / home page
      return NextResponse.redirect(new URL("/?error=forbidden", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
};

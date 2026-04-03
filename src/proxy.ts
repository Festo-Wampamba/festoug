import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * proxy.ts — Next.js 16 Auth Guard (replaces middleware.ts)
 *
 * Purpose: Optimistic, lightweight checks only.
 * - Reads the session cookie to decide on redirects.
 * - Does NOT do heavy DB lookups here (role-check is done in DAL / Server Actions).
 * - Enforces account status: BANNED users are force-signed-out, SUSPENDED users
 *   are allowed read-only access (write-blocking is handled at API/page level).
 */
export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth; // session from the JWT cookie (no DB hit)
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const accountStatus = session?.user?.accountStatus;

  // ── Force banned users out of all protected routes ──────────────────────
  if (isLoggedIn && accountStatus === "BANNED") {
    // If they try to access any protected route, redirect to a banned page
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/trial") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/admin") ||
      pathname.startsWith("/api/checkout")
    ) {
      return NextResponse.redirect(new URL("/banned", req.url));
    }
  }

  // ── Redirect auth pages when already signed in ──────────────────────────
  if (isLoggedIn && pathname.startsWith("/auth")) {
    const dest = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // ── Protect customer dashboard ───────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    // Admins should use /admin instead
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // ── Protect trial routes ─────────────────────────────────────────────────
  if (pathname.startsWith("/trial")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    // Admins should use /admin instead
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
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

  // ── Block SUSPENDED users from mutating API routes ──────────────────────
  if (isLoggedIn && accountStatus === "SUSPENDED") {
    const method = req.method.toUpperCase();
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const isApiRoute = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth");

    if (isMutation && isApiRoute) {
      return NextResponse.json(
        { error: "Your account is temporarily suspended. You can only view content." },
        { status: 403 }
      );
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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/better-auth";

/**
 * Auth gate (Better Auth) — Next 16 proxy convention.
 *
 * Email/password users cannot obtain a session until verified
 * (requireEmailVerification), so an unverified user simply has no session here.
 * OAuth users are pre-verified by the provider.
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = await auth.api.getSession({ headers: req.headers });
  const user = session?.user as
    | {
        role?: "ADMIN" | "CUSTOMER";
        accountStatus?: "ACTIVE" | "SUSPENDED" | "BANNED";
        email?: string;
        emailVerified?: boolean;
      }
    | undefined;

  const isLoggedIn = !!user;
  const role = user?.role;
  const accountStatus = user?.accountStatus;
  const emailVerified = !!user?.emailVerified;

  const method = req.method.toUpperCase();
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isApiRoute = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth");

  // ── Banned users: blocked everywhere ────────────────────────────────────
  if (isLoggedIn && accountStatus === "BANNED") {
    if (isMutation && isApiRoute) {
      return NextResponse.json(
        { error: "Your account has been permanently suspended." },
        { status: 403 }
      );
    }
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

  // ── Suspended users: read-only (block API writes) ───────────────────────
  if (isLoggedIn && accountStatus === "SUSPENDED" && isMutation && isApiRoute) {
    return NextResponse.json(
      { error: "Your account is temporarily suspended. You can only view content." },
      { status: 403 }
    );
  }

  // ── Unverified users: confined to email verification until verified ──────
  // OAuth users receive a live session even when unverified (we force
  // emailVerified=false on signup), so the gate must live here rather than
  // relying on the absence of a session like email/password users do.
  if (isLoggedIn && !emailVerified) {
    if (pathname.startsWith("/auth/verify-email")) return NextResponse.next();
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/trial") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth")
    ) {
      const verifyUrl = new URL("/auth/verify-email", req.url);
      if (user?.email) verifyUrl.searchParams.set("email", user.email);
      return NextResponse.redirect(verifyUrl);
    }
  }

  // ── Already signed in → bounce away from auth pages ─────────────────────
  if (isLoggedIn && pathname.startsWith("/auth")) {
    const dest = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // ── Customer dashboard / trial ──────────────────────────────────────────
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/trial")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // ── Admin routes ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/?error=forbidden", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Proxy always runs on the Node.js runtime (required for auth.api.getSession).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};

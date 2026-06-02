"use client";

// Better Auth uses cookie-based sessions and a self-contained client store, so
// no React context provider is required (unlike NextAuth's SessionProvider).
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

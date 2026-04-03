"use client";

import { SessionProvider } from "next-auth/react";

// ── Tab-session isolation ─────────────────────────────────────────────────────
// Next-Auth broadcasts sign-in/sign-out events via localStorage["nextauth.message"].
// Browsers fire "storage" events only for localStorage writes from OTHER tabs,
// so every open tab instantly picks up the new session — causing cross-tab bleed.
//
// Fix: redirect that specific key to sessionStorage, which is per-tab and never
// triggers cross-tab "storage" events. Each tab keeps its own session state.
if (typeof window !== "undefined") {
  const KEY = "nextauth.message";
  const _set = localStorage.setItem.bind(localStorage);
  const _get = localStorage.getItem.bind(localStorage);
  const _del = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = (k: string, v: string) =>
    k === KEY ? sessionStorage.setItem(k, v) : _set(k, v);
  localStorage.getItem = (k: string) =>
    k === KEY ? sessionStorage.getItem(k) : _get(k);
  localStorage.removeItem = (k: string) =>
    k === KEY ? sessionStorage.removeItem(k) : _del(k);

  // Belt-and-suspenders: swallow any residual cross-tab nextauth.message events
  window.addEventListener(
    "storage",
    (e) => { if (e.key === KEY) e.stopImmediatePropagation(); },
    true
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}

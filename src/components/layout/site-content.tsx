"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function SiteContent({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    // The phone dock has a separate scrolling viewport. Start new routes at
    // their top rather than retaining the previous page's scroll position.
    viewportRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return <div ref={viewportRef} className="site-content">{children}</div>;
}

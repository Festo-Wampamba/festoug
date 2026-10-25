"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // The bootstrap script resolves the saved preference before hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* Theme still works if storage is unavailable. */ }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
      className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground active:bg-secondary"
    >
      {dark ? <SunIcon className="size-[18px]" aria-hidden /> : <MoonIcon className="size-[18px]" aria-hidden />}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
      className="w-full h-full flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-light-gray-70 hover:text-white-2"
    >
      {dark ? <Sun className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" strokeWidth={1.8} /> : <Moon className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" strokeWidth={1.8} />}
    </button>
  );
}

"use client";

import { useState } from "react";

interface Props {
  onChange: (cycle: "MONTHLY" | "ANNUAL") => void;
  defaultCycle?: "MONTHLY" | "ANNUAL";
}

export function BillingToggle({ onChange, defaultCycle = "ANNUAL" }: Props) {
  const [cycle, setCycle] = useState<"MONTHLY" | "ANNUAL">(defaultCycle);

  function toggle() {
    const next = cycle === "MONTHLY" ? "ANNUAL" : "MONTHLY";
    setCycle(next);
    onChange(next);
  }

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <span className={`text-sm ${cycle === "MONTHLY" ? "text-white-2 font-semibold" : "text-light-gray-70"}`}>
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={cycle === "ANNUAL"}
        onClick={toggle}
        className="relative w-12 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        style={{ background: cycle === "ANNUAL" ? "#10b981" : "#334155" }}
      >
        <span
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
          style={{ left: cycle === "ANNUAL" ? "calc(100% - 1.25rem)" : "0.25rem" }}
        />
      </button>
      <span className={`text-sm ${cycle === "ANNUAL" ? "text-white-2 font-semibold" : "text-light-gray-70"}`}>
        Annual
      </span>
      {cycle === "ANNUAL" && (
        <span className="text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
          Save 17%
        </span>
      )}
    </div>
  );
}

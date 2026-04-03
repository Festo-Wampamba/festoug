"use client";

import { useState } from "react";

interface Props {
  id: string;
  currentStatus: string;
}

const STATUSES = ["NEW", "REVIEWED", "CLOSED"];

export function UpdateInquiryStatus({ id, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function update(next: string) {
    if (next === status) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setStatus(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          disabled={saving || s === status}
          onClick={() => update(s)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            s === status
              ? s === "NEW" ? "bg-orange-400/10 text-orange-400 border-orange-400/20 cursor-default"
              : s === "REVIEWED" ? "bg-blue-500/10 text-blue-400 border-blue-500/20 cursor-default"
              : "bg-jet text-light-gray-70 border-jet cursor-default"
              : "border-jet text-light-gray-70 hover:bg-jet hover:text-white-2"
          }`}
        >
          {s === status ? `✓ ${s}` : `Mark ${s}`}
        </button>
      ))}
    </div>
  );
}

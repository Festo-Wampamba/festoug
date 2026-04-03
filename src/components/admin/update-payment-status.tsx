"use client";

import { useState } from "react";
import { DollarSign, Loader2 } from "lucide-react";

interface Props {
  id: string;
  currentPaymentStatus: string;
  currentPaymentNote?: string | null;
}

const PAYMENT_STATUSES = [
  { value: "PENDING",          label: "Pending",          color: "border-jet text-light-gray-70 hover:bg-jet hover:text-white-2" },
  { value: "DEPOSIT_RECEIVED", label: "Deposit Received", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { value: "PAID_IN_FULL",     label: "Paid in Full",     color: "bg-green-500/10 text-green-400 border-green-500/20" },
] as const;

export function UpdatePaymentStatus({ id, currentPaymentStatus, currentPaymentNote }: Props) {
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [note, setNote] = useState(currentPaymentNote ?? "");
  const [saving, setSaving] = useState(false);
  const [showNote, setShowNote] = useState(false);

  async function update(next: string) {
    if (next === paymentStatus) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: next, paymentNote: note || null }),
      });
      setPaymentStatus(next);
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    setSaving(true);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus, paymentNote: note || null }),
      });
      setShowNote(false);
    } finally {
      setSaving(false);
    }
  }

  const current = PAYMENT_STATUSES.find((s) => s.value === paymentStatus);

  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <div className="flex items-center gap-1.5 mb-0.5">
        <DollarSign className="w-3 h-3 text-light-gray-70" />
        <span className="text-[10px] text-light-gray-70 uppercase tracking-wider">Payment</span>
      </div>

      {PAYMENT_STATUSES.map((s) => (
        <button
          key={s.value}
          type="button"
          disabled={saving || s.value === paymentStatus}
          onClick={() => update(s.value)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            s.value === paymentStatus
              ? `${s.color} cursor-default`
              : "border-jet text-light-gray-70 hover:bg-jet hover:text-white-2"
          }`}
        >
          {saving && s.value !== paymentStatus ? (
            <Loader2 className="w-3 h-3 animate-spin inline" />
          ) : s.value === paymentStatus ? (
            `✓ ${s.label}`
          ) : (
            `Mark ${s.label}`
          )}
        </button>
      ))}

      {/* Note toggle */}
      <button
        type="button"
        onClick={() => setShowNote((v) => !v)}
        className="text-[10px] text-light-gray-70 hover:text-white-2 text-left mt-0.5 transition-colors"
      >
        {note ? "Edit note ↓" : "+ Add note"}
      </button>

      {showNote && (
        <div className="flex flex-col gap-1 mt-0.5">
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Received $500 via MTN Mobile Money"
            className="text-xs bg-eerie-black-2 border border-jet text-white-2 rounded-lg px-2.5 py-2 resize-none placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola/50"
          />
          <button
            type="button"
            disabled={saving}
            onClick={saveNote}
            className="text-xs bg-jet text-orange-yellow-crayola px-3 py-1.5 rounded-lg border border-jet hover:bg-jet/70 transition-colors font-medium"
          >
            {saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      )}
    </div>
  );
}

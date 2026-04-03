"use client";

import { useState, useEffect } from "react";
import { DollarSign, Plus, Loader2, Clock } from "lucide-react";

interface PaymentLog {
  id: string;
  eventType: string;
  amount?: string | null;
  note: string;
  createdAt: string;
}

interface Props {
  id: string;
  currentPaymentStatus: string;
  currentPaymentNote?: string | null;
}

const PAYMENT_STATUSES = [
  { value: "PENDING",          label: "Pending",          active: "bg-jet text-light-gray-70 border-jet" },
  { value: "DEPOSIT_RECEIVED", label: "Deposit Received", active: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { value: "PAID_IN_FULL",     label: "Paid in Full",     active: "bg-green-500/10 text-green-400 border-green-500/20" },
] as const;

const EVENT_COLORS: Record<string, string> = {
  DEPOSIT:       "text-yellow-400",
  FULL_PAYMENT:  "text-green-400",
  NOTE:          "text-blue-400",
  STATUS_CHANGE: "text-light-gray-70",
};

export function InquiryPaymentPanel({ id, currentPaymentStatus, currentPaymentNote }: Props) {
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newEvent, setNewEvent] = useState("NOTE");
  const [saving, setSaving] = useState(false);

  async function loadLogs() {
    if (logsLoaded) return;
    const res = await fetch(`/api/admin/inquiries/${id}/logs`);
    const data = await res.json();
    setLogs(data);
    setLogsLoaded(true);
  }

  async function updatePaymentStatus(next: string) {
    if (next === paymentStatus) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: next }),
      });
      // Auto-log the status change
      await fetch(`/api/admin/inquiries/${id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: next === "DEPOSIT_RECEIVED" ? "DEPOSIT" : next === "PAID_IN_FULL" ? "FULL_PAYMENT" : "STATUS_CHANGE",
          note: `Payment status changed to ${next.replace("_", " ")}`,
        }),
      });
      setPaymentStatus(next);
      setLogsLoaded(false); // refresh logs next open
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: newEvent, amount: newAmount.trim() || null, note: newNote.trim() }),
      });
      const log = await res.json();
      setLogs((prev) => [...prev, log]);
      setLogsLoaded(true);
      setNewNote("");
      setNewAmount("");
      setShowAddNote(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[170px]">
      <div className="flex items-center gap-1.5 mb-0.5">
        <DollarSign className="w-3 h-3 text-light-gray-70" />
        <span className="text-[10px] text-light-gray-70 uppercase tracking-wider">Payment</span>
      </div>

      {PAYMENT_STATUSES.map((s) => (
        <button
          key={s.value}
          type="button"
          disabled={saving || s.value === paymentStatus}
          onClick={() => updatePaymentStatus(s.value)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            s.value === paymentStatus
              ? `${s.active} cursor-default`
              : "border-jet text-light-gray-70 hover:bg-jet hover:text-white-2"
          }`}
        >
          {s.value === paymentStatus ? `✓ ${s.label}` : `Mark ${s.label}`}
        </button>
      ))}

      {/* Add note */}
      <button
        type="button"
        onClick={() => setShowAddNote((v) => !v)}
        className="flex items-center gap-1 text-[10px] text-light-gray-70 hover:text-white-2 transition-colors mt-0.5"
      >
        <Plus className="w-3 h-3" /> Add note
      </button>

      {showAddNote && (
        <div className="flex flex-col gap-1.5 mt-1 p-2.5 bg-jet/30 rounded-xl border border-jet">
          <select
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            className="text-xs bg-eerie-black-2 border border-jet text-white-2 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="NOTE">Note</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="FULL_PAYMENT">Full Payment</option>
            <option value="STATUS_CHANGE">Status Change</option>
          </select>
          <input
            type="text"
            placeholder="Amount (optional, e.g. $500)"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="text-xs bg-eerie-black-2 border border-jet text-white-2 rounded-lg px-2.5 py-1.5 placeholder:text-light-gray-70 focus:outline-none"
          />
          <textarea
            rows={2}
            placeholder="Note *"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="text-xs bg-eerie-black-2 border border-jet text-white-2 rounded-lg px-2.5 py-1.5 resize-none placeholder:text-light-gray-70 focus:outline-none"
          />
          <button
            type="button"
            disabled={saving || !newNote.trim()}
            onClick={addNote}
            className="text-xs bg-orange-yellow-crayola text-smoky-black px-3 py-1.5 rounded-lg font-medium hover:bg-orange-yellow-crayola/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Save"}
          </button>
        </div>
      )}

      {/* History toggle */}
      <button
        type="button"
        onClick={() => { setShowLogs((v) => !v); if (!logsLoaded) loadLogs(); }}
        className="flex items-center gap-1 text-[10px] text-light-gray-70 hover:text-white-2 transition-colors"
      >
        <Clock className="w-3 h-3" /> {showLogs ? "Hide" : "View"} history
      </button>

      {showLogs && (
        <div className="mt-1 space-y-1.5 max-h-48 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-[10px] text-light-gray-70 italic">No history yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="text-[10px] bg-jet/30 rounded-lg px-2.5 py-2 border border-jet">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`font-semibold ${EVENT_COLORS[log.eventType] ?? "text-light-gray"}`}>
                    {log.eventType.replace("_", " ")}
                    {log.amount && <span className="ml-1 text-white-2">· {log.amount}</span>}
                  </span>
                  <span className="text-light-gray-70 shrink-0">
                    {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-light-gray leading-relaxed">{log.note}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

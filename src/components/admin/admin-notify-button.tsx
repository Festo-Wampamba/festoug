"use client";

import { useState } from "react";
import { Bell, Loader2, X, Send } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
  defaultType?: string;
  defaultLink?: string;
}

const TYPES = [
  { value: "INFO",     label: "Info",     color: "text-blue-400" },
  { value: "WARNING",  label: "Warning",  color: "text-yellow-400" },
  { value: "PAYMENT",  label: "Payment",  color: "text-green-400" },
  { value: "ACCOUNT",  label: "Account",  color: "text-red-400" },
];

export function AdminNotifyButton({ userId, userName, defaultType = "INFO", defaultLink }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState(defaultType);
  const [link, setLink] = useState(defaultLink ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title: title.trim(), message: message.trim(), type, link: link.trim() || null }),
      });
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setTitle(""); setMessage(""); }, 1200);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
        title={`Notify ${userName}`}
      >
        <Bell className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white-2 font-semibold">Send Notification</h3>
                <p className="text-light-gray-70 text-xs mt-0.5">To: {userName}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-light-gray-70 hover:text-white-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Type */}
              <div className="flex gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-colors ${
                      type === t.value ? `bg-jet border-jet ${t.color}` : "border-jet text-light-gray-70 hover:bg-jet/60"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-yellow-crayola/50 placeholder:text-light-gray-70"
              />
              <textarea
                rows={3}
                placeholder="Message *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-orange-yellow-crayola/50 placeholder:text-light-gray-70"
              />
              <input
                type="text"
                placeholder="Link (optional) e.g. /dashboard/subscription"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-yellow-crayola/50 placeholder:text-light-gray-70"
              />

              <button
                type="button"
                disabled={sending || sent || !title.trim() || !message.trim()}
                onClick={send}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  sent
                    ? "bg-green-500/20 text-green-400 border border-green-500/20"
                    : "bg-orange-yellow-crayola text-smoky-black hover:bg-orange-yellow-crayola/90 disabled:opacity-50"
                }`}
              >
                {sent ? "✓ Sent!" : sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Notification</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

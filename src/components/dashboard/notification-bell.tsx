"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, ExternalLink, CheckCheck } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  INFO:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  WARNING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PAYMENT: "bg-green-500/10 text-green-400 border-green-500/20",
  ACCOUNT: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setNotifications(data));
  }, []);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-jet/60 text-light-gray hover:text-white-2 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-yellow-crayola text-smoky-black text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-eerie-black-1 border border-jet rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-jet">
            <span className="text-white-2 font-semibold text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[10px] text-light-gray-70 hover:text-orange-yellow-crayola transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="text-light-gray-70 hover:text-white-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-jet">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-6 h-6 text-light-gray-70 mx-auto mb-2" />
                <p className="text-light-gray-70 text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 transition-colors cursor-pointer hover:bg-jet/30 ${!n.read ? "bg-jet/20" : ""}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${TYPE_COLORS[n.type] ?? TYPE_COLORS.INFO}`}>
                      {n.type}
                    </span>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-orange-yellow-crayola mt-1 shrink-0" />}
                  </div>
                  <p className="text-white-2 text-xs font-medium leading-snug">{n.title}</p>
                  <p className="text-light-gray-70 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-light-gray-70 text-[10px]">
                      {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {n.link && (
                      <Link href={n.link} className="text-orange-yellow-crayola text-[10px] flex items-center gap-0.5 hover:underline">
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteAccountButton() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/me", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete My Account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-eerie-black-1 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white-2 font-bold text-lg">Delete Account</h3>
                <p className="text-light-gray-70 text-xs">This action is permanent and cannot be undone</p>
              </div>
            </div>

            <p className="text-light-gray text-sm leading-relaxed">
              Deleting your account will permanently remove your profile, licenses, reviews,
              subscriptions, and all associated data. Your purchase history will be anonymised
              but retained for financial records.
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-light-gray">
                Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-light-gray-70 font-mono"
              />
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setInput(""); }}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-jet text-white-2 text-sm font-medium hover:bg-jet/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={input !== "DELETE" || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {loading ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

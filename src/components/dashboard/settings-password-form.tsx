"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { changePasswordSchema } from "@/lib/validations";

export function SettingsPasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const values = {
      currentPassword: fd.get("currentPassword") as string,
      newPassword: fd.get("newPassword") as string,
      confirmPassword: fd.get("confirmPassword") as string,
    };

    // Client-side Zod validation
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        return;
      }
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasPassword) {
    return (
      <div className="max-w-md p-4 bg-jet/30 border border-jet rounded-xl">
        <p className="text-light-gray-70 text-sm">
          Your account uses social sign-in (GitHub or Google). To set a password,{" "}
          <a href="/auth/forgot-password" className="text-orange-yellow-crayola hover:underline">
            use Forgot Password
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 max-w-md">
      {/* Current Password */}
      <div>
        <label className="block text-sm font-medium text-light-gray mb-2">Current Password</label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            name="currentPassword"
            required
            autoComplete="current-password"
            className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-light-gray-70 hover:text-white-2 transition-colors"
            aria-label={showCurrent ? "Hide current password" : "Show current password"}
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-light-gray mb-2">New Password</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            name="newPassword"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
            placeholder="Min. 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowNew((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-light-gray-70 hover:text-white-2 transition-colors"
            aria-label={showNew ? "Hide new password" : "Show new password"}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-light-gray mb-2">Confirm New Password</label>
        <input
          type={showNew ? "text" : "password"}
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
          placeholder="Re-enter new password"
        />
      </div>

      {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
      {success && <p role="status" className="text-green-400 text-sm">Password updated successfully.</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-yellow-crayola/90 transition-colors disabled:opacity-50 w-fit"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {loading ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}

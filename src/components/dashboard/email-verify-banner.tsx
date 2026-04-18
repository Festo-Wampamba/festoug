"use client";

import { useState, useEffect } from "react";
import { Mail, X, Loader2, CheckCircle } from "lucide-react";

const DISMISS_KEY = "email-verify-dismissed";

export function EmailVerifyBanner({ email }: { email: string }) {
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only show after hydration to avoid SSR mismatch
    if (!sessionStorage.getItem(DISMISS_KEY)) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const handleResend = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Failed to send. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
      <Mail className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-yellow-300 text-sm font-medium">Verify your email address</p>
        <p className="text-yellow-400/70 text-xs mt-0.5">
          We sent a verification link to <span className="font-medium text-yellow-300">{email}</span>.
          Check your inbox to verify your account.
        </p>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        {sent && (
          <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Verification email sent!
          </p>
        )}
        {!sent && (
          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="text-yellow-400 text-xs underline mt-1 hover:text-yellow-300 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {sending && <Loader2 className="w-3 h-3 animate-spin" />}
            {sending ? "Sending…" : "Resend verification email"}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="text-yellow-400/50 hover:text-yellow-400 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

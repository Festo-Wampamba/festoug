"use client";

import { useState, useSyncExternalStore } from "react";
import { Mail, X, Loader2, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const DISMISS_KEY = "email-verify-dismissed";

const subscribeNever = () => () => {};

export function EmailVerifyBanner({ email }: { email: string }) {
  // False on the server and during hydration, so there is no SSR mismatch.
  const notDismissedBefore = useSyncExternalStore(subscribeNever, () => !sessionStorage.getItem(DISMISS_KEY), () => false);
  const [dismissed, setDismissed] = useState(false);
  const visible = notDismissedBefore && !dismissed;
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const handleResend = async () => {
    setSending(true);
    setError(null);
    try {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      if (sendError) {
        setError(sendError.message || "Failed to send. Please try again.");
      } else {
        setSent(true);
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

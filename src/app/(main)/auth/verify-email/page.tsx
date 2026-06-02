"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, MailCheck } from "lucide-react";

function VerifyEmailContent() {
  const { update } = useSession();
  const params = useSearchParams();
  const token = params.get("token");
  // "gate" = user landed here without a token (redirected by the verification
  // gate). "loading" = a token is present and being verified.
  const [status, setStatus] = useState<"loading" | "success" | "error" | "gate">(
    token ? "loading" : "gate"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resend, setResend] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return; // gate state — nothing to verify
    let timeoutId: ReturnType<typeof setTimeout>;

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          // Force the JWT to refresh now so the proxy gate sees emailVerified=true
          // immediately (otherwise it bounces back here until the 30s TTL lapses).
          await update();
          // Full reload so the refreshed session cookie is applied.
          timeoutId = setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        } else {
          const data = await res.json();
          setStatus("error");
          setErrorMsg(data.error || "Verification failed. Please request a new link.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("An unexpected error occurred. Please try again.");
      });

    return () => clearTimeout(timeoutId);
  }, [token, update]);

  async function handleResend() {
    setResend("sending");
    setResendMsg(null);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResend("sent");
        setResendMsg("Verification email sent. Check your inbox (and spam folder).");
      } else {
        setResend("error");
        setResendMsg(data.error || "Could not send the email. Please try again shortly.");
      }
    } catch {
      setResend("error");
      setResendMsg("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-cm-ocean animate-spin mx-auto mb-4" />
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Verifying your email…</h1>
              <p className="text-cm-muted text-sm">Just a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Email verified!</h1>
              <p className="text-cm-muted text-sm">Redirecting you to your dashboard…</p>
            </>
          )}

          {status === "gate" && (
            <>
              <MailCheck className="w-12 h-12 text-cm-ocean mx-auto mb-4" />
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Verify your email</h1>
              <p className="text-cm-muted text-sm mb-6">
                Your account is almost ready. We sent a verification link to your email —
                click it to unlock your dashboard and all features.
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={resend === "sending" || resend === "sent"}
                className="w-full bg-cm-ocean text-cm-bg font-semibold text-sm py-2.5 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {resend === "sending"
                  ? "Sending…"
                  : resend === "sent"
                  ? "Email sent"
                  : "Resend verification email"}
              </button>

              {resendMsg && (
                <p
                  className={`text-sm mt-4 ${
                    resend === "error" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {resendMsg}
                </p>
              )}

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-cm-muted text-sm mt-6 hover:text-cm-text transition-colors"
              >
                Sign out
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Verification failed</h1>
              <p className="text-cm-muted text-sm mb-6">{errorMsg}</p>

              <button
                type="button"
                onClick={handleResend}
                disabled={resend === "sending" || resend === "sent"}
                className="w-full bg-cm-ocean text-cm-bg font-semibold text-sm py-2.5 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {resend === "sending"
                  ? "Sending…"
                  : resend === "sent"
                  ? "Email sent"
                  : "Send a new verification link"}
              </button>

              {resendMsg && (
                <p
                  className={`text-sm mt-4 ${
                    resend === "error" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {resendMsg}
                </p>
              )}

              <Link
                href="/dashboard"
                className="block text-cm-muted text-sm mt-6 hover:text-cm-text transition-colors"
              >
                Back to dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cm-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cm-ocean animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

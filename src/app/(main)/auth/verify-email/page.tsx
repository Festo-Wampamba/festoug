"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const codeParam = params.get("code") ?? "";

  const [otp, setOtp] = useState(codeParam.replace(/\D/g, "").slice(0, 6));
  const [isLoading, setIsLoading] = useState<"verify" | "resend" | false>(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const autoSubmitted = useRef(false);

  async function verify(code: string) {
    if (!email) { setError("Missing email. Please sign up again."); return; }
    if (code.length !== 6) { setError("Please enter the 6-digit code."); return; }
    setError(null);
    setIsLoading("verify");
    try {
      const { error: err } = await authClient.emailOtp.verifyEmail({ email, otp: code });
      if (err) { setError(err.message || "Invalid or expired code."); return; }
      // verifyEmail auto signs-in (autoSignInAfterVerification) — go straight to dashboard.
      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  // Auto-submit when arriving from the email link (?code=...)
  useEffect(() => {
    if (codeParam && email && !autoSubmitted.current) {
      autoSubmitted.current = true;
      verify(codeParam.replace(/\D/g, "").slice(0, 6));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend() {
    if (!email) return;
    setError(null);
    setResent(false);
    setIsLoading("resend");
    try {
      const { error: err } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (err) { setError(err.message || "Failed to resend code."); return; }
      setResent(true);
    } catch {
      setError("Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 text-cm-muted text-sm hover:text-cm-ocean transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          <div className="mb-6">
            <h1 className="text-cm-text text-2xl font-semibold mb-2">Verify your email</h1>
            <p className="text-cm-muted text-sm leading-relaxed">
              We sent a 6-digit code to{" "}
              <strong className="text-cm-text">{email || "your email"}</strong>. Enter it below to
              activate your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {resent && !error && (
            <div className="mb-4 p-3 bg-cm-ocean/10 border border-cm-ocean/20 rounded-lg text-cm-ocean text-sm text-center">
              A new code is on its way.
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify(otp);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">
                6-Digit Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                autoComplete="one-time-code"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[22px] font-mono tracking-[0.5em] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/30 text-center"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading !== false}
              className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading === "verify" ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading !== false}
            className="w-full mt-3 text-cm-muted text-sm hover:text-cm-ocean transition-colors disabled:opacity-50"
          >
            {isLoading === "resend" ? "Sending..." : "Didn't receive it? Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}

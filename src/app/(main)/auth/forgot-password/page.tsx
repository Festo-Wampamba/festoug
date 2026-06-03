"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Link2, Hash } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Step =
  | { kind: "email" }
  | { kind: "link-sent"; email: string }
  | { kind: "otp"; email: string }
  | { kind: "otp-success" };

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ kind: "email" });
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<"link" | "otp-send" | "otp-reset" | false>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading("link");
    try {
      const { error: err } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/auth/reset-password",
      });
      if (err) { setError(err.message || "Something went wrong."); return; }
      setStep({ kind: "link-sent", email });
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading("otp-send");
    try {
      const { error: err } = await authClient.emailOtp.requestPasswordReset({ email });
      if (err) { setError(err.message || "Something went wrong."); return; }
      setStep({ kind: "otp", email });
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOTPReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (otp.length !== 6) { setError("Please enter the 6-digit code."); return; }

    setIsLoading("otp-reset");
    try {
      const { error: resetErr } = await authClient.emailOtp.resetPassword({
        email: step.kind === "otp" ? step.email : "",
        otp,
        password,
      });
      if (resetErr) { setError(resetErr.message || "Invalid or expired code."); return; }

      // Auto sign-in after OTP reset
      const { error: signInErr } = await authClient.signIn.email({
        email: step.kind === "otp" ? step.email : "",
        password,
        callbackURL: "/dashboard",
      });
      if (signInErr) {
        // Reset worked but sign-in failed — send to sign-in page
        router.push("/auth/signin?reset=true");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOTP() {
    if (step.kind !== "otp") return;
    setError(null);
    setIsLoading("otp-send");
    try {
      await authClient.emailOtp.requestPasswordReset({ email: step.email });
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

          {/* ── Step: link-sent ── */}
          {step.kind === "link-sent" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-cm-ocean/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-cm-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Check your email</h1>
              <p className="text-cm-muted text-sm leading-relaxed">
                If an account exists for <strong className="text-cm-text">{step.email}</strong>, we&apos;ve sent a reset link.
              </p>
            </div>
          )}

          {/* ── Step: OTP entry ── */}
          {step.kind === "otp" && (
            <>
              <div className="mb-6">
                <h1 className="text-cm-text text-2xl font-semibold mb-2">Enter reset code</h1>
                <p className="text-cm-muted text-sm leading-relaxed">
                  We sent a 6-digit code to <strong className="text-cm-text">{step.email}</strong>. Enter it below along with your new password.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleOTPReset} className="space-y-4">
                <div>
                  <label className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">6-Digit Code</label>
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

                <div>
                  <label className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 pr-12 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-cm-muted hover:text-cm-text transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading !== false}
                  className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 mt-2"
                >
                  {isLoading === "otp-reset" ? "Resetting..." : "Reset password"}
                </button>
              </form>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading !== false}
                className="w-full mt-3 text-cm-muted text-sm hover:text-cm-ocean transition-colors disabled:opacity-50"
              >
                {isLoading === "otp-send" ? "Sending..." : "Didn't receive it? Resend code"}
              </button>
            </>
          )}

          {/* ── Step: email (initial) ── */}
          {step.kind === "email" && (
            <>
              <div className="mb-6">
                <h1 className="text-cm-text text-2xl font-semibold mb-2">Forgot password?</h1>
                <p className="text-cm-muted text-sm">Enter your email and choose how to reset.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="submit"
                    onClick={handleMagicLink}
                    disabled={!email || isLoading !== false}
                    className="flex flex-col items-center gap-2 p-4 bg-cm-bg border border-cm-border rounded-xl hover:border-cm-ocean hover:bg-cm-ocean/5 transition-all disabled:opacity-50 text-left"
                  >
                    <Link2 className="w-5 h-5 text-cm-ocean" />
                    <span className="text-cm-text text-sm font-medium">Magic link</span>
                    <span className="text-cm-muted text-xs leading-tight">Click a link in your email</span>
                    {isLoading === "link" && <span className="text-cm-ocean text-xs">Sending...</span>}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={!email || isLoading !== false}
                    className="flex flex-col items-center gap-2 p-4 bg-cm-bg border border-cm-border rounded-xl hover:border-cm-ocean hover:bg-cm-ocean/5 transition-all disabled:opacity-50 text-left"
                  >
                    <Hash className="w-5 h-5 text-cm-ocean" />
                    <span className="text-cm-text text-sm font-medium">6-digit code</span>
                    <span className="text-cm-muted text-xs leading-tight">Enter a one-time code</span>
                    {isLoading === "otp-send" && <span className="text-cm-ocean text-xs">Sending...</span>}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

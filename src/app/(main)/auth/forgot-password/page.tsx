"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl">
          <Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-cm-muted text-sm hover:text-cm-ocean transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-cm-ocean/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-cm-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Check your email</h1>
              <p className="text-cm-muted text-sm leading-relaxed">
                If an account exists for <strong className="text-cm-text">{email}</strong>, we&apos;ve sent a password reset link.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-cm-text text-2xl font-semibold mb-2">Forgot password?</h1>
                <p className="text-cm-muted text-sm">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl text-center">
          <h1 className="text-cm-text text-2xl font-semibold mb-2">Invalid link</h1>
          <p className="text-cm-muted text-sm">This reset link is invalid or has expired. Please request a new one.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      router.push("/auth/signin?reset=true");
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl">
          <div className="mb-6">
            <h1 className="text-cm-text text-2xl font-semibold mb-2">Set new password</h1>
            <p className="text-cm-muted text-sm">Choose a strong password for your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
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
              <label htmlFor="confirm" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                name="confirm"
                placeholder="Re-enter password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cm-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cm-ocean border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

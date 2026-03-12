"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading("credentials");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm = formData.get("confirm");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(null);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setIsLoading(null);
        return;
      }

      router.push("/auth/signin?registered=true");
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(null);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-cm-text text-3xl font-semibold tracking-tight mb-2 font-[family-name:var(--font-inter)]">
              Create your account
            </h1>
            <p className="text-cm-muted text-sm">Join FestoUG to access digital products</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-2 border border-cm-border bg-cm-bg text-cm-text text-sm font-medium py-3 px-4 rounded-xl hover:bg-cm-border transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              {isLoading === "github" ? "..." : "GitHub"}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-2 border border-cm-border bg-cm-bg text-cm-text text-sm font-medium py-3 px-4 rounded-xl hover:bg-cm-border transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {isLoading === "google" ? "..." : "Google"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <hr className="flex-1 border-cm-border" />
            <span className="text-cm-muted text-xs">or with email</span>
            <hr className="flex-1 border-cm-border" />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Full Name</label>
              <input id="name" type="text" name="name" placeholder="John Doe" required autoComplete="name"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50" />
            </div>
            <div>
              <label htmlFor="email" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input id="email" type="email" name="email" placeholder="you@example.com" required autoComplete="email"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50" />
            </div>
            <div>
              <label htmlFor="password" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} name="password" placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
                  className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 pr-12 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50" />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cm-muted hover:text-cm-text transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <input id="confirm" type={showPassword ? "text" : "password"} name="confirm" placeholder="Re-enter password" required minLength={8} autoComplete="new-password"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50" />
            </div>

            <button type="submit" disabled={!!isLoading}
              className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 mt-2">
              {isLoading === "credentials" ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-cm-muted text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-cm-ocean hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

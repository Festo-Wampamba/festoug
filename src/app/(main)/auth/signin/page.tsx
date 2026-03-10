"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Github, Chrome } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading("credentials");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setIsLoading(null);
      return;
    }

    router.push(callbackUrl);
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-smoky-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative bg-gradient-to-br from-[hsl(240,1%,25%)] to-[hsl(0,0%,19%)] p-8 rounded-[20px] shadow-2 border border-jet">
          <div className="absolute inset-[1px] bg-eerie-black-2 rounded-[20px] -z-10" />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white-2 text-3xl font-semibold tracking-tight mb-2">Welcome back</h1>
            <p className="text-light-gray text-sm">Sign in to your FestoUG account</p>
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
              className="flex items-center justify-center gap-2 border border-jet bg-transparent text-white-2 text-sm font-medium py-3 px-4 rounded-[12px] hover:bg-jet transition-colors disabled:opacity-50"
            >
              <Github className="w-4 h-4" />
              {isLoading === "github" ? "..." : "GitHub"}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-2 border border-jet bg-transparent text-white-2 text-sm font-medium py-3 px-4 rounded-[12px] hover:bg-jet transition-colors disabled:opacity-50"
            >
              <Chrome className="w-4 h-4" />
              {isLoading === "google" ? "..." : "Google"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <hr className="flex-1 border-jet" />
            <span className="text-light-gray-70 text-xs">or with email</span>
            <hr className="flex-1 border-jet" />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              autoComplete="email"
              className="w-full bg-transparent border border-jet text-white-2 text-[15px] font-light px-4 py-3 rounded-[12px] outline-none focus:border-orange-yellow-crayola transition-colors"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                autoComplete="current-password"
                className="w-full bg-transparent border border-jet text-white-2 text-[15px] font-light px-4 py-3 pr-12 rounded-[12px] outline-none focus:border-orange-yellow-crayola transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-light-gray hover:text-white-2 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-orange-yellow-crayola text-smoky-black font-semibold text-[15px] py-3 rounded-[12px] hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {isLoading === "credentials" ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-light-gray text-sm mt-6">
            Don&#39;t have an account?{" "}
            <Link href="/auth/signup" className="text-orange-yellow-crayola hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-smoky-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-yellow-crayola border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

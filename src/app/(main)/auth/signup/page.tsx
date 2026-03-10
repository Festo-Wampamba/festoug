"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm = formData.get("confirm");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
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
        setIsLoading(false);
        return;
      }

      router.push("/auth/signin?registered=true");
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-smoky-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative bg-gradient-to-br from-[hsl(240,1%,25%)] to-[hsl(0,0%,19%)] p-8 rounded-[20px] shadow-2 border border-jet">
          <div className="absolute inset-[1px] bg-eerie-black-2 rounded-[20px] -z-10" />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white-2 text-3xl font-semibold tracking-tight mb-2">Create your account</h1>
            <p className="text-light-gray text-sm">Join FestoUG to access digital products</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full name"
              required
              autoComplete="name"
              className="w-full bg-transparent border border-jet text-white-2 text-[15px] font-light px-4 py-3 rounded-[12px] outline-none focus:border-orange-yellow-crayola transition-colors"
            />
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
                placeholder="Password (min. 8 characters)"
                required
                minLength={8}
                autoComplete="new-password"
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

            <input
              type={showPassword ? "text" : "password"}
              name="confirm"
              placeholder="Confirm password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-transparent border border-jet text-white-2 text-[15px] font-light px-4 py-3 rounded-[12px] outline-none focus:border-orange-yellow-crayola transition-colors"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-yellow-crayola text-smoky-black font-semibold text-[15px] py-3 rounded-[12px] hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-light-gray text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-orange-yellow-crayola hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

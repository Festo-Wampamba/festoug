"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPlan = (searchParams.get("plan") || "BASIC").toUpperCase();

  const [plan, setPlan]                = useState<"BASIC" | "PRO">(defaultPlan === "PRO" ? "PRO" : "BASIC");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [websiteUrl, setWebsiteUrl]    = useState("");
  const [loading, setLoading]          = useState(false);
  const [error, setError]              = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trial", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan, billingCycle, websiteUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      router.push("/dashboard/subscription");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-xl mx-auto">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-light-gray-70 hover:text-white-2 transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <span className="text-green-400 text-sm font-medium tracking-wide uppercase">14-Day Free Trial</span>
        </div>
        <h2 className="text-white-2 text-3xl font-semibold mb-3">Start your free trial</h2>
        <p className="text-light-gray text-sm leading-relaxed">
          No credit card required. Full access for 14 days. Cancel anytime.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white-2 mb-3">Choose plan</label>
          <div className="grid grid-cols-2 gap-3">
            {(["BASIC", "PRO"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  plan === p
                    ? "border-green-500 bg-green-500/10 text-white-2"
                    : "border-jet bg-eerie-black-1 text-light-gray-70 hover:border-light-gray-70"
                }`}
              >
                <div className="font-semibold text-sm mb-1">{p === "BASIC" ? "Basic" : "Pro"}</div>
                <div className="text-xs opacity-70">{p === "BASIC" ? "$29/mo or $290/yr" : "$99/mo or $990/yr"}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white-2 mb-3">Billing preference after trial</label>
          <div className="grid grid-cols-2 gap-3">
            {(["MONTHLY", "ANNUAL"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  billingCycle === cycle
                    ? "border-green-500 bg-green-500/10 text-white-2"
                    : "border-jet bg-eerie-black-1 text-light-gray-70 hover:border-light-gray-70"
                }`}
              >
                <div className="font-semibold text-sm mb-1">{cycle === "MONTHLY" ? "Monthly" : "Annual"}</div>
                <div className="text-xs opacity-70">{cycle === "ANNUAL" ? "Save 17%" : "Flexible"}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-white-2 mb-2">
            Website URL to maintain
          </label>
          <input
            id="websiteUrl"
            type="url"
            required
            placeholder="https://yourwebsite.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-eerie-black-1 border border-jet text-white-2 placeholder:text-light-gray-70 focus:outline-none focus:border-green-500 transition-colors text-sm"
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Starting trial…" : "Start Free Trial — No Card Required"}
        </button>

        <p className="text-center text-xs text-light-gray-70">
          By starting a trial you agree that Festo will provide maintenance services for your site during the 14-day period.
        </p>
      </form>
    </div>
  );
}

export default function TrialOnboardingPage() {
  return (
    <Suspense fallback={<div className="text-light-gray-70 py-8">Loading…</div>}>
      <OnboardingForm />
    </Suspense>
  );
}

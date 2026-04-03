"use client";

import { useState } from "react";
import Link from "next/link";
import { BillingToggle } from "./billing-toggle";
import { Shield } from "lucide-react";

const FEATURES = {
  BASIC: [
    "Monthly updates",
    "Security monitoring",
    "Uptime checks",
    "Email support",
  ],
  PRO: [
    "Everything in Basic",
    "Server management",
    "Performance tuning",
    "Priority support",
    "Monthly report",
  ],
  ENTERPRISE: [
    "Everything in Pro",
    "Dedicated support",
    "Custom SLA",
    "Multiple projects",
    "Quarterly strategy call",
  ],
};

export function MaintenanceCards() {
  const [cycle, setCycle] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");

  const prices = {
    BASIC: cycle === "ANNUAL" ? "$290 / yr" : "$29 / mo",
    PRO:   cycle === "ANNUAL" ? "$990 / yr" : "$99 / mo",
  };

  const subPrices = {
    BASIC: cycle === "ANNUAL" ? "$29/mo billed monthly" : "billed monthly",
    PRO:   cycle === "ANNUAL" ? "$99/mo billed monthly" : "billed monthly",
  };

  return (
    <div>
      <BillingToggle onChange={setCycle} defaultCycle="ANNUAL" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic */}
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-light-gray-70 mb-4">Basic</p>
          <div className="mb-1">
            <span className="text-3xl font-extrabold text-white-2 tracking-tight">{prices.BASIC}</span>
          </div>
          <p className="text-xs text-light-gray-70 mb-6">{subPrices.BASIC}</p>
          <ul className="flex-1 space-y-2 mb-6">
            {FEATURES.BASIC.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-light-gray">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/trial/onboarding?plan=BASIC"
            className="block text-center py-2.5 rounded-xl border border-green-500 text-green-400 text-sm font-semibold hover:bg-green-500/10 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Pro — Featured */}
        <div className="bg-eerie-black-1 border-2 border-green-500 rounded-2xl p-6 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
            Most Popular
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-light-gray-70 mb-4">Pro</p>
          <div className="mb-1">
            <span className="text-3xl font-extrabold text-white-2 tracking-tight">{prices.PRO}</span>
          </div>
          <p className="text-xs text-light-gray-70 mb-6">{subPrices.PRO}</p>
          <ul className="flex-1 space-y-2 mb-6">
            {FEATURES.PRO.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-light-gray">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/trial/onboarding?plan=PRO"
            className="block text-center py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Enterprise */}
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-light-gray-70 mb-4">Enterprise</p>
          <div className="mb-1">
            <span className="text-3xl font-extrabold text-white-2 tracking-tight">Custom</span>
          </div>
          <p className="text-xs text-light-gray-70 mb-6">tailored to your needs</p>
          <ul className="flex-1 space-y-2 mb-6">
            {FEATURES.ENTERPRISE.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-light-gray">
                <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="block text-center py-2.5 rounded-xl border border-jet text-light-gray-70 text-sm font-semibold hover:bg-jet hover:text-white-2 transition-colors"
          >
            Contact Us →
          </Link>
        </div>
      </div>

      {/* Trial notice */}
      <div className="mt-8 flex items-start gap-4 bg-eerie-black-1 border border-jet rounded-xl p-5">
        <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white-2 mb-1">14-day free trial — no credit card required</p>
          <p className="text-xs text-light-gray-70 leading-relaxed">
            Start your trial today. Full access for 14 days. A reminder is sent on day 12. Subscribe at any time or let it expire — no charge.
          </p>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { maintenanceTrials, subscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { Shield, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  BASIC:      "Basic Plan",
  PRO:        "Pro Plan",
  ENTERPRISE: "Enterprise Plan",
};

const CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  ANNUAL:  "Annual",
};

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [activeSub, activeTrial] = await Promise.all([
    withRetry((db) =>
      db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.userId, session.user.id),
          eq(subscriptions.status, "ACTIVE")
        ),
      })
    ),
    withRetry((db) =>
      db.query.maintenanceTrials.findFirst({
        where: and(
          eq(maintenanceTrials.userId, session.user.id),
          eq(maintenanceTrials.status, "ACTIVE")
        ),
      })
    ),
  ]);

  // State 3 — Active subscription
  if (activeSub) {
    const renewalDate = activeSub.currentPeriodEnd.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    return (
      <div className="animate-in fade-in duration-500">
        <h3 className="text-2xl font-semibold text-white-2 mb-6">Subscription</h3>
        <div className="bg-eerie-black-1 border border-green-500/30 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-green-400 font-medium uppercase tracking-widest mb-1">Active</p>
              <h4 className="text-xl font-bold text-white-2">{PLAN_LABELS[activeSub.plan]}</h4>
              <p className="text-light-gray-70 text-sm mt-1">
                {CYCLE_LABELS[activeSub.billingCycle]} billing · Renews {renewalDate}
              </p>
            </div>
          </div>
          <p className="text-light-gray text-sm">
            To make changes or cancel, email{" "}
            <a href="mailto:hello@festoug.com" className="text-orange-yellow-crayola hover:underline">
              hello@festoug.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // State 2 — Active trial
  if (activeTrial) {
    const now      = new Date();
    const msLeft   = activeTrial.trialEndsAt.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    const endDate  = activeTrial.trialEndsAt.toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
    return (
      <div className="animate-in fade-in duration-500">
        <h3 className="text-2xl font-semibold text-white-2 mb-6">Subscription</h3>
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-orange-400 font-medium uppercase tracking-widest mb-1">
                Free Trial — {daysLeft} {daysLeft === 1 ? "day" : "days"} left
              </p>
              <h4 className="text-xl font-bold text-white-2">{PLAN_LABELS[activeTrial.plan]}</h4>
              <p className="text-light-gray-70 text-sm mt-1">
                Trial ends {endDate} · {CYCLE_LABELS[activeTrial.billingCycle]} billing after
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/trial/subscribe?id=${activeTrial.id}`}
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              <Shield className="w-4 h-4" /> Subscribe Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-jet text-light-gray px-6 py-3 rounded-xl font-medium hover:bg-jet transition-colors text-sm"
            >
              Contact to Cancel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 1 — No trial
  return (
    <div className="animate-in fade-in duration-500">
      <h3 className="text-2xl font-semibold text-white-2 mb-6">Subscription</h3>
      <div className="bg-eerie-black-1 border border-jet rounded-2xl p-10 text-center">
        <AlertCircle className="w-10 h-10 text-light-gray-70 mx-auto mb-4" />
        <h4 className="text-xl font-semibold text-white-2 mb-2">No active plan</h4>
        <p className="text-light-gray text-sm mb-6 max-w-sm mx-auto">
          Get your site maintained, secured, and updated every month. Start free for 14 days.
        </p>
        <Link
          href="/trial/onboarding"
          className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
        >
          <Shield className="w-4 h-4" /> Start Free Trial
        </Link>
      </div>
    </div>
  );
}

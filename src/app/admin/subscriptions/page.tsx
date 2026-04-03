import { withRetry } from "@/lib/db";
import { maintenanceTrials, subscriptions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { AdminNotifyButton } from "@/components/admin/admin-notify-button";
import { CustomerActions } from "@/components/admin/toggle-customer";

export const metadata = { title: "Admin | Subscriptions & Trials" };
export const dynamic = "force-dynamic";

const PLAN_LABEL: Record<string, string> = { BASIC: "Basic", PRO: "Pro", ENTERPRISE: "Enterprise" };
const CYCLE_LABEL: Record<string, string> = { MONTHLY: "Monthly", ANNUAL: "Annual" };

const TRIAL_COLORS: Record<string, string> = {
  ACTIVE:    "bg-orange-400/10 text-orange-400 border-orange-400/20",
  EXPIRED:   "bg-red-500/10 text-red-400 border-red-500/20",
  CONVERTED: "bg-green-500/10 text-green-400 border-green-500/20",
};

const SUB_COLORS: Record<string, string> = {
  ACTIVE:    "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  EXPIRED:   "bg-jet text-light-gray-70 border-jet",
};

export default async function AdminSubscriptionsPage() {
  const [allTrials, allSubs] = await Promise.all([
    withRetry((db) =>
      db.query.maintenanceTrials.findMany({
        orderBy: [desc(maintenanceTrials.createdAt)],
        with: { user: true },
      })
    ),
    withRetry((db) =>
      db.query.subscriptions.findMany({
        orderBy: [desc(subscriptions.createdAt)],
        with: { user: true },
      })
    ),
  ]);

  const now = new Date();

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Subscriptions &amp; Trials</h2>
        <p className="text-light-gray-70 text-sm mt-1">
          {allTrials.length} trial{allTrials.length !== 1 ? "s" : ""} · {allSubs.length} subscription{allSubs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Active Subscriptions ── */}
      <section>
        <h3 className="text-white-2 font-semibold text-base mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" /> Subscriptions
        </h3>
        <div className="bg-eerie-black-1 border border-jet rounded-2xl overflow-hidden">
          {allSubs.length === 0 ? (
            <p className="text-light-gray-70 text-sm p-8 text-center">No subscriptions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-jet text-light-gray-70 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Billing</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Renews</th>
                    <th className="px-5 py-3">LS ID</th>
                    <th className="px-5 py-3">Since</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubs.map((sub) => (
                    <tr key={sub.id} className="border-b border-jet/50 hover:bg-jet/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white-2 font-medium">{sub.user?.name ?? "—"}</p>
                        <p className="text-light-gray-70 text-xs">{sub.user?.email ?? "—"}</p>
                      </td>
                      <td className="px-5 py-4 text-white-2 font-medium">{PLAN_LABEL[sub.plan]}</td>
                      <td className="px-5 py-4 text-light-gray text-xs">{CYCLE_LABEL[sub.billingCycle]}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${SUB_COLORS[sub.status] ?? ""}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-light-gray text-xs">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-light-gray-70 text-xs font-mono">{sub.lsSubscriptionId}</td>
                      <td className="px-5 py-4 text-light-gray-70 text-xs">
                        {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {sub.user && (
                            <>
                              <AdminNotifyButton
                                userId={sub.user.id}
                                userName={sub.user.name ?? sub.user.email}
                                defaultType="PAYMENT"
                                defaultLink="/dashboard/subscription"
                              />
                              <CustomerActions
                                customerId={sub.user.id}
                                accountStatus={sub.user.accountStatus}
                                customerName={sub.user.name ?? sub.user.email}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Trials ── */}
      <section>
        <h3 className="text-white-2 font-semibold text-base mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" /> Trials
        </h3>
        <div className="bg-eerie-black-1 border border-jet rounded-2xl overflow-hidden">
          {allTrials.length === 0 ? (
            <p className="text-light-gray-70 text-sm p-8 text-center">No trials yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-jet text-light-gray-70 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Billing</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Days Left</th>
                    <th className="px-5 py-3">Website</th>
                    <th className="px-5 py-3">Notified</th>
                    <th className="px-5 py-3">Started</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allTrials.map((trial) => {
                    const msLeft = new Date(trial.trialEndsAt).getTime() - now.getTime();
                    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
                    return (
                      <tr key={trial.id} className="border-b border-jet/50 hover:bg-jet/20 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-white-2 font-medium">{trial.user?.name ?? "—"}</p>
                          <p className="text-light-gray-70 text-xs">{trial.user?.email ?? "—"}</p>
                        </td>
                        <td className="px-5 py-4 text-white-2 font-medium">{PLAN_LABEL[trial.plan]}</td>
                        <td className="px-5 py-4 text-light-gray text-xs">{CYCLE_LABEL[trial.billingCycle]}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TRIAL_COLORS[trial.status] ?? ""}`}>
                            {trial.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {trial.status === "ACTIVE" ? (
                            <span className={`text-sm font-bold ${daysLeft <= 2 ? "text-red-400" : daysLeft <= 5 ? "text-orange-400" : "text-white-2"}`}>
                              {daysLeft}d
                            </span>
                          ) : (
                            <span className="text-light-gray-70 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <a
                            href={trial.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-yellow-crayola hover:underline text-xs truncate max-w-[160px] block"
                          >
                            {trial.websiteUrl}
                          </a>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          {trial.notifiedAt ? (
                            <span className="text-green-400">✓ Sent</span>
                          ) : (
                            <span className="text-light-gray-70">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-light-gray-70 text-xs">
                          {new Date(trial.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {trial.user && (
                              <>
                                <AdminNotifyButton
                                  userId={trial.user.id}
                                  userName={trial.user.name ?? trial.user.email}
                                  defaultType="INFO"
                                  defaultLink="/dashboard/subscription"
                                />
                                <CustomerActions
                                  customerId={trial.user.id}
                                  accountStatus={trial.user.accountStatus}
                                  customerName={trial.user.name ?? trial.user.email}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

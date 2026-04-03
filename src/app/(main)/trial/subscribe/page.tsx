import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceTrials } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSubscriptionCheckoutUrl } from "@/lib/payments/lemonsqueezy";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function TrialSubscribePage({ searchParams }: Props) {
  const { id } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/trial/subscribe${id ? `?id=${id}` : ""}`);
  }

  if (!id) {
    return (
      <div className="animate-in fade-in duration-500 max-w-xl mx-auto text-center py-20">
        <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-4" />
        <h2 className="text-white-2 text-2xl font-semibold mb-3">Invalid link</h2>
        <p className="text-light-gray text-sm mb-6">This subscribe link is missing a trial ID.</p>
        <Link href="/services" className="text-orange-yellow-crayola hover:underline text-sm">← Back to Services</Link>
      </div>
    );
  }

  const trial = await db.query.maintenanceTrials.findFirst({
    where: and(
      eq(maintenanceTrials.id, id),
      eq(maintenanceTrials.userId, session.user.id)
    ),
  });

  if (!trial) {
    return (
      <div className="animate-in fade-in duration-500 max-w-xl mx-auto text-center py-20">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h2 className="text-white-2 text-2xl font-semibold mb-3">Trial not found</h2>
        <p className="text-light-gray text-sm mb-6">This link doesn't match your account.</p>
        <Link href="/dashboard/subscription" className="text-orange-yellow-crayola hover:underline text-sm">Go to Dashboard →</Link>
      </div>
    );
  }

  if (trial.status === "CONVERTED") {
    redirect("/dashboard/subscription");
  }

  if (trial.status === "EXPIRED" || new Date() > trial.trialEndsAt) {
    return (
      <div className="animate-in fade-in duration-500 max-w-xl mx-auto text-center py-20">
        <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-4" />
        <h2 className="text-white-2 text-2xl font-semibold mb-3">Trial expired</h2>
        <p className="text-light-gray text-sm mb-6">Your 14-day trial has ended. Start a new trial to continue.</p>
        <Link
          href="/trial/onboarding"
          className="inline-flex items-center justify-center bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
        >
          Start a New Trial
        </Link>
      </div>
    );
  }

  if (trial.plan === "ENTERPRISE") {
    redirect("/contact");
  }

  const checkoutUrl = await getSubscriptionCheckoutUrl(
    trial.plan as "BASIC" | "PRO",
    trial.billingCycle as "MONTHLY" | "ANNUAL",
    session.user.id,
    trial.id
  );

  redirect(checkoutUrl);
}

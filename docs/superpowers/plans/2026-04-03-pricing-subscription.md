# Pricing & Subscription System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full maintenance subscription system (14-day card-free trial, monthly/annual billing, 3 tiers) and redesign `/services` into a 3-section pricing page covering what I build, project tiers, and maintenance plans.

**Architecture:** Services-Expanded Hybrid — the `/services` page becomes the pricing hub with 3 numbered sections. Maintenance subscriptions use an intent-first trial: user fills an onboarding form, trial is tracked in DB, a Vercel cron sends a day-12 reminder email with a Lemon Squeezy checkout link, and the LS webhook creates the subscription record on payment.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM + PostgreSQL, Lemon Squeezy JS SDK, Resend (email), Tailwind CSS, Auth.js v5, Vercel Cron

---

> **You only need Festo for two things:**
> - **Task 3 (step 1):** Create 4 subscription products in the Lemon Squeezy dashboard and provide the variant IDs.
> - **Task 14 (step 1):** Add new environment variables to `.env.local` and Vercel project settings.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/db/schema.ts` | Modify | Add 4 enums + 2 tables + relations |
| `src/lib/email.ts` | Modify | Add 3 email functions (welcome, reminder, confirmed) |
| `src/lib/payments/lemonsqueezy.ts` | Modify | Add subscription variant map + `getSubscriptionCheckoutUrl()` |
| `src/app/api/trial/route.ts` | Create | POST — create trial record + send welcome email |
| `src/app/api/cron/trial-reminder/route.ts` | Create | GET — find expiring trials, send reminder emails |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | Modify | Handle `subscription_created` event |
| `src/app/(main)/trial/onboarding/page.tsx` | Create | Auth-protected trial signup form |
| `src/app/(main)/trial/subscribe/page.tsx` | Create | Validates trial → redirects to LS checkout |
| `src/app/(main)/dashboard/subscription/page.tsx` | Create | Shows trial/subscription state (3 states) |
| `src/components/marketing/billing-toggle.tsx` | Create | Client component — monthly/annual toggle |
| `src/components/marketing/maintenance-cards.tsx` | Create | Maintenance plan cards (receives `billingCycle` prop) |
| `src/app/(main)/services/page.tsx` | Modify | Full redesign — 3 sections |
| `vercel.json` | Create/Modify | Cron job for trial-reminder |

---

## Task 1: DB Schema — New Enums and Tables

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add 4 new enums after the existing enums block (after line 43)**

Open `src/lib/db/schema.ts`. After the `reviewStatusEnum` declaration, add:

```ts
export const maintenancePlanEnum = pgEnum("maintenance_plan", [
  "BASIC",
  "PRO",
  "ENTERPRISE",
]);
export const billingCycleEnum = pgEnum("billing_cycle", ["MONTHLY", "ANNUAL"]);
export const trialStatusEnum = pgEnum("trial_status", [
  "ACTIVE",
  "EXPIRED",
  "CONVERTED",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "CANCELLED",
  "EXPIRED",
]);
```

- [ ] **Step 2: Add the `maintenanceTrial` table at the end of the tables section (before the Relations section)**

```ts
// ─── Maintenance Trials ───────────────────────────────────────────────────────
export const maintenanceTrials = pgTable(
  "maintenance_trial",
  {
    id:            uuid("id").primaryKey().defaultRandom(),
    userId:        uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    plan:          maintenancePlanEnum("plan").notNull(),
    billingCycle:  billingCycleEnum("billing_cycle").notNull(),
    websiteUrl:    text("website_url").notNull(),
    status:        trialStatusEnum("status").notNull().default("ACTIVE"),
    trialStartsAt: timestamp("trial_starts_at").notNull().defaultNow(),
    trialEndsAt:   timestamp("trial_ends_at").notNull(),
    notifiedAt:    timestamp("notified_at"),
    createdAt:     timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx:   index("trial_user_idx").on(t.userId),
    statusIdx: index("trial_status_idx").on(t.status),
    endsIdx:   index("trial_ends_idx").on(t.trialEndsAt),
  })
);
```

- [ ] **Step 3: Add the `subscriptions` table immediately after**

```ts
// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable(
  "subscription",
  {
    id:               uuid("id").primaryKey().defaultRandom(),
    userId:           uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    trialId:          uuid("trial_id").references(() => maintenanceTrials.id, { onDelete: "set null" }),
    plan:             maintenancePlanEnum("plan").notNull(),
    billingCycle:     billingCycleEnum("billing_cycle").notNull(),
    status:           subscriptionStatusEnum("status").notNull().default("ACTIVE"),
    lsSubscriptionId: text("ls_subscription_id").notNull().unique(),
    lsVariantId:      text("ls_variant_id").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelledAt:      timestamp("cancelled_at"),
    createdAt:        timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx:   index("sub_user_idx").on(t.userId),
    statusIdx: index("sub_status_idx").on(t.status),
    lsIdx:     index("sub_ls_idx").on(t.lsSubscriptionId),
  })
);
```

- [ ] **Step 4: Add relations for the two new tables**

In the Relations section, add after `reviewHelpfulVotesRelations`:

```ts
export const maintenanceTrialsRelations = relations(maintenanceTrials, ({ one }) => ({
  user: one(users, { fields: [maintenanceTrials.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  trial: one(maintenanceTrials, { fields: [subscriptions.trialId], references: [maintenanceTrials.id] }),
}));
```

Also extend `usersRelations` to include the new tables:

```ts
export const usersRelations = relations(users, ({ many }) => ({
  orders:             many(orders),
  licenses:           many(licenses),
  accounts:           many(accounts),
  sessions:           many(sessions),
  blogPosts:          many(blogPosts),
  reviews:            many(reviews),
  chatMessages:       many(chatMessages),
  maintenanceTrials:  many(maintenanceTrials),
  subscriptions:      many(subscriptions),
}));
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /home/festo/festoug && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to schema.ts

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat(db): add maintenance_trial and subscription tables with enums"
```

---

## Task 2: Generate and Apply Migration

**Files:**
- `drizzle/migrations/` (auto-generated)

- [ ] **Step 1: Generate migration**

```bash
cd /home/festo/festoug && pnpm db:generate
```

Expected: new `.sql` file in `drizzle/migrations/` containing `CREATE TYPE`, `CREATE TABLE` for `maintenance_trial` and `subscription`.

- [ ] **Step 2: Apply migration**

```bash
pnpm db:migrate
```

Expected: `✓ Migrations applied` with no errors. If using Neon, ensure `DATABASE_URL` is set in `.env.local`.

- [ ] **Step 3: Verify tables exist**

```bash
pnpm db:studio
```

Open Drizzle Studio at `http://localhost:4983`. Confirm `maintenance_trial` and `subscription` tables appear. Close studio (`Ctrl+C`) when done.

- [ ] **Step 4: Commit**

```bash
git add drizzle/
git commit -m "feat(db): apply migration for maintenance_trial and subscription tables"
```

---

## Task 3: Lemon Squeezy — Subscription Variant Map

> **ACTION REQUIRED FROM FESTO before step 2:**
> In your Lemon Squeezy dashboard, create a **Store** (if not done) and add 4 subscription products:
> - Basic Monthly — $29/month
> - Basic Annual — $290/year
> - Pro Monthly — $99/month
> - Pro Annual — $990/year
>
> For each product, copy the **Variant ID** (found in the product's variant settings URL or API).
> Then add to `.env.local`:
> ```env
> LS_VARIANT_BASIC_MONTHLY=<id>
> LS_VARIANT_BASIC_ANNUAL=<id>
> LS_VARIANT_PRO_MONTHLY=<id>
> LS_VARIANT_PRO_ANNUAL=<id>
> ```

**Files:**
- Modify: `src/lib/payments/lemonsqueezy.ts`

- [ ] **Step 2: Add subscription variant map and checkout helper**

Open `src/lib/payments/lemonsqueezy.ts` and add at the end of the file:

```ts
// ─── Subscription Variant Map ─────────────────────────────────────────────────

type MaintenancePlan = "BASIC" | "PRO";
type BillingCycle = "MONTHLY" | "ANNUAL";

export function getSubscriptionVariantId(
  plan: MaintenancePlan,
  billingCycle: BillingCycle
): string {
  const map: Record<`${MaintenancePlan}_${BillingCycle}`, string> = {
    BASIC_MONTHLY: process.env.LS_VARIANT_BASIC_MONTHLY!,
    BASIC_ANNUAL:  process.env.LS_VARIANT_BASIC_ANNUAL!,
    PRO_MONTHLY:   process.env.LS_VARIANT_PRO_MONTHLY!,
    PRO_ANNUAL:    process.env.LS_VARIANT_PRO_ANNUAL!,
  };

  const variantId = map[`${plan}_${billingCycle}`];
  if (!variantId) {
    throw new Error(
      `Missing LS variant ID for ${plan} ${billingCycle}. Set LS_VARIANT_${plan}_${billingCycle} in env.`
    );
  }
  return variantId;
}

/**
 * Generates a Lemon Squeezy subscription checkout URL.
 */
export async function getSubscriptionCheckoutUrl(
  plan: MaintenancePlan,
  billingCycle: BillingCycle,
  userId: string,
  trialId: string
): Promise<string> {
  const variantId = getSubscriptionVariantId(plan, billingCycle);

  return generateCheckoutLink(
    variantId,
    process.env.LEMONSQUEEZY_STORE_ID!,
    {
      user_id:  userId,
      trial_id: trialId,
      plan,
      billing_cycle: billingCycle,
    }
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/payments/lemonsqueezy.ts
git commit -m "feat(payments): add subscription variant map and getSubscriptionCheckoutUrl"
```

---

## Task 4: Email Functions for Trials

**Files:**
- Modify: `src/lib/email.ts`

- [ ] **Step 1: Add 3 email functions to `src/lib/email.ts`**

Append at the end of the file:

```ts
export async function sendTrialWelcomeEmail(
  email: string,
  name: string,
  plan: string,
  trialEndsAt: Date
) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${appUrl}/dashboard/subscription`;
  const endDate = trialEndsAt.toLocaleDateString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to:   email,
    subject: `Your 14-day free trial has started — ${plan} Plan`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:8px;">Welcome, ${name}! 🎉</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">
          Your <strong style="color:#10b981;">${plan} Plan</strong> free trial is now active.
          You have full access until <strong style="color:#f1f5f9;">${endDate}</strong>.
        </p>
        <h3 style="color:#f1f5f9;margin-top:28px;margin-bottom:12px;">What's included:</h3>
        <ul style="color:#94a3b8;font-size:13px;line-height:2;padding-left:20px;">
          ${plan === "PRO"
            ? "<li>Monthly updates</li><li>Security monitoring</li><li>Uptime checks</li><li>Server management</li><li>Performance tuning</li><li>Priority support</li><li>Monthly report</li>"
            : "<li>Monthly updates</li><li>Security monitoring</li><li>Uptime checks</li><li>Email support</li>"
          }
        </ul>
        <a href="${dashboardUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px;">
          View Your Trial →
        </a>
        <p style="color:#334155;font-size:12px;margin-top:32px;">
          Questions? Reply to this email — I read every one.
        </p>
      </div>
    `,
  });
}

export async function sendTrialReminderEmail(
  email: string,
  name: string,
  plan: string,
  trialId: string,
  trialEndsAt: Date
) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subscribeUrl = `${appUrl}/trial/subscribe?id=${trialId}`;
  const endDate = trialEndsAt.toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to:   email,
    subject: `Your free trial ends in 2 days — subscribe to keep access`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:8px;">Your trial ends ${endDate}</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">
          Hey ${name}, your <strong style="color:#10b981;">${plan} Plan</strong> trial is almost up.
          Subscribe now to keep your site protected and up to date — no interruption.
        </p>
        <a href="${subscribeUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:24px;font-size:15px;">
          Subscribe Now →
        </a>
        <p style="color:#475569;font-size:13px;margin-top:20px;">
          If you decide not to continue, your trial will simply expire on ${endDate}. No charge, ever.
        </p>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmedEmail(
  email: string,
  name: string,
  plan: string,
  billingCycle: string,
  nextRenewal: Date
) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${appUrl}/dashboard/subscription`;
  const renewalDate = nextRenewal.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });
  const price = plan === "PRO"
    ? (billingCycle === "ANNUAL" ? "$990/year" : "$99/month")
    : (billingCycle === "ANNUAL" ? "$290/year" : "$29/month");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to:   email,
    subject: `Subscription confirmed — ${plan} Plan (${billingCycle})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:8px;">You're all set, ${name}! ✅</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">
          Your <strong style="color:#10b981;">${plan} Plan</strong> subscription is now active at
          <strong style="color:#f1f5f9;">${price}</strong>. Next renewal: ${renewalDate}.
        </p>
        <a href="${dashboardUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px;">
          View Subscription →
        </a>
        <p style="color:#334155;font-size:12px;margin-top:32px;">
          To cancel or make changes, reply to this email.
        </p>
      </div>
    `,
  });
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat(email): add trial welcome, reminder, and subscription confirmed emails"
```

---

## Task 5: POST /api/trial Route

**Files:**
- Create: `src/app/api/trial/route.ts`

- [ ] **Step 1: Create the route file**

```ts
// src/app/api/trial/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceTrials, subscriptions } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { sendTrialWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email || !session.user.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, billingCycle, websiteUrl } = body as {
      plan:         "BASIC" | "PRO";
      billingCycle: "MONTHLY" | "ANNUAL";
      websiteUrl:   string;
    };

    if (!plan || !billingCycle || !websiteUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!["BASIC", "PRO"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!["MONTHLY", "ANNUAL"].includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    // Check for existing active trial or active subscription
    const existingTrial = await db.query.maintenanceTrials.findFirst({
      where: and(
        eq(maintenanceTrials.userId, session.user.id),
        or(
          eq(maintenanceTrials.status, "ACTIVE"),
          eq(maintenanceTrials.status, "CONVERTED")
        )
      ),
    });
    if (existingTrial) {
      return NextResponse.json(
        { error: "You already have an active trial or subscription." },
        { status: 409 }
      );
    }

    const existingSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, session.user.id),
        eq(subscriptions.status, "ACTIVE")
      ),
    });
    if (existingSub) {
      return NextResponse.json(
        { error: "You already have an active subscription." },
        { status: 409 }
      );
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [trial] = await db
      .insert(maintenanceTrials)
      .values({
        userId:       session.user.id,
        plan,
        billingCycle,
        websiteUrl,
        status:       "ACTIVE",
        trialStartsAt: now,
        trialEndsAt,
      })
      .returning();

    await sendTrialWelcomeEmail(
      session.user.email,
      session.user.name,
      plan,
      trialEndsAt
    );

    return NextResponse.json({ trialId: trial.id }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/trial]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Manual test (dev server must be running)**

Start the dev server in a separate terminal: `pnpm dev`

Test with curl (replace `<valid-session-cookie>` with a real cookie from browser devtools after logging in as a customer):

```bash
curl -X POST http://localhost:3000/api/trial \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=<valid-session-cookie>" \
  -d '{"plan":"BASIC","billingCycle":"MONTHLY","websiteUrl":"https://example.com"}'
```

Expected: `{"trialId":"<uuid>"}` with status 201

Test duplicate prevention (run same request again):

Expected: `{"error":"You already have an active trial or subscription."}` with status 409

- [ ] **Step 4: Commit**

```bash
git add src/app/api/trial/route.ts
git commit -m "feat(api): add POST /api/trial to create 14-day maintenance trials"
```

---

## Task 6: Trial Onboarding Page

**Files:**
- Create: `src/app/(main)/trial/onboarding/page.tsx`

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p src/app/\(main\)/trial/onboarding
mkdir -p src/app/\(main\)/trial/subscribe
```

- [ ] **Step 2: Create the onboarding page**

```tsx
// src/app/(main)/trial/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPlan = (searchParams.get("plan") || "BASIC").toUpperCase() as "BASIC" | "PRO";

  const [plan, setPlan]               = useState<"BASIC" | "PRO">(defaultPlan === "PRO" ? "PRO" : "BASIC");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [websiteUrl, setWebsiteUrl]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

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
        <h2 className="text-white-2 text-3xl font-semibold mb-3">
          Start your free trial
        </h2>
        <p className="text-light-gray text-sm leading-relaxed">
          No credit card required. Full access for 14 days. Cancel anytime.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Selection */}
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
                <div className="text-xs opacity-70">
                  {p === "BASIC" ? "$29/mo or $290/yr" : "$99/mo or $990/yr"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Billing Cycle */}
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
                <div className="text-xs opacity-70">
                  {cycle === "ANNUAL" ? "Save 17%" : "Flexible"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Website URL */}
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
```

- [ ] **Step 3: Protect the route in `src/proxy.ts`**

Open `src/proxy.ts`. The existing auth guard already redirects unauthenticated users away from `/dashboard`. Add `/trial` to the same protected paths list. Find the section that defines protected routes and add `"/trial"`:

```ts
// find the array/condition that checks for protected paths and add:
pathname.startsWith("/trial")
```

> Exact edit depends on current proxy.ts implementation. Open the file, find the protected-paths check (it will contain `/dashboard`), and add `|| pathname.startsWith("/trial")` in the same condition.

- [ ] **Step 4: Verify page loads in browser**

Navigate to `http://localhost:3000/trial/onboarding`. If not logged in, expect redirect to `/auth/signin`. If logged in, expect the form to render.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(main\)/trial/onboarding/page.tsx src/proxy.ts
git commit -m "feat(trial): add /trial/onboarding form page with auth protection"
```

---

## Task 7: Trial Subscribe Page

**Files:**
- Create: `src/app/(main)/trial/subscribe/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// src/app/(main)/trial/subscribe/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceTrials } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSubscriptionCheckoutUrl } from "@/lib/payments/lemonsqueezy";
import Link from "next/link";
import { AlertTriangle, CheckCircle } from "lucide-react";

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
        <Link href="/services" className="text-orange-yellow-crayola hover:underline text-sm">
          ← Back to Services
        </Link>
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
        <Link href="/dashboard/subscription" className="text-orange-yellow-crayola hover:underline text-sm">
          Go to Dashboard →
        </Link>
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
        <p className="text-light-gray text-sm mb-6">
          Your 14-day trial has ended. Start a new trial to continue.
        </p>
        <Link
          href="/trial/onboarding"
          className="inline-flex items-center justify-center bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
        >
          Start a New Trial
        </Link>
      </div>
    );
  }

  // Trial is ACTIVE — generate checkout URL and redirect
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/trial/subscribe/page.tsx
git commit -m "feat(trial): add /trial/subscribe page — validates trial and redirects to LS checkout"
```

---

## Task 8: Cron Route — Trial Reminder Emails

**Files:**
- Create: `src/app/api/cron/trial-reminder/route.ts`

- [ ] **Step 1: Create the route**

```ts
// src/app/api/cron/trial-reminder/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { maintenanceTrials, users } from "@/lib/db/schema";
import { eq, and, isNull, lte, gt } from "drizzle-orm";
import { sendTrialReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  // Find trials expiring within the next 2 days that haven't been notified yet
  const expiringTrials = await db.query.maintenanceTrials.findMany({
    where: and(
      eq(maintenanceTrials.status, "ACTIVE"),
      gt(maintenanceTrials.trialEndsAt, now),
      lte(maintenanceTrials.trialEndsAt, twoDaysFromNow),
      isNull(maintenanceTrials.notifiedAt)
    ),
    with: { user: true },
  });

  let notified = 0;
  const errors: string[] = [];

  for (const trial of expiringTrials) {
    try {
      await sendTrialReminderEmail(
        trial.user.email,
        trial.user.name || "there",
        trial.plan,
        trial.id,
        trial.trialEndsAt
      );

      await db
        .update(maintenanceTrials)
        .set({ notifiedAt: new Date() })
        .where(eq(maintenanceTrials.id, trial.id));

      notified++;
    } catch (err: any) {
      errors.push(`Trial ${trial.id}: ${err.message}`);
    }
  }

  return NextResponse.json({
    message: `Notified ${notified} of ${expiringTrials.length} expiring trials.`,
    errors: errors.length > 0 ? errors : undefined,
  });
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/cron/trial-reminder/route.ts
git commit -m "feat(cron): add trial-reminder route — notifies users 2 days before trial expiry"
```

---

## Task 9: Extend LS Webhook — subscription_created

**Files:**
- Modify: `src/app/api/webhooks/lemonsqueezy/route.ts`

- [ ] **Step 1: Add `subscription_created` handler**

Open `src/app/api/webhooks/lemonsqueezy/route.ts`. After the closing brace of the `if (eventName === "order_created")` block and before the final `return NextResponse.json(...)`, add:

```ts
    if (eventName === "subscription_created") {
      const subData    = payload.data.attributes;
      const customData = payload.meta.custom_data || {};

      const userId      = customData.user_id as string | undefined;
      const trialId     = customData.trial_id as string | undefined;
      const plan        = customData.plan as "BASIC" | "PRO" | undefined;
      const billingCycle = customData.billing_cycle as "MONTHLY" | "ANNUAL" | undefined;

      if (!userId || !plan || !billingCycle) {
        console.error("[WEBHOOK] subscription_created: missing custom_data fields", customData);
        return NextResponse.json({ error: "Missing custom data" }, { status: 422 });
      }

      const lsSubscriptionId = payload.data.id.toString();
      const lsVariantId      = subData.variant_id?.toString() || "";
      const renewsAt         = subData.renews_at
        ? new Date(subData.renews_at)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Create subscription record
      await db.insert(subscriptions).values({
        userId,
        trialId:          trialId || null,
        plan,
        billingCycle,
        status:           "ACTIVE",
        lsSubscriptionId,
        lsVariantId,
        currentPeriodEnd: renewsAt,
      });

      // Mark trial as converted
      if (trialId) {
        await db
          .update(maintenanceTrials)
          .set({ status: "CONVERTED" })
          .where(eq(maintenanceTrials.id, trialId));
      }

      // Send confirmation email
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user?.email) {
        const { sendSubscriptionConfirmedEmail } = await import("@/lib/email");
        await sendSubscriptionConfirmedEmail(
          user.email,
          user.name || "there",
          plan,
          billingCycle,
          renewsAt
        );
      }
    }
```

- [ ] **Step 2: Add missing imports to the top of the webhook file**

The existing imports already have `orders, licenses, products, users`. Add the new tables:

```ts
import { orders, licenses, products, users, subscriptions, maintenanceTrials } from "@/lib/db/schema";
```

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/lemonsqueezy/route.ts
git commit -m "feat(webhook): handle subscription_created — create subscription record and mark trial converted"
```

---

## Task 10: Dashboard Subscription Page

**Files:**
- Create: `src/app/(main)/dashboard/subscription/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// src/app/(main)/dashboard/subscription/page.tsx
import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { maintenanceTrials, subscriptions } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
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
    const now        = new Date();
    const msLeft     = activeTrial.trialEndsAt.getTime() - now.getTime();
    const daysLeft   = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    const endDate    = activeTrial.trialEndsAt.toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
    const subscribeHref = `/trial/subscribe?id=${activeTrial.id}`;

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
              href={subscribeHref}
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
```

- [ ] **Step 2: Add "Subscription" link to the dashboard sidebar**

Open the dashboard sidebar/nav component (find it: `src/components/layout/` or similar). Add a nav item pointing to `/dashboard/subscription`. Look for the existing nav items like "Purchases", "Licenses" and add:

```tsx
{ href: "/dashboard/subscription", label: "Subscription", icon: Shield }
```

> Find the exact file by running: `grep -r "dashboard/purchases" src/components/ --include="*.tsx" -l`

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(main\)/dashboard/subscription/page.tsx src/components/
git commit -m "feat(dashboard): add subscription page showing trial and subscription states"
```

---

## Task 11: BillingToggle Client Component

**Files:**
- Create: `src/components/marketing/billing-toggle.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/marketing/billing-toggle.tsx
"use client";

import { useState } from "react";

interface Props {
  onChange: (cycle: "MONTHLY" | "ANNUAL") => void;
  defaultCycle?: "MONTHLY" | "ANNUAL";
}

export function BillingToggle({ onChange, defaultCycle = "ANNUAL" }: Props) {
  const [cycle, setCycle] = useState<"MONTHLY" | "ANNUAL">(defaultCycle);

  function toggle() {
    const next = cycle === "MONTHLY" ? "ANNUAL" : "MONTHLY";
    setCycle(next);
    onChange(next);
  }

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <span className={`text-sm ${cycle === "MONTHLY" ? "text-white-2 font-semibold" : "text-light-gray-70"}`}>
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={cycle === "ANNUAL"}
        onClick={toggle}
        className="relative w-12 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        style={{ background: cycle === "ANNUAL" ? "#10b981" : "#334155" }}
      >
        <span
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
          style={{ left: cycle === "ANNUAL" ? "calc(100% - 1.25rem)" : "0.25rem" }}
        />
      </button>
      <span className={`text-sm ${cycle === "ANNUAL" ? "text-white-2 font-semibold" : "text-light-gray-70"}`}>
        Annual
      </span>
      {cycle === "ANNUAL" && (
        <span className="text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
          Save 17%
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/marketing/billing-toggle.tsx
git commit -m "feat(ui): add BillingToggle client component"
```

---

## Task 12: MaintenanceCards Component

**Files:**
- Create: `src/components/marketing/maintenance-cards.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/marketing/maintenance-cards.tsx
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
    BASIC: cycle === "ANNUAL" ? "or $29/month" : "billed monthly",
    PRO:   cycle === "ANNUAL" ? "or $99/month" : "billed monthly",
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
            href={`/trial/onboarding?plan=BASIC`}
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
            href={`/trial/onboarding?plan=PRO`}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/marketing/maintenance-cards.tsx
git commit -m "feat(ui): add MaintenanceCards component with billing toggle"
```

---

## Task 13: Services Page Redesign

**Files:**
- Modify: `src/app/(main)/services/page.tsx`

- [ ] **Step 1: Replace the entire contents of `src/app/(main)/services/page.tsx`**

```tsx
// src/app/(main)/services/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Code2, MonitorSmartphone, Palette, Rocket, Search, Share2 } from "lucide-react";
import { MaintenanceCards } from "@/components/marketing/maintenance-cards";
import { withRetry } from "@/lib/db";
import { projects as projectsTable } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export const metadata: Metadata = {
  title:       "Services & Pricing | FestoUG",
  description: "Web development, custom projects, and ongoing maintenance plans. Clear pricing, no hidden fees.",
};

export const dynamic = "force-dynamic";

const SERVICE_CHIPS = [
  { icon: <Code2  className="w-4 h-4" />, label: "Web Development"    },
  { icon: <MonitorSmartphone className="w-4 h-4" />, label: "Mobile Apps" },
  { icon: <Palette className="w-4 h-4" />, label: "UI / UX Design"    },
  { icon: <Rocket  className="w-4 h-4" />, label: "E-commerce"        },
  { icon: <Search  className="w-4 h-4" />, label: "SEO & Marketing"   },
  { icon: <Share2  className="w-4 h-4" />, label: "Social Media"      },
];

const PROJECT_TIERS = [
  {
    name:    "Lite",
    price:   "$999",
    note:    "Best for landing pages & simple sites",
    popular: false,
    features: [
      "Up to 5 pages",
      "Responsive design",
      "Basic SEO setup",
      "Contact form",
      "2 revision rounds",
    ],
  },
  {
    name:    "Premium",
    price:   "$2,499",
    note:    "Full website with CMS & authentication",
    popular: true,
    features: [
      "Up to 15 pages",
      "CMS integration",
      "Auth system",
      "Admin dashboard",
      "API integrations",
      "5 revision rounds",
    ],
  },
  {
    name:    "Pro",
    price:   "$4,999",
    note:    "Full platform with custom backend",
    popular: false,
    features: [
      "Unlimited pages",
      "Custom backend & API",
      "Third-party integrations",
      "Performance optimization",
      "Deployment & CI/CD",
      "Unlimited revisions",
    ],
  },
];

export default async function ServicesPage() {
  return (
    <div className="animate-in fade-in duration-500">

      {/* Page Header */}
      <header className="mb-16 xl:max-w-[60%]">
        <h2 className="text-white-2 text-3xl md:text-5xl font-semibold mb-6 pb-5 capitalize relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-orange-yellow-crayola before:rounded-sm">
          Services <span className="text-light-gray-70 font-light">&amp; Pricing</span>
        </h2>
        <p className="text-light-gray text-base md:text-lg leading-relaxed">
          From one-time builds to ongoing maintenance — clear pricing, no hidden fees.
        </p>
      </header>

      {/* ── 01 What I Build ── */}
      <section className="mb-16">
        <h3 className="text-xl font-semibold text-white-2 mb-6 flex items-center gap-3">
          <span className="text-orange-yellow-crayola">01.</span> What I Build
        </h3>
        <div className="flex flex-wrap gap-3">
          {SERVICE_CHIPS.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-eerie-black-1 border border-jet rounded-xl px-4 py-2.5 text-sm text-light-gray"
            >
              <span className="text-orange-yellow-crayola">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-jet to-transparent mb-16" />

      {/* ── 02 Project Tiers ── */}
      <section className="mb-16">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">02.</span> Custom Project Pricing
          </h3>
          <p className="text-light-gray text-sm">Fixed-scope builds. You own everything. One-time payment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl p-6 border ${
                tier.popular
                  ? "bg-eerie-black-1 border-orange-yellow-crayola/60 relative"
                  : "bg-eerie-black-1 border-jet"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-yellow-crayola text-smoky-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <p className="text-xs font-semibold uppercase tracking-widest text-light-gray-70 mb-4">
                {tier.name}
              </p>
              <div className="mb-1">
                <span className="text-3xl font-extrabold text-white-2 tracking-tight">{tier.price}</span>
              </div>
              <p className="text-xs text-light-gray-70 mb-6">one-time payment · {tier.note}</p>
              <ul className="flex-1 space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-light-gray">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-yellow-crayola flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/get-started?tier=${tier.name.toLowerCase()}`}
                className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tier.popular
                    ? "bg-orange-yellow-crayola text-smoky-black hover:bg-orange-yellow-crayola/90"
                    : "border border-jet text-light-gray-70 hover:bg-jet hover:text-white-2"
                }`}
              >
                Get Started →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-jet to-transparent mb-16" />

      {/* ── 03 Maintenance Plans ── */}
      <section>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">03.</span> Monthly Maintenance &amp; Support
          </h3>
          <p className="text-light-gray text-sm">
            Keep your site fast, secure, and up to date — without lifting a finger.
          </p>
        </div>

        <MaintenanceCards />
      </section>

    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Navigate to `http://localhost:3000/services` in browser. Confirm:
- Section 01 shows 6 service chips
- Section 02 shows 3 project tier cards (Premium has "Most Popular" badge)
- Section 03 shows maintenance cards with billing toggle defaulting to Annual

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(main\)/services/page.tsx
git commit -m "feat(services): redesign /services page with 3 sections and maintenance subscription plans"
```

---

## Task 14: Vercel Cron + Environment Variables

> **ACTION REQUIRED FROM FESTO:**
> Add these to `.env.local` (and to Vercel project env vars in the dashboard):
> ```env
> CRON_SECRET=<generate with: openssl rand -hex 32>
> LS_VARIANT_BASIC_MONTHLY=<from Lemon Squeezy dashboard>
> LS_VARIANT_BASIC_ANNUAL=<from Lemon Squeezy dashboard>
> LS_VARIANT_PRO_MONTHLY=<from Lemon Squeezy dashboard>
> LS_VARIANT_PRO_ANNUAL=<from Lemon Squeezy dashboard>
> ```

**Files:**
- Create/Modify: `vercel.json`

- [ ] **Step 2: Create or update `vercel.json`**

Check if the file exists: `ls vercel.json`. If it exists, open it and merge the `crons` key. If it doesn't exist, create:

```json
{
  "crons": [
    {
      "path":     "/api/cron/trial-reminder",
      "schedule": "0 9 * * *"
    }
  ]
}
```

> The schedule `0 9 * * *` runs daily at 09:00 UTC. Vercel automatically sends the `Authorization: Bearer <CRON_SECRET>` header when `CRON_SECRET` is set in project env vars.

- [ ] **Step 3: Verify Vercel cron setup in local dev (optional)**

Simulate the cron call manually to confirm it works:

```bash
curl -X GET http://localhost:3000/api/cron/trial-reminder \
  -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)"
```

Expected: `{"message":"Notified 0 of 0 expiring trials."}` (0 trials in dev is fine)

- [ ] **Step 4: Commit**

```bash
git add vercel.json
git commit -m "feat(cron): configure Vercel daily cron for trial-reminder at 09:00 UTC"
```

---

## Task 15: Final Build Verification

- [ ] **Step 1: Run production build**

```bash
pnpm build
```

Expected: `✓ Compiled successfully` with no TypeScript or build errors. Address any errors before proceeding.

- [ ] **Step 2: Smoke test the full trial flow in browser**

1. Go to `http://localhost:3000/services` — confirm 3 sections render
2. Click "Start Free Trial" on Basic card — redirected to `/trial/onboarding`
3. Log in if prompted, fill form, submit — redirected to `/dashboard/subscription`
4. Dashboard shows "X days left" trial card with "Subscribe Now" button
5. Click "Subscribe Now" — redirected to `/trial/subscribe?id=<id>` → then to Lemon Squeezy (requires real variant IDs in env)

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete pricing & subscription system — services redesign, 14-day trial, maintenance plans"
```

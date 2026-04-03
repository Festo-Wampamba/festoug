# Pricing & Subscription System Design

**Date:** 2026-04-03  
**Status:** Approved  
**Author:** Festo Wampamba  

---

## Overview

Add a complete pricing and subscription system to the FestoUG portfolio website. The system covers three revenue streams: a digital code store (one-time), custom project builds (one-time, quote-based), and ongoing maintenance plans (subscription with a 14-day card-free trial).

---

## Decisions Made

| Decision | Choice | Reason |
|----------|--------|--------|
| Page structure | Services-Expanded Hybrid | Expand `/services` into 3 sections; no new hub page needed |
| Subscription approach | Intent-First Trial (Approach B) | Matches freelance context; card-free trial without LS workarounds |
| Trial type | 14-day, card-free | Lower friction; user subscribes only if satisfied |
| Billing cycles | Monthly + Annual (save 17%) | Annual = 10× monthly price |
| Billing toggle UI | Global toggle above all cards | Cleaner than per-card switches |
| Payment provider | Lemon Squeezy (existing) | Already integrated; supports subscription products |

---

## Revenue Streams

### 1. Digital Store — One-Time Purchases
- **URL:** `/store` (already exists and works)
- **Payment:** Lemon Squeezy checkout (already implemented)
- **Change required:** UI/copy polish only — no backend changes

### 2. Custom Projects — One-Time Quote
- **URL:** `/services` Section 2 → `/get-started`
- **Tiers:**
  - Lite — $999 one-time (landing page, up to 5 pages, 2 revisions)
  - Premium — $2,499 one-time (full site, CMS, auth, 5 revisions) — **Most Popular**
  - Pro — $4,999 one-time (full platform, custom backend, unlimited revisions)
- **Payment:** Manual invoice after scoping call (no checkout automation needed)
- **Change required:** UI redesign of Section 2 on `/services` only

### 3. Maintenance Plans — Subscription
- **URL:** `/services` Section 3 → `/trial/onboarding`
- **Tiers:**

  | Plan | Monthly | Annual | Included |
  |------|---------|--------|----------|
  | Basic | $29/mo | $290/yr | Monthly updates, security monitoring, uptime checks, email support |
  | Pro | $99/mo | $990/yr | Everything in Basic + server management, performance tuning, priority support, monthly report |
  | Enterprise | Contact | Contact | Everything in Pro + dedicated support, custom SLA, multiple projects, quarterly strategy call |

- **Trial:** 14 days free, no credit card required
- **Payment:** Lemon Squeezy subscription checkout after trial

---

## Architecture

### What is new vs existing

| Component | Status |
|-----------|--------|
| `/store` checkout | ✅ Existing — no changes |
| `/get-started` form | ✅ Existing — no changes |
| `/services` page | 🔄 Full redesign |
| DB schema (trial + subscription tables) | 🆕 New |
| `/trial/onboarding` page | 🆕 New |
| `/trial/subscribe` redirect page | 🆕 New |
| `POST /api/trial` | 🆕 New |
| `GET /api/cron/trial-reminder` | 🆕 New |
| `/dashboard/subscription` page | 🆕 New |
| LS webhook — `subscription_created` handler | 🔄 Extended |
| Lemon Squeezy — 4 subscription variants | 🆕 Manual setup in LS dashboard |

---

## Database Schema

### New Enums

```ts
// src/lib/db/schema.ts

export const maintenancePlan = pgEnum('maintenancePlan', ['BASIC', 'PRO', 'ENTERPRISE'])
export const billingCycle    = pgEnum('billingCycle',    ['MONTHLY', 'ANNUAL'])
export const trialStatus     = pgEnum('trialStatus',     ['ACTIVE', 'EXPIRED', 'CONVERTED'])
export const subscriptionStatus = pgEnum('subscriptionStatus', ['ACTIVE', 'CANCELLED', 'EXPIRED'])
```

### New Table: `maintenanceTrial`

```ts
export const maintenanceTrial = pgTable('maintenanceTrial', {
  id:            uuid('id').primaryKey().defaultRandom(),
  userId:        uuid('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  plan:          maintenancePlan('plan').notNull(),
  billingCycle:  billingCycle('billingCycle').notNull(),
  websiteUrl:    text('websiteUrl').notNull(),
  status:        trialStatus('status').notNull().default('ACTIVE'),
  trialStartsAt: timestamp('trialStartsAt').notNull().defaultNow(),
  trialEndsAt:   timestamp('trialEndsAt').notNull(),   // trialStartsAt + 14 days
  notifiedAt:    timestamp('notifiedAt'),              // set when day-12 reminder is sent
  createdAt:     timestamp('createdAt').notNull().defaultNow(),
})
```

### New Table: `subscription`

```ts
export const subscription = pgTable('subscription', {
  id:                uuid('id').primaryKey().defaultRandom(),
  userId:            uuid('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  trialId:           uuid('trialId').references(() => maintenanceTrial.id),
  plan:              maintenancePlan('plan').notNull(),
  billingCycle:      billingCycle('billingCycle').notNull(),
  status:            subscriptionStatus('status').notNull().default('ACTIVE'),
  lsSubscriptionId:  text('lsSubscriptionId').notNull(),  // Lemon Squeezy subscription ID
  lsVariantId:       text('lsVariantId').notNull(),
  currentPeriodEnd:  timestamp('currentPeriodEnd').notNull(),
  cancelledAt:       timestamp('cancelledAt'),
  createdAt:         timestamp('createdAt').notNull().defaultNow(),
})
```

---

## Trial Flow

```
User on /services
  └─ clicks "Start Free Trial" on Basic or Pro card
       └─ if not logged in → redirect to /auth/signin?callbackUrl=/trial/onboarding?plan=<plan>
       └─ redirected to /trial/onboarding (requires authentication)
            └─ fills form: website URL, plan (pre-filled from query param), billing cycle
                 └─ POST /api/trial
                      ├─ validates: user has no existing ACTIVE trial or subscription
                      ├─ creates maintenanceTrial row (status: ACTIVE, trialEndsAt: +14 days)
                      ├─ sends welcome email via Resend
                      └─ redirects to /dashboard/subscription (trial active state)

Day 12 (Vercel Cron — daily at 09:00 UTC):
  GET /api/cron/trial-reminder
    └─ requires Authorization: Bearer <CRON_SECRET> header (set in vercel.json)
    └─ queries trials where trialEndsAt > now AND trialEndsAt <= now+2days AND notifiedAt IS NULL
         └─ sends reminder email with subscribe link (/trial/subscribe?id=<trialId>)
         └─ sets notifiedAt = now

User clicks subscribe link in email:
  /trial/subscribe?id=<trialId>
    └─ if not logged in → redirect to /auth/signin?callbackUrl=/trial/subscribe?id=<trialId>
    └─ validates trial ownership (trial.userId === session.user.id)
    └─ if trial EXPIRED → show expired message with CTA to start a new trial
    └─ if trial CONVERTED → redirect to /dashboard/subscription (already subscribed)
    └─ if trial ACTIVE → generates Lemon Squeezy checkout URL for correct variant (plan + billingCycle)
    └─ redirects to LS hosted checkout

After payment (LS webhook — subscription_created):
  └─ creates subscription row
  └─ updates maintenanceTrial status → CONVERTED
  └─ sends confirmation email
```

### New env variable required

```env
CRON_SECRET=<random secret>   # used to authenticate Vercel cron calls
```

---

## Lemon Squeezy Setup (Manual)

Create 4 subscription variants in the LS dashboard and add their variant IDs to `.env.local`:

```env
LS_VARIANT_BASIC_MONTHLY=<id>
LS_VARIANT_BASIC_ANNUAL=<id>
LS_VARIANT_PRO_MONTHLY=<id>
LS_VARIANT_PRO_ANNUAL=<id>
```

These are mapped in `src/lib/payments/lemonsqueezy.ts` to the plan + billingCycle combination.

---

## New Routes & Files

| Path | Type | Purpose |
|------|------|---------|
| `src/app/(main)/services/page.tsx` | Modified | Full redesign — 3 sections with billing toggle |
| `src/components/marketing/billing-toggle.tsx` | New | Client component — monthly/annual toggle with live price switching |
| `src/components/marketing/maintenance-cards.tsx` | New | Maintenance plan cards (receives billingCycle prop) |
| `src/app/(main)/trial/onboarding/page.tsx` | New | Trial signup form |
| `src/app/(main)/trial/subscribe/page.tsx` | New | Validates trial → redirects to LS checkout |
| `src/app/(main)/dashboard/subscription/page.tsx` | New | Shows active trial or subscription status |
| `src/app/api/trial/route.ts` | New | POST — creates trial, sends welcome email |
| `src/app/api/cron/trial-reminder/route.ts` | New | GET — Vercel cron, sends day-12 reminder emails |
| `src/lib/db/schema.ts` | Modified | Add 2 tables + 4 enums |
| `src/lib/payments/lemonsqueezy.ts` | Modified | Add subscription variant map + `getSubscriptionCheckoutUrl()` |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | Modified | Handle `subscription_created` event |
| `vercel.json` | New/Modified | Add cron job definition for trial-reminder |

---

## Services Page — Section Structure

```
/services
  ├── Hero  "Everything you need to build and grow online"
  │
  ├── 01 — What I Build
  │     Service chips: Web Dev, Mobile, UI/UX, E-commerce, SEO, Social
  │
  ├── ── divider ──
  │
  ├── 02 — Custom Projects  (one-time)
  │     Cards: Lite $999 | Premium $2,499 [Popular] | Pro $4,999
  │     Each "Get Started →" links to /get-started?tier=<tier>
  │
  ├── ── divider ──
  │
  └── 03 — Ongoing Maintenance  (subscription)
        Global billing toggle: Monthly ↔ Annual [Save 17%]
        Cards: Basic $29/$290 | Pro $99/$990 [Popular] | Enterprise Custom
        Trial notice bar: "14-day free trial — no credit card required"
```

---

## Email Templates Required

| Template | Trigger | Sent via |
|----------|---------|----------|
| Trial welcome | Trial created | Resend |
| Trial reminder (day 12) | Cron job | Resend |
| Subscription confirmed | LS webhook `subscription_created` | Resend |

---

## Customer Dashboard — Subscription Page

`/dashboard/subscription` shows one of three states:

1. **No trial** — CTA to start free trial
2. **Trial active** — days remaining, subscribe button, cancel link
3. **Subscribed** — plan name, billing cycle, next renewal date, manage/cancel link

---

## Out of Scope

- FlutterWave integration (enum exists, not implemented)
- Self-service subscription cancellation portal (handled via email to Festo)
- Admin subscription management UI (can use LS dashboard directly)
- Automated invoice PDF generation

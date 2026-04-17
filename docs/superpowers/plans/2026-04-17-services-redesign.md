# Services Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all pricing from the public Services page, refocus it on web development / server admin / networking expertise, and remove the Subscriptions link from the admin nav.

**Architecture:** Three targeted file edits — the services page, the maintenance-cards component, and the admin nav. No new files, no DB changes, no API changes.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, lucide-react

---

## File Map

| File | What changes |
|---|---|
| `src/app/(main)/services/page.tsx` | New chips, new project-type cards, updated headings & metadata |
| `src/components/marketing/maintenance-cards.tsx` | Remove billing toggle + prices, new CTAs |
| `src/components/admin/admin-nav.tsx` | Remove Subscriptions nav item |

---

### Task 1: Update the admin nav — remove Subscriptions link

**Files:**
- Modify: `src/components/admin/admin-nav.tsx`

- [ ] **Step 1: Open the file and locate the Subscriptions entry**

In `src/components/admin/admin-nav.tsx`, find line 31:
```ts
{ label: "Subscriptions", short: "Subs", href: "/admin/subscriptions", icon: Shield },
```

- [ ] **Step 2: Remove the Subscriptions entry**

Delete that line. The `Shield` import on line 17 is no longer used — remove it too.

The updated imports block becomes:
```ts
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  PenSquare,
  ArrowLeft,
  Users,
  Star,
  FolderKanban,
  MessageSquareQuote,
  RefreshCw,
  Inbox,
} from "lucide-react";
```

The updated `navItems` array becomes:
```ts
const navItems = [
  { label: "Overview",     short: "Overview",  href: "/admin",              icon: LayoutDashboard },
  { label: "Products",     short: "Products",  href: "/admin/products",     icon: Package },
  { label: "Orders",       short: "Orders",    href: "/admin/orders",       icon: ShoppingBag },
  { label: "Reviews",      short: "Reviews",   href: "/admin/reviews",      icon: Star },
  { label: "Customers",    short: "Customers", href: "/admin/customers",    icon: Users },
  { label: "Portfolio",    short: "Portfolio", href: "/admin/portfolio",    icon: FolderKanban },
  { label: "Testimonials", short: "Testim.",   href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Blog Posts",   short: "Blog",      href: "/admin/blog",         icon: FileText },
  { label: "Inquiries",    short: "Inquiries", href: "/admin/inquiries",    icon: Inbox },
  { label: "New Post",     short: "New Post",  href: "/admin/blog/new",     icon: PenSquare },
  { label: "LS Sync",      short: "LS Sync",   href: "/admin/ls-sync",      icon: RefreshCw },
];
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd /home/festo/festoug && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors referencing `admin-nav.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/admin-nav.tsx
git commit -m "feat(admin): remove Subscriptions from admin nav"
```

---

### Task 2: Rewrite the MaintenanceCards component — strip pricing

**Files:**
- Modify: `src/components/marketing/maintenance-cards.tsx`

- [ ] **Step 1: Replace the entire file content**

```tsx
"use client";

import Link from "next/link";

const TIERS = [
  {
    name: "Basic",
    description: "Essential upkeep for small sites",
    features: [
      "Monthly updates",
      "Security monitoring",
      "Uptime checks",
      "Email support",
    ],
    cta: { label: "Get Started →", href: "/get-started?service=support" },
    featured: false,
  },
  {
    name: "Pro",
    description: "Full management for growing projects",
    features: [
      "Everything in Basic",
      "Server management",
      "Performance tuning",
      "Priority support",
      "Monthly report",
    ],
    cta: { label: "Get Started →", href: "/get-started?service=support" },
    featured: true,
  },
  {
    name: "Enterprise",
    description: "Tailored to your needs",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom SLA",
      "Multiple projects",
      "Quarterly strategy call",
    ],
    cta: { label: "Contact Us →", href: "/contact" },
    featured: false,
  },
];

export function MaintenanceCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`bg-eerie-black-1 rounded-2xl p-6 flex flex-col ${
            tier.featured
              ? "border-2 border-green-500 relative"
              : "border border-jet"
          }`}
        >
          {tier.featured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
              Most Popular
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-widest text-light-gray-70 mb-2">
            {tier.name}
          </p>
          <p className="text-sm text-light-gray mb-6">{tier.description}</p>
          <ul className="flex-1 space-y-2 mb-6">
            {tier.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-light-gray">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={tier.cta.href}
            className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tier.featured
                ? "bg-green-500 text-white hover:bg-green-600"
                : "border border-jet text-light-gray-70 hover:bg-jet hover:text-white-2"
            }`}
          >
            {tier.cta.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/festo/festoug && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/maintenance-cards.tsx
git commit -m "feat(services): remove pricing from maintenance cards, add inquiry CTAs"
```

---

### Task 3: Rewrite the Services page

**Files:**
- Modify: `src/app/(main)/services/page.tsx`

- [ ] **Step 1: Replace the entire file content**

```tsx
import { Metadata } from "next";
import Link from "next/link";
import { Code2, Server, Globe, Network, Cpu, Search } from "lucide-react";
import { MaintenanceCards } from "@/components/marketing/maintenance-cards";

export const metadata: Metadata = {
  title:       "Services & Expertise | FestoUG",
  description: "Web development, server administration, network engineering, and ongoing technical support.",
};

export const dynamic = "force-dynamic";

const SERVICE_CHIPS = [
  { icon: <Code2   className="w-4 h-4" />, label: "Web Development"      },
  { icon: <Server  className="w-4 h-4" />, label: "Server Administration" },
  { icon: <Globe   className="w-4 h-4" />, label: "Web Server Management" },
  { icon: <Network className="w-4 h-4" />, label: "Network Engineering"   },
  { icon: <Cpu     className="w-4 h-4" />, label: "IT Infrastructure"     },
  { icon: <Search  className="w-4 h-4" />, label: "SEO & Marketing"       },
];

const PROJECT_TYPES = [
  {
    name: "Web Projects",
    items: [
      "Custom websites & web apps",
      "CMS integration",
      "E-commerce & online stores",
      "SEO-ready builds",
      "Performance optimization",
    ],
  },
  {
    name: "Infrastructure & Servers",
    items: [
      "Server setup, hardening & deployment",
      "Nginx / Apache / cPanel setup",
      "SSL certificates & renewals",
      "Automated backups & monitoring",
      "CI/CD pipelines",
    ],
  },
  {
    name: "Networking",
    items: [
      "Network design & configuration",
      "Firewall & VPN setup",
      "LAN / WAN troubleshooting",
      "IP addressing & subnetting",
      "DNS management",
    ],
  },
];

export default async function ServicesPage() {
  return (
    <div className="animate-in fade-in duration-500">

      {/* Page Header */}
      <header className="mb-16 xl:max-w-[60%]">
        <h2 className="text-white-2 text-3xl md:text-5xl font-semibold mb-6 pb-5 capitalize relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-orange-yellow-crayola before:rounded-sm">
          Services <span className="text-light-gray-70 font-light">&amp; Expertise</span>
        </h2>
        <p className="text-light-gray text-base md:text-lg leading-relaxed">
          From building websites to managing servers and networks — here&apos;s how I can help.
        </p>
      </header>

      {/* ── 01 What I Offer ── */}
      <section className="mb-16">
        <h3 className="text-xl font-semibold text-white-2 mb-6 flex items-center gap-3">
          <span className="text-orange-yellow-crayola">01.</span> What I Offer
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

      {/* ── 02 What I Work On ── */}
      <section className="mb-16">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">02.</span> What I Work On
          </h3>
          <p className="text-light-gray text-sm">Tell me what you need — I&apos;ll give you a quote.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_TYPES.map((type) => (
            <div
              key={type.name}
              className="flex flex-col rounded-2xl p-6 bg-eerie-black-1 border border-jet"
            >
              <p className="text-sm font-semibold text-white-2 mb-4">{type.name}</p>
              <ul className="flex-1 space-y-2 mb-6">
                {type.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-light-gray">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-yellow-crayola flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/get-started"
                className="block text-center py-2.5 rounded-xl border border-jet text-light-gray-70 text-sm font-semibold hover:bg-jet hover:text-white-2 transition-colors"
              >
                Get Started →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-jet to-transparent mb-16" />

      {/* ── 03 Ongoing Support ── */}
      <section>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">03.</span> Ongoing Support
          </h3>
          <p className="text-light-gray text-sm">
            Keep your site and systems running — I handle the technical side.
          </p>
        </div>

        <MaintenanceCards />
      </section>

    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/festo/festoug && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/(main)/services/page.tsx
git commit -m "feat(services): replace pricing with expertise focus, update all sections"
```

---

### Task 4: Visual verification in browser

- [ ] **Step 1: Start the dev server**

```bash
cd /home/festo/festoug && pnpm dev
```

- [ ] **Step 2: Check the public Services page**

Open `http://localhost:3000/services` and verify:
- Title reads "Services & Expertise"
- 6 chips visible: Web Development, Server Administration, Web Server Management, Network Engineering, IT Infrastructure, SEO & Marketing
- Section 02 shows 3 cards (Web Projects, Infrastructure & Servers, Networking) with no prices
- Section 03 shows 3 support tier cards with no prices, no billing toggle, no trial banner
- "Get Started →" buttons on Basic and Pro tiers link to `/get-started?service=support`
- "Contact Us →" button on Enterprise links to `/contact`

- [ ] **Step 3: Check the admin nav**

Open `http://localhost:3000/admin` and verify:
- "Subscriptions" link is gone from the sidebar
- All other nav items still present

- [ ] **Step 4: Final commit if any polish applied**

```bash
git add -p
git commit -m "fix(services): visual polish after browser check"
```

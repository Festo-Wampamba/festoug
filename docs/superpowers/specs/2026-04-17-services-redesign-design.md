# Services Page Redesign — No Pricing, Expertise Focus

**Date:** 2026-04-17  
**Approach:** Option B — Remap existing structure, swap content

## Goal

Remove all pricing from the public Services page and the admin navigation. Refocus the page on the owner's core expertise: web development, server administration, web server management, network engineering, and IT infrastructure. CTAs direct visitors to an inquiry form instead of pricing tiers or free trials.

---

## Files to Change

| File | Change |
|---|---|
| `src/app/(main)/services/page.tsx` | Rename title, update chips, replace pricing cards with project type cards, update section headers |
| `src/components/marketing/maintenance-cards.tsx` | Remove billing toggle + prices, rename to support tiers, swap CTAs to `/get-started` |
| `src/components/admin/admin-nav.tsx` | Remove "Subscriptions" nav item |

---

## Section 01 — What I Offer (chips)

Replace `SERVICE_CHIPS` with:

- Web Development
- Server Administration
- Web Server Management
- Network Engineering
- IT Infrastructure
- SEO & Marketing

Icons: Code2, Server, Globe, Network, Cpu, Search (all from lucide-react).

---

## Section 02 — Project Types (replaces Custom Project Pricing)

Three cards, no prices, no tiers. Heading changes to **"02. What I Work On"**. Subtitle: *"Tell me what you need — I'll give you a quote."*

### Web Projects
- Custom websites & web apps
- CMS integration
- E-commerce & online stores
- SEO-ready builds
- Performance optimization

### Infrastructure & Servers
- Server setup, hardening & deployment
- Nginx / Apache / cPanel setup
- SSL certificates & renewals
- Automated backups & monitoring
- CI/CD pipelines

### Networking
- Network design & configuration
- Firewall & VPN setup
- LAN / WAN troubleshooting
- IP addressing & subnetting
- DNS management

CTA on each card: **"Get Started →"** → `/get-started`  
No "Most Popular" badge. No price display. Cards are visually equal weight.

---

## Section 03 — Ongoing Support (replaces Monthly Maintenance & Support)

Heading: **"03. Ongoing Support"**  
Subtitle: *"Keep your site and systems running — I handle the technical side."*

Remove: `BillingToggle`, all price displays (`$290/yr`, `$99/mo`, etc.), trial notice banner.  
Keep: feature lists for Basic, Pro, Enterprise tiers.  
CTA: **"Get Started →"** → `/get-started?service=support` for Basic and Pro; **"Contact Us →"** → `/contact` for Enterprise.

---

## Admin Nav

Remove the `{ label: "Subscriptions", ... }` entry from `navItems` in `admin-nav.tsx`.  
The `/admin/subscriptions` page and its route remain — just no nav link.

---

## Page Metadata

- Title: `"Services & Expertise | FestoUG"`
- Description: `"Web development, server administration, network engineering, and ongoing technical support."`

---

## Out of Scope

- The `/admin/subscriptions` page content — not deleted, just unlinked from nav
- The `/trial/onboarding` and `/get-started` pages — no changes
- Any DB schema or API routes

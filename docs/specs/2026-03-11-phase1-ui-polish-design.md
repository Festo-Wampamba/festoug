# Phase 1: UI/UX Polish — Design Spec

**Date:** 2026-03-11
**Scope:** Testimonials redesign, clients marquee, sign-in/sign-up redesign, forgot password flow

## 1. Testimonial Cards Redesign

### Schema Change

Add two columns to the existing `testimonials` table:

```
rating: integer (1-5), default 5, not null — with CHECK constraint (rating >= 1 AND rating <= 5)
role: text (e.g. "CEO", "Developer"), nullable
```

Update seed data to include ratings and roles for existing testimonials. Since testimonials have no unique constraint, the seed script should delete existing rows before re-inserting to avoid duplicates on re-runs.

Admin CRUD for testimonials is deferred to Phase 3. For now, ratings/roles are managed via the seed script or direct DB edits.

### Component: `TestimonialCard`

Replace the current flat card with a richer design:

- **Header row:** Avatar (48px, rounded, accent border) + name + role text
- **Star rating:** Gold filled stars (amber-400) + gray empty stars, rendered from the `rating` field
- **Quote body:** Italic text, `text-light-gray`, good line-height
- **Footer accent:** Decorative quote mark in `orange-yellow-crayola/60` + divider line
- **Card styling:** `bg-gradient-to-br from-[hsl(240,1%,25%)] to-[hsl(0,0%,19%)]` (matching existing gradient pattern), `border-jet`, `rounded-2xl`, padding 24px

### Homepage Integration

Keep the existing horizontal scroll with snap. The card layout changes but the container stays the same. Cards min-width ~320px.

### Files Modified

- `src/lib/db/schema.ts` — add `rating`, `role` columns to `testimonials`
- `src/components/marketing/testimonial-card.tsx` — rewrite component
- `src/app/(main)/page.tsx` — pass new props (rating, role)
- Seed script — update with ratings/roles
- Run `drizzle-kit push` after schema change (additive migration, no data loss)

---

## 2. Clients Auto-Scroll Marquee

### Approach

CSS-only infinite marquee using `@keyframes`. No JS, no new dependencies.

### Implementation

- **Duplicate the logo strip** — render the 6 logos twice in a row so the scroll loops seamlessly
- **CSS animation:** `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }` applied to the inner container
- **Hover behavior:** `hover:pause` — the container's `animation-play-state: paused` on hover
- **Logo states:** Default: `grayscale(1) opacity-50`. Hover: `grayscale(0) opacity-100` + accent border glow
- **Speed:** ~30s for full cycle (adjustable via CSS variable)
- **Overflow:** Container has `overflow: hidden` with fade edges using gradient masks on left/right
- **Accessibility:** Add `@media (prefers-reduced-motion: reduce)` to disable animation and show static logos instead

### Files Modified

- `src/app/(main)/page.tsx` — replace the static clients scroll section with the marquee component
- `src/app/globals.css` — add `@keyframes marquee` animation + reduced motion media query

---

## 3. Sign-in / Sign-up UI Redesign

### Coastal Midnight Color Palette

The sign-in/sign-up forms use a "coastal midnight" palette — deep ocean floor up to moonlit seafoam:

| # | Token | Hex | Usage |
|---|-------|-----|-------|
| 1 | `BG` | `#0B1120` | Page background, deepest layer |
| 2 | `Surface` | `#111C35` | Card background, form container |
| 3 | `Border` | `#1A2845` | Card borders, input borders (default) |
| 4 | `Ocean` | `#5BA4CF` | Primary accent — focused input borders, labels, links, focus rings |
| 5 | `Dusk` | `#E8A87C` | Warm accent — submit button, highlights, "forgot password" hover |
| 6 | `Text` | `#D6E4F0` | Primary text color on forms |
| 7 | `Muted` | `#5D7A9A` | Secondary text — placeholders, subtitles, dividers |

Hero triad: `#0B1120` · `#5BA4CF` · `#E8A87C`

### Changes (both pages)

- **Page background:** `bg-[#0B1120]` full-bleed behind the form
- **Card background:** `bg-[#111C35]` + `border-[#1A2845]` outer border + subtle `shadow-[0_0_40px_rgba(91,164,207,0.08)]` glow
- **Input borders:** `border-[#1A2845]` default, `focus:border-[#5BA4CF] focus:ring-1 focus:ring-[#5BA4CF]/30` on focus
- **Input background:** `bg-[#0B1120]` (darker than card surface, so inputs are recessed)
- **Input text:** `text-[#D6E4F0]`, placeholder `text-[#5D7A9A]`
- **Labels:** Add visible `<label>` elements above each input, styled `text-[#5BA4CF] text-xs font-semibold tracking-wide`
- **OAuth buttons:** Replace `Github` and `Chrome` lucide icons with inline SVG brand icons (GitHub Octocat, Google "G" logo). Buttons styled with `border-[#1A2845] bg-[#0B1120] hover:border-[#5BA4CF]/40 text-[#D6E4F0]`
- **Forgot password:** `text-[#E8A87C]` link below the password field, linking to `/auth/forgot-password`
- **Post-reset redirect:** Handle `?reset=true` query param to show "Password reset successfully" message on sign-in page
- **Dividers:** "or with email" separator uses `border-[#1A2845]` line + `text-[#5D7A9A]` label
- **Submit button:** `bg-[#E8A87C] text-[#0B1120] font-bold` (warm dusk accent — high contrast against the cold palette)
- **Secondary links:** "Create one" / "Sign in" in `text-[#5BA4CF]`
- **Sign-up page:** Same coastal midnight styling

### Files Modified

- `src/app/(main)/auth/signin/page.tsx` — restyle inputs, add labels, add forgot password link, replace OAuth icons, handle `?reset=true`
- `src/app/(main)/auth/signup/page.tsx` — restyle inputs, add labels, replace OAuth icons

---

## 4. Forgot Password Flow (Resend)

### New Dependency

- `resend` npm package (free tier: 100 emails/day)

### Env Variables

```
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com  # or onboarding@resend.dev for testing
```

Uses `NEXT_PUBLIC_APP_URL` (already defined in `.env.local`) for building the reset link URL.

### Schema Change

Add a `password_reset_token` table (Drizzle export: `passwordResetTokens`, SQL table: `password_reset_token`):

```
id: uuid, primary key, default random
userId: uuid, references user.id, cascade delete
token: text, not null, unique (implicit index via unique constraint)
expiresAt: timestamp, not null
createdAt: timestamp, default now
```

### Flow

1. User clicks "Forgot password?" on sign-in page
2. `/auth/forgot-password` page — user enters email, submits
3. `POST /api/auth/forgot-password` — looks up user by email. **Only sends reset email if user has a `passwordHash` (credentials user).** OAuth-only users get the same generic response but no email is sent. Generates token via `crypto.randomBytes(32).toString('hex')` (256 bits), stores in `password_reset_token` table with 1-hour expiry, deletes any existing tokens for that user first, sends email via Resend with reset link
4. Email contains link: `${NEXT_PUBLIC_APP_URL}/auth/reset-password?token={token}`
5. `/auth/reset-password` page — validates token (exists + not expired), shows new password form
6. `POST /api/auth/reset-password` — validates token again, enforces minimum 8 character password (matching sign-up validation), hashes new password with bcrypt, updates user's `passwordHash`, deletes the token
7. Redirect to `/auth/signin?reset=true` with success message

### Security

- Rate limit forgot-password endpoint: 3 requests per email per 15 minutes
- Token expires after 1 hour
- Token is single-use (deleted after successful reset)
- Previous tokens for the same user are deleted when a new one is requested
- Generic response ("If an account exists, we sent a reset email") to prevent email enumeration
- OAuth-only users silently skipped (no email sent, same generic response)
- Token generated with `crypto.randomBytes(32)` (256 bits of entropy)

### Files Created

- `src/app/(main)/auth/forgot-password/page.tsx` — email input form
- `src/app/(main)/auth/reset-password/page.tsx` — new password form (min 8 chars)
- `src/app/api/auth/forgot-password/route.ts` — token generation + email send
- `src/app/api/auth/reset-password/route.ts` — token validation + password update
- `src/lib/email.ts` — Resend client wrapper

### Files Modified

- `src/lib/db/schema.ts` — add `passwordResetTokens` table
- `src/app/(main)/auth/signin/page.tsx` — add forgot password link + `?reset=true` handling
- `.env.local` — add Resend env vars
- `package.json` — add `resend` dependency

---

## 5. Typography System

### Font Stack

| Role | Font | Why |
|------|------|-----|
| Headlines / Names | Inter | Modern tech UI standard (Linear, Vercel, Notion) |
| Body / Descriptions | Inter | Same family, different weight — unified and clean |
| Labels / Buttons / Tags | IBM Plex Sans | Structured, crisp — gives form labels and CTAs a corporate edge |
| Code / Terminal bits | IBM Plex Mono | Professional monospace, pairs with IBM Plex Sans |

### Weight System

| Use | Font | Weight |
|-----|------|--------|
| Page title / Hero name | Inter | 700 Bold |
| Section headings | Inter | 600 SemiBold |
| Body paragraphs | Inter | 400 Regular |
| Form labels | IBM Plex Sans | 500 Medium |
| Buttons | IBM Plex Sans | 600 SemiBold |
| Muted / captions | Inter | 400 Regular + muted color |
| Code snippets | IBM Plex Mono | 400 Regular |

### Implementation

Load via Google Fonts in `src/app/layout.tsx` using `next/font/google`:

```tsx
import { Inter, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexSans = IBM_Plex_Sans({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-plex-sans" });
const plexMono = IBM_Plex_Mono({ weight: ["400"], subsets: ["latin"], variable: "--font-plex-mono" });
```

Define in Tailwind CSS v4 `@theme`:

```css
--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
--font-label: var(--font-plex-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono: var(--font-plex-mono), ui-monospace, monospace;
```

Usage classes: `font-sans` (Inter default), `font-label` (IBM Plex Sans for labels/buttons), `font-mono` (IBM Plex Mono for code).

### Scope

Apply globally — this typography system replaces any current font stack across the entire site, not just the sign-in/sign-up forms.

### Files Modified

- `src/app/layout.tsx` — import and configure `next/font/google` fonts, apply CSS variables to `<html>`
- `src/app/globals.css` — update `@theme` with font family tokens
- Sign-in/sign-up pages — use `font-label` on form labels and buttons

---

## Summary of All Changes

| Area | Type | Files |
|------|------|-------|
| Testimonials schema | DB migration | `schema.ts` |
| Testimonial card | Component rewrite | `testimonial-card.tsx` |
| Homepage testimonials | Props update | `page.tsx` (main) |
| Clients marquee | Section rewrite | `page.tsx` (main), `globals.css` |
| Sign-in redesign | UI restyle | `signin/page.tsx` |
| Sign-up redesign | UI restyle | `signup/page.tsx` |
| Forgot password | New feature | 5 new files + schema |
| Email service | New utility | `email.ts` |
| Password reset tokens | New DB table | `schema.ts` |
| Typography system | Global fonts | `layout.tsx`, `globals.css` |

### No Breaking Changes

- Existing testimonials data still works (new columns have defaults)
- Sign-in/sign-up functionality unchanged, only visual improvements
- Clients section is purely visual, no data changes

### New Dependency

- `resend` — email delivery for password reset (and future Phase 3 notifications)

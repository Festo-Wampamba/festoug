# UI overhaul tracker

Source: the four-voice council review of festoug.com (25 Nov 2026), live at
375 / 1440 / 1920px, light and dark. Scores: Architect 5.5, Skeptic 5.5,
Pragmatist 6, Critic 5. Engineering about 7.5/10; as a portfolio that wins
clients, about 5.5/10.

**How to use this file:** tick items as they land, with the PR number. Every
working session ends by adding one entry to the session log at the bottom:
date, branch/PR, what changed, what was verified, what's next.

## Positioning decision: portfolio first

The site was presenting four products with equal weight: portfolio, store,
blog and a SaaS (accounts, dashboard, licenses, maintenance trials). Decision:

- **Primary (header):** Home, Work, Services, Resume, Contact. These sell the work.
- **Secondary:** Blog and Store, in the menu's "More" group and the footer.
  They stay fully working, but they no longer compete with the portfolio.
- **SaaS:** accounts and maintenance plans are reached from Services (plans)
  and from a single account icon in the header, not Sign in + Sign up buttons.
- **Later option (not decided):** move the store to its own subdomain once it
  has 3+ products. That's only worth it if the store grows.

## Phase 1: quick wins (branch `feat/portfolio-first-quick-wins`)

- [x] Header nav visible from 1024px (`lg`), not 1536px (`navbar.tsx`)
- [x] Nav cut to 5 primary links; Blog and Store moved to "More" + footer
- [x] Sign in / Sign up buttons replaced by one account icon; pulsing
      skeleton replaced by a fixed-size placeholder (no pop-in)
- [x] Removed `animate-in fade-in` page wrappers (public pages, dashboard,
      testimonial cards): pages no longer look blank for ~1s after a click
- [x] Each page's title is its H1; sidebar name is no longer an H1; section
      and card headings shifted so levels don't skip
- [x] Sidebar email wraps after the @, not mid-word
- [x] Footer: GitHub, Blog, Store, Get in touch; GitHub link meets 44px
- [x] Mobile menu: primary links, then a labelled "More" group (Blog, Store);
      duplicate Sign in removed (the header icon covers it)
- [x] Desktop "More" dropdown (Blog, Store) so they aren't footer-only;
      highlighted when you're on either page; closes on Escape, outside
      click and route change
- [x] Portfolio page renamed "Work" to match the nav (tab title, H1, intro
      line, detail-page titles, "Back to Work")
- [x] Footer: YouTube channel added
- [x] Product page: buy box (with the H1) comes first in the source and sits
      right on desktop with `lg:order-last`, so the H1 leads the page

## Phase 2: speed

- [x] Content pages read through cached, tagged queries (`src/lib/content.ts`,
      `unstable_cache`, 1h safety refresh). Production test: first load
      200–980ms, repeat loads 7–20ms. Pages keep `force-dynamic` so the build
      never needs a database (CI builds with a placeholder URL); the cache
      serves the data instead. Services has no data and is now fully static.
- [x] Every admin and review write clears its tag (`revalidateContent`, 20
      write sites across 13 routes) with `expire: 0`, so edits show on the
      next load. Placement checked in the diff; not yet exercised with a real
      admin login
- [ ] Later, optional: true static pages served from the CDN. Needs a
      Postgres service in CI so the build can prerender

## Phase 3: proof of work (needs content from Festo)

- [ ] Write 3 case studies: problem, your role, stack, one measured result
- [ ] Replace mockup-looking thumbnails with real screenshots
- [ ] Rebuild project cards (`portfolio-grid.tsx`) to show role, stack and the
      result line, linking to `/portfolio/[slug]`
- [ ] Unpublish or rewrite the generic blog posts dated Apr 2026 (admin → Blog;
      the review first said Apr 2025, which was wrong)
- [ ] Keep Store out of the header until it has 3+ products

## Phase 4: layout, type and resolutions

- [x] Full profile card on Home only; inner pages get a slim contact bar
      (photo, Email, WhatsApp, Resume) and full-width content (`sidebar.tsx`)
- [x] Card grids (Work, blog, testimonials) pick columns from the space:
      3 on full-width pages at 1440, 2 beside the Home sidebar, 1 on phones
- [x] Hero headline `clamp(2rem, 1.25rem + 2vw, 4rem)`: 49px at 1440, 58px at 1920
- [x] Shell capped at 1600px (was 2000px); project descriptions and the
      testimonials intro capped at 72ch (blog posts already were)
- [x] Mobile: profile card shows the summary instead of repeating the name
      from the header; the 80px "Festo AI" bar is now a 56px floating button
- [x] Layer separation: canvas, card and border tokens adjusted (see palette
      verdict); glass panels 82% opaque instead of 64%
- [ ] Optional: pair Geist body with a display face for headlines

## Hosting and auth roadmap (decided order)

1. **Merge #48, #49, #50.** None of them depends on where the site runs.
2. **Phase 4 (UI).** Also host-independent, so it doesn't wait for the move.
3. **Move to the VPS with Better Auth unchanged.** Change one big thing at a
   time: if login breaks after the move, it's the move, not a new auth system.
4. **Decide on Zitadel only after the VPS is stable** (see the trade-off below).

### What the VPS move involves

Vercel lock-in is small. The database layer already switches to postgres.js
for any non-Neon URL.

| Vercel piece | VPS replacement |
| --- | --- |
| Neon database | Postgres 16 in Docker on the VPS (`docker-compose.yml` already binds it to 127.0.0.1); move data with `pg_dump` / `pg_restore` |
| Builds and hosting | `next build` + `next start` under systemd (or Docker), single instance |
| HTTPS and domain | Caddy in front (automatic TLS); DNS cut-over with a low TTL |
| Cron (`vercel.json`, trial reminder 09:00) | systemd timer or crontab calling `/api/cron/trial-reminder` with `CRON_SECRET` |
| `@vercel/analytics` | remove, or self-host Umami / Plausible |
| `VERCEL_URL` in Better Auth trusted origins | the VPS domain only |
| Client IP (`x-real-ip`) for rate limits | the proxy **must overwrite** `X-Real-IP` and `X-Forwarded-For`, or clients can dodge rate limits (`lib/rate-limit.ts`) |
| Data cache (phase 2) | works as-is on one instance (file cache in `.next/cache`); several instances would need a shared cache handler |

"Set up the database well" means:
- separate users for the app and for migrations
- commit the missing migration for the one-active-trial index, then use
  `db:migrate` (not `db:push`) in production
- nightly `pg_dump` copied off the server, with a tested restore
- Postgres not reachable from the internet

Keep Vercel live for a week after the cut-over as the rollback.

### Zitadel vs Better Auth: the trade-off

Better Auth runs inside the app. Zitadel is a separate identity server: its
own service, database, domain (e.g. `auth.festoug.com`), upgrades and backups.
If Zitadel is down, nobody can sign in.

**Zitadel is worth it if** several apps will share one login (SSO), or you
need organisations, SAML, passkeys/MFA and audit logs out of the box.
**Keep Better Auth if** festoug.com is the only app: it already handles email
verification, OAuth, roles, bans and rate limits.

If Zitadel goes ahead, the code is ready for it in one important way: 39
server files only call `auth()` / `requireAdmin()` from `lib/auth.ts`, so the
switch happens behind that one seam. The work:

- OIDC login replaces `lib/better-auth.ts`, the auth API route, the session
  check in `proxy.ts`, and the 5 custom auth pages (Zitadel hosts the login)
- 12 client files that use `auth-client` move to the new session hook
- keep the local `user` table (13 tables reference it); add a Zitadel subject
  ID column and match existing users by verified email
- import existing bcrypt password hashes into Zitadel so nobody has to reset;
  Google/GitHub users re-link on their next sign-in
- map ADMIN / CUSTOMER and ban/suspend to Zitadel project roles

## Palette verdict

**Keep Forest Luxe.** It's distinctive (most developer portfolios are dark
with purple or blue), warm and trustworthy, and every text pair passes WCAG AA,
most AAA:

| Pair | Ratio |
| --- | --- |
| Main text / canvas (light, dark) | 14.9, 14.6 |
| Supporting text / canvas (light, dark) | 6.8, 9.3 |
| Primary button text (light, dark) | 12.2, 12.4 |
| Gold ink / canvas (light) | 6.1 |
| Gold accent / canvas (light, decorative only) | 2.8 |

**Done in phase 4:** canvas `#F3EAD4` / `#071F18`, surface `#FFFDF7` /
`#113427`, border `#D3C6A7` / `#3F594B`. Card vs canvas is now 1.18:1 light
(was 1.06) and 1.27:1 dark (was 1.14); main text stays AAA (13.6 / 15.5),
supporting text AA (6.2 / 9.8), gold ink AA (5.5). DESIGN.md updated.

**The original finding:** layers don't separate. Surface vs
canvas is 1.06:1 in light mode and 1.14:1 in dark, and borders are 1.33:1.
Cream glass on cream canvas makes every page feel flat and slightly washed
out. Fix by deepening the canvas a step or strengthening borders and shadows
on cards, not by changing the colours. Gold must stay decorative (2.8:1 fails
for text; `gold-ink` is the text-safe version).

## Session log

### 2026-11-20 · main · codebase study
Studied the codebase; reported status (no tests, missing trial-index migration,
duplicated admin checks, stale `development` branch).

### 2026-11-25 · PR #48 · requireAdmin
One `requireAdmin()` replaces 26 inline admin checks. Typecheck and lint pass.

### 2026-11-25 · council UI review
Inspected festoug.com at 375/1440/1920, light and dark. Measured LCP 1.66s,
CLS 0.002, TTFB 97ms. Findings and plan recorded above.

### 2026-11-25 · `feat/portfolio-first-quick-wins` · phase 1
Shipped every phase 1 item and the portfolio-first navigation (28 files).
Verified on local dev: nav visible and on one line at 1024 and 1440; one H1
per page with no skipped levels; email breaks at the @; portfolio renders
with no fade; mobile menu shows the More group; no console errors.
Typecheck and lint pass. Not yet committed or deployed.
Review pass: confirmed the bulk edits changed nothing but the intended classes
and tags; closed 4 heading gaps (blog cards, portfolio grid via a hidden
"Projects" H2, resume timeline H5, store "What's Included"). All 12 public
pages checked: one H1 each, no skipped levels.
Trade-off decisions (Festo): More dropdown in the header, "Work" as the name,
YouTube in the footer, H1 first on product pages. All verified at 375 / 1024
/ 1440: header stays on one line, dropdown keyboard-closes, no console errors
on a fresh load. Sign in stays icon-only.

### 2026-11-25 · `perf/cache-content-pages` · phase 2
Added `src/lib/content.ts`: tagged, cached reads for home, work, blog, store,
product and testimonials, with Date fields restored after the cache's JSON
round trip. 13 write routes clear the matching tag. Services is static.
Verified: production build passes with an unreachable database (CI parity);
production server against the real DB shows cold 200–980ms vs warm 7–20ms;
9 tagged cache entries written; all 9 content pages render with no errors.
Not verified: an admin save clearing the cache live (needs an admin login).
Next: phase 3 content (case studies, screenshots, blog clean-up) and phase 4.

### 2026-11-25 · `feat/phase4-layout` · phase 4 + hosting roadmap
Added the hosting and auth roadmap (VPS move first with Better Auth kept;
Zitadel decided after). Phase 4: Home-only profile card, contact bar and
full-width inner pages, width-driven card grids, fluid headline, 1600px shell,
72ch text caps, floating mobile assistant, palette layer separation.
Verified at 375 / 1440 / 1920, light and dark: no sideways scroll, 44px
targets in the contact bar, 3/2/1 grid columns as intended.
Corrected: blog posts are dated Apr 2026, not Apr 2025.
Next: phase 3 content; then the VPS move.
Next: phase 2 (caching) and the case-study content for phase 3.

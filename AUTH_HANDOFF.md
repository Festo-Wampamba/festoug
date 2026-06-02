# Auth Handoff — NextAuth → Better Auth migration (status)

Carry this into the new session. Goal: finish making authentication + email
verification production-ready. Most of the build is done and verified locally;
the remaining work is the production cutover + browser functional tests.

## Where the code lives
- Branch: **`feat/better-auth-migration`** (NOT merged). Prod still runs old NextAuth on `main`.
- Commits on branch:
  - `feat(auth): migrate from NextAuth to Better Auth`
  - `fix(auth): use Next 16 proxy convention for the auth gate`
  - `fix(ui): guard testimonial carousel against empty data`
- Plan/notes: `MIGRATION_BETTER_AUTH.md`, audit: `SECURITY_AUDIT.md`.

## Stack
Next.js 16.1.6 (Turbopack), React 19, Drizzle ORM, Postgres (local Docker `festoug-db`;
prod = Neon project `mute-water-17808525`, db `neondb`), Resend email, Lemon Squeezy.
Auth: **better-auth 1.6.13** (replaces next-auth 5 beta). kysely pinned to **0.28.17**
(pnpm override) for Turbopack build compat.

## What changed (architecture)
- `src/lib/better-auth.ts` — Better Auth instance: drizzleAdapter, bcrypt password
  override (cost 12, keeps existing hashes), Resend `sendVerificationEmail` +
  `sendResetPassword` (5-min TTL), `requireEmailVerification: true`,
  `autoSignInAfterVerification: true`, Google + GitHub social, `role`/`accountStatus`
  as `user.additionalFields`, `advanced.database.generateId = crypto.randomUUID`,
  `nextCookies()` plugin last.
- `src/lib/auth.ts` — **server compat shim**: exports `auth()` returning the old
  NextAuth-shaped `{ user: { id, name, email, image, role, accountStatus, emailVerified } } | null`.
  Lets the ~35 server route handlers/components stay unchanged.
- `src/lib/auth-client.ts` — Better Auth React client (`signIn`, `signUp`, `signOut`,
  `useSession`, `sendVerificationEmail`, `requestPasswordReset`, `resetPassword`).
- `src/proxy.ts` — auth gate (Next 16 "proxy" convention, default export; NOT middleware.ts).
  Uses `auth.api.getSession`. Blocks BANNED/SUSPENDED writes; protects /dashboard,/trial,/admin by role.
  NOTE: with `requireEmailVerification`, unverified email users have no session at all.
- `src/app/api/auth/[...all]/route.ts` — Better Auth handler (replaces all custom auth routes).
- Deleted: `src/app/api/auth/{[...nextauth],register,verify-email,resend-verification,forgot-password,reset-password}`,
  `src/app/api/user/password`, `src/proxy.ts`(old NextAuth one replaced), the verify-email page.
- `src/lib/email.ts` — `sendVerificationEmail(email, url)` / `sendPasswordResetEmail(email, url)`
  now take Better Auth's full URL.
- Client migrated (9 files): navbar, ai-assistant, settings-name/avatar/password forms,
  delete-account-button, providers (SessionProvider removed → passthrough), 5 auth pages
  (signin/signup/forgot/reset use authClient; verify-email page deleted).
- Password change → `authClient.changePassword` (password now lives in `account.password`).

## Schema (src/lib/db/schema.ts) — Better Auth shape, uuid ids
- `user`: id uuid, name, email, **emailVerified boolean** (was timestamp), image, role,
  accountStatus, createdAt, updatedAt. (password_hash REMOVED.)
- `session`: id, expiresAt, token, ipAddress, userAgent, userId, timestamps.
- `account`: id, accountId, providerId, userId, accessToken, refreshToken, idToken,
  *ExpiresAt, scope, **password**, timestamps. (Credential password stored here.)
- `verification`: id, identifier, value, expiresAt, timestamps. (replaces verificationToken)
- uuid ids preserve all existing FK references (orders, reviews, notifications, etc.).
- Dead leftover: `passwordResetTokens` table (unused now; safe to drop later).

## Verified (local, real DB)
- typecheck 0 errors; `pnpm build` passes (31 routes + Proxy).
- `pnpm db:push --force` applied schema to local Docker DB (21 tables).
- Runtime curl tests:
  - signup → 200, uuid id, role=CUSTOMER, accountStatus=ACTIVE, emailVerified=false,
    bcrypt password written to `account` (providerId=credential).
  - unverified sign-in → **403 EMAIL_NOT_VERIFIED** (gate works).
  - after setting emailVerified=true → sign-in 200 + session.
  - wrong password → 401.
- Local DB re-seeded (testimonials=4, services=4, projects=9, blog=9). Home page 200.

## Local env (.env.local, gitignored) — already set
`BETTER_AUTH_SECRET` (generated), `BETTER_AUTH_URL=http://localhost:3000`, plus existing
DATABASE_URL (local Docker), GOOGLE_*, GITHUB_*, RESEND_*, etc.

## OPEN ITEM to verify in new session
User reported "logged in but didn't ask for verification." Likely Google login (correct —
pre-verified). MUST confirm: do a fresh **email/password** signup in the browser and verify
the gate blocks until the emailed link is clicked. If email/password also skips the gate,
investigate `requireEmailVerification` wiring / session creation.

## REMAINING WORK (production go-live)
1. User actions (dashboards):
   - Vercel env: add `BETTER_AUTH_SECRET` (openssl rand -hex 32) + `BETTER_AUTH_URL=https://festoug.com`.
   - Verify OAuth redirect URIs (same path as NextAuth): `https://festoug.com/api/auth/callback/{google,github}`.
   - Rotate exposed Neon `neondb_owner` password (a prod connection string was leaked earlier in chat);
     update DATABASE_URL in Vercel + .env.local.
2. Prod DB cutover (do on a Neon BRANCH first):
   - Prod has 3 users (all Google; admin festotechug also has bcrypt password). 0 orders.
   - Must migrate WITHOUT changing user.id (admin authored blog posts/projects FK to it).
   - Reshape account/session tables; convert each Auth.js `account` row (provider/providerAccountId)
     → Better Auth (providerId/accountId); move admin's user.password_hash → an `account`
     (providerId=credential) row; emailVerified timestamp→boolean (all 3 = true); add `verification`.
   - Drop old sessions (everyone re-logs in once).
   - Do via Neon MCP (project `mute-water-17808525`), branch-first, then promote.
3. Deploy branch → preview (set the 2 env vars on preview) → browser-test Google/GitHub/email/reset →
   then DB cutover → merge to `main`.

## NOTE
The Better Auth "Create Project / @better-auth/infra (Sentinel)" wizard is OPTIONAL hosted infra —
NOT needed. Our setup is fully self-hosted.

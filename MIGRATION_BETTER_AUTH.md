# Migration: NextAuth (Auth.js v5) → Better Auth

Decision: replace the hand-rolled NextAuth + custom verification layer with Better Auth
(MIT, self-hosted, free). Access policy: immediate access (verified email or Google = active
CUSTOMER). Only 3 prod users (all Google, 1 admin w/ password) → low data-migration risk.

## Strategy to keep blast radius small
- **Server compat shim:** `@/lib/auth` keeps exporting `auth()` returning the same NextAuth-shaped
  `{ user: { id, role, accountStatus, email, name, image } } | null`, implemented via
  `betterAuth.api.getSession()`. → the ~35 server route handlers / server components stay UNCHANGED.
- **Client:** update the ~10 files using `next-auth/react` to Better Auth's `authClient`
  (`useSession`, `signIn.email/social`, `signOut`, `signUp.email`, `forgetPassword`, `resetPassword`,
  `sendVerificationEmail`).
- **Routes:** delete custom `register / verify-email / resend-verification / forgot-password /
  reset-password / [...nextauth]`; Better Auth's `[...all]` handler provides all of these.
- **Middleware:** replace `proxy.ts` with `middleware.ts` using Better Auth session + the role/
  accountStatus/email-verified gate.

## Schema (Postgres, preserve FKs)
Existing `user.id` is `uuid` and is FK target for ~10 tables (orders, reviews, notifications, …).
Better Auth defaults to string ids → configure `advanced.database.generateId` to emit `crypto.randomUUID()`
so new ids fit the `uuid` columns and existing FKs stay valid.

Better Auth tables (hand-authored Drizzle schema, uuid ids):
- `user`: reuse existing table. Changes: `emailVerified` timestamp → **boolean** (all 3 users = true);
  add `updatedAt`. Keep `role`, `accountStatus` (exposed as `additionalFields`). Drop `password_hash`
  (passwords move to `account`).
- `account`: Better Auth shape (`accountId`, `providerId`, `userId`, `accessToken`, `refreshToken`,
  `idToken`, `password` (for credential), timestamps). Migrate existing Auth.js `account` rows
  (provider/providerAccountId → providerId/accountId). Admin bcrypt hash → a `providerId='credential'`
  row's `password` column.
- `session`: Better Auth shape (`token`, `userId`, `expiresAt`, `ipAddress`, `userAgent`).
- `verification`: Better Auth shape (`identifier`, `value`, `expiresAt`). Replaces `verificationToken`.

## Auth config (`src/lib/auth.ts`)
- `drizzleAdapter(db, { provider: "pg", schema })`.
- `emailAndPassword`: enabled, `requireEmailVerification: true`, `minPasswordLength: 8`,
  bcrypt `password.hash/verify` override (cost 12) so the existing admin hash + new signups match.
- `emailVerification`: `sendVerificationEmail` (Resend), `autoSignInAfterVerification: true`,
  `expiresIn: 60*5` (5 min).
- `sendResetPassword` (Resend), reset token 5 min.
- `socialProviders`: google, github (email pre-verified by provider).
- `user.additionalFields`: `role` (enum, default CUSTOMER), `accountStatus` (enum, default ACTIVE).
- `advanced.database.generateId` → uuid.
- `plugins: [nextCookies()]` (last).

## Verification gate (immediate-access policy)
- `requireEmailVerification: true` blocks unverified email/password sign-in at the source (Better Auth
  returns a verification-required error; client shows "check your email").
- Google/GitHub: pre-verified → straight in.
- `middleware.ts`: still guard `/dashboard`,`/trial`,`/admin` by session + role; block BANNED/SUSPENDED
  writes (port the existing proxy logic, reading Better Auth session).

## Build order (local first, against docker Postgres)
1. Install `better-auth`; remove `next-auth`, `@auth/drizzle-adapter` after cutover.
2. Hand-author Better Auth Drizzle schema (uuid) + drizzle migration for local DB.
3. `src/lib/auth.ts` Better Auth instance + bcrypt + Resend hooks + social + fields.
4. `src/lib/auth-compat.ts` (or keep in auth.ts) `auth()` shim returning NextAuth-shaped session.
5. `app/api/auth/[...all]/route.ts` handler; delete old auth routes.
6. `src/lib/auth-client.ts` (`createAuthClient`); update providers + 10 client files.
7. `middleware.ts` gate; delete `proxy.ts`.
8. Rewrite signin/signup/verify/forgot/reset pages to authClient methods.
9. Local end-to-end test ALL flows (below).
10. Typecheck/lint/build.

## Test matrix (local, before prod)
- Email signup → receives verification email → unverified sign-in blocked → click link → auto signed-in → dashboard.
- Resend verification works.
- Google sign-in → straight to dashboard (no gate).
- GitHub sign-in.
- Forgot password → reset link → set new password → sign in.
- Admin (existing bcrypt) signs in → role=ADMIN → /admin.
- BANNED/SUSPENDED write-block still enforced.
- Existing FKs intact (orders/reviews/etc. still reference users).

## Prod cutover (separate, explicit approval)
- Apply schema migration to Neon (only 3 users; alter user table, add Better Auth tables, migrate rows).
- Update Vercel env (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, keep Google/GitHub/Resend/DATABASE_URL).
- Rotate the previously-exposed Neon password at the same time.
- Redeploy; smoke test the matrix on prod.
- Note: existing sessions invalidated (everyone re-logs in) — acceptable for 3 users.

## Rollback
- Branch `feat/better-auth-migration`; prod stays on current `main` until cutover merge.
- Neon: take a branch/snapshot before applying prod schema changes.

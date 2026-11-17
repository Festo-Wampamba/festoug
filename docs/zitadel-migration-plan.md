# Better Auth → Zitadel migration plan

Status: plan only — nothing here is implemented. Written 2026-11-17.

Inputs from Festo: Zitadel will be **self-hosted** on the company server; the
goal is **client organisations with SSO**; new clients are being onboarded;
the app currently has 5 customer accounts.

> Zitadel details below (endpoints, claim names, import API, Postgres version)
> are from general knowledge and were **not checked against the current
> Zitadel docs**. Verify each one during Phase 0 before relying on it.

## Decision summary

| Question | Decision | Why |
|---|---|---|
| How does the app talk to Zitadel? | Keep Better Auth as a thin OIDC client (`genericOAuth` plugin), Zitadel as the only provider | All 39 server callers go through `src/lib/auth.ts`; sessions, the DB adapter and `src/proxy.ts` stay. Smallest change, easiest rollback. |
| User IDs | Keep the local `user` table and uuid primary key; add `zitadel_sub` | 13 tables reference `user.id`. Zitadel's `sub` is not a uuid. |
| Login screens | Zitadel's hosted login, branded | Custom-styled screens need Zitadel's session API and are a much larger build. Revisit after cutover. |
| Existing 5 users | Re-invite instead of importing password hashes | Five accounts do not justify an import script. Their orders and licenses stay attached through the email match. |
| Roles | Zitadel project roles `admin` / `customer`, mirrored into `user.role` | Queries and the admin UI keep working from the local column. |

Still open — needs Festo's answer:
1. Hosted Zitadel login acceptable for launch? (Assumed yes above.)
2. Which domain: e.g. `auth.festoug.com`?
3. Is the company server allowed to hold another Postgres database, or should Zitadel get its own instance?

## Phase 0 — Stand up Zitadel (weekend, no app changes)

1. DNS: point `auth.<domain>` at the server; TLS via the existing reverse proxy.
2. Run Zitadel with Docker Compose and its own Postgres database (do not share the app's Neon database).
3. Set the external domain, enable HTTPS-only, create the first admin with MFA.
4. Configure SMTP (Resend) so Zitadel sends verification and reset mail.
5. Back up the Zitadel database on the same schedule as other company data. Losing it means nobody can sign in.
6. Create: one **project** (`festoug`), roles `admin` and `customer`, one **web application** (authorization code + PKCE) with redirect URI `https://festoug.com/api/auth/oauth2/callback/zitadel` and the local dev equivalent.
7. Add Google and GitHub as identity providers inside Zitadel (reuse the existing OAuth apps; update their callback URLs).
8. Create one organisation per client that needs SSO; connect their IdP there.

Exit check: you can sign in to the Zitadel console and complete a login against a throwaway test app.

## Phase 1 — App integration behind a flag

Files: `src/lib/better-auth.ts`, `src/lib/auth-client.ts`, `src/lib/auth.ts`, `src/lib/db/schema.ts`, one migration, `src/app/(main)/auth/signin/page.tsx`.

1. Migration: add `zitadel_sub text unique` to `user`.
2. `better-auth.ts`: add the `genericOAuth` plugin with Zitadel's discovery URL, client ID and PKCE. Request scopes for profile, email and project roles.
3. Map claims on sign-in: `sub` → `zitadel_sub`, verified email → `emailVerified`, project-roles claim → `role`. Link to an existing local user by `zitadel_sub`, falling back to a **verified** email.
4. Env flag `AUTH_PROVIDER=zitadel|legacy`. With `zitadel`, the sign-in page shows a single "Continue" button that starts the OIDC flow; with `legacy`, today's behaviour.
5. Keep `auth()` in `src/lib/auth.ts` returning the same shape, so no route handler changes.

Exit check on a preview deployment: sign in through Zitadel as a new user, as an existing customer (orders still visible), and as admin (lands on `/admin`).

## Phase 2 — Account states

- **Banned**: deactivate the user in Zitadel (blocks new logins) and keep `accountStatus = BANNED` locally so live sessions are stopped by `src/proxy.ts`. The admin "ban" action should call both.
- **Suspended (read-only)**: stays an app-only state; Zitadel has no equivalent.
- **`banned_email` table**: keep; check it in the sign-in claim mapping.
- Needs a Zitadel service account with permission to deactivate users; store its key as a server-only secret.

## Phase 3 — Cutover

1. Re-invite the 5 customers from Zitadel (they set a new password or use Google/GitHub).
2. Set `AUTH_PROVIDER=zitadel` in production.
3. Watch sign-in errors for a week. Rollback is flipping the flag back.

## Phase 4 — Remove what Zitadel replaced

After a clean week:

- Delete pages: `auth/signup`, `auth/verify-email`, `auth/forgot-password`, `auth/reset-password`; reduce `auth/signin` to the redirect button.
- Delete: `settings-password-form.tsx` (link to Zitadel's account page instead), `email-verify-banner.tsx`, the OTP and reset email templates in `src/lib/email.ts`.
- `better-auth.ts`: remove `emailAndPassword`, `emailVerification`, `emailOTP`, `socialProviders`, the bcrypt hooks and the per-route rate-limit rules for removed endpoints.
- Dependencies: remove `bcryptjs`; check whether `@better-auth/infra` is still needed.
- Schema: drop `password_reset_token`; `verification` and the password column on `account` once nothing reads them.
- `src/proxy.ts`: drop the unverified-user branch (Zitadel only issues sessions for verified users) after confirming that in Phase 1.

## Risks

| Risk | Mitigation |
|---|---|
| Zitadel down = nobody can sign in | Monitoring + database backups from day one; keep the legacy flag until Phase 4 |
| Email-based linking attaches the wrong account | Link only on a verified email claim; never on an unverified one |
| Admin role lost in the mapping | Seed the admin role in Zitadel before cutover; test admin login in Phase 1 |
| Company server shared with other workloads | Give Zitadel its own Postgres and resource limits |

## Not in scope

Multi-tenant data separation inside this app (orders per organisation, org-scoped admin). Zitadel organisations give clients SSO; the app's data model is still single-tenant. Scope that separately if clients need their own dashboards.

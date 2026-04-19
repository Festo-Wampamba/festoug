# Auth & User Management — Design Spec
**Date:** 2026-04-18  
**Status:** Approved  
**Stack:** Next.js 16 App Router · Auth.js v5 JWT · Drizzle ORM · Neon/PostgreSQL · Cloudinary · Resend

---

## Context

The sign-in, sign-up, forgot-password, and reset-password pages already exist and are coded. The gaps are:

1. The **profile settings page** (`/dashboard/settings`) is a non-functional UI stub — "Save Changes" and "Change Avatar" buttons do nothing.
2. **Email verification** is never triggered on signup — `emailVerified` on the `users` table is always `null`.
3. The banned-account error during sign-in is mapped to a generic "Invalid email or password" message.
4. No **Zod validation** on any auth form (client-side) — all validation is only server-side.

This spec covers wiring everything up end-to-end with Zod validation and security hardening throughout.

---

## Architecture

### New files
| File | Purpose |
|------|---------|
| `src/app/api/auth/verify-email/route.ts` | `GET` — verify token, set `emailVerified`, delete token |
| `src/app/api/auth/resend-verification/route.ts` | `POST` — rate-limited resend of verification email |
| `src/app/api/user/avatar/route.ts` | `POST` — server-side Cloudinary upload, update `image` |
| `src/app/api/user/password/route.ts` | `PATCH` — current-password check + new password hash |
| `src/app/(main)/auth/verify-email/page.tsx` | Token verification landing page |
| `src/components/dashboard/email-verify-banner.tsx` | Soft-gate banner in dashboard until email verified |
| `src/actions/user.ts` | Server Action: `updateProfile(formData)` for name changes |

### Modified files
| File | Change |
|------|--------|
| `src/app/api/auth/register/route.ts` | After user creation: generate token → insert into `verificationTokens` → send verification email |
| `src/app/(main)/dashboard/layout.tsx` | Fetch `emailVerified` from DB, pass to `<EmailVerifyBanner>` if null |
| `src/app/(main)/dashboard/settings/page.tsx` | Convert to client component; wire name (server action), avatar (fetch), password (fetch) |
| `src/lib/email.ts` | Add `sendVerificationEmail(email, token)` |
| `src/lib/validations.ts` | Add Zod schemas for all auth + profile inputs |
| `src/app/api/user/me/route.ts` | No change — name updates go through server action, not this route |
| `src/app/(main)/auth/signin/page.tsx` | Map `ACCOUNT_BANNED` error to a clear user-facing message |

---

## Zod Schemas (`src/lib/validations.ts`)

```ts
// Registration
export const registerSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email(),
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
});

// Sign in
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { path: ["confirm"] });

// Profile name update
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim(),
});

// Password change
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { path: ["confirmPassword"] });

// Avatar upload (server-side)
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const avatarSchema = z.object({
  mimeType: z.enum(ALLOWED_MIME as [string, ...string[]]),
  sizeBytes: z.number().max(1_048_576), // 1MB
});
```

---

## Email Verification Flow

### On registration (`/api/auth/register`)
1. Create user (existing logic).
2. Generate token: `crypto.randomBytes(32).toString("hex")`.
3. Insert into `verificationTokens`: `{ identifier: email, token, expires: +24h }`.
4. Call `sendVerificationEmail(email, token)`.
5. Return 201 → client redirects to `/auth/signin?registered=true`.

### Verification endpoint (`GET /api/auth/verify-email?token=xxx`)
1. Look up `verificationTokens` where `token = xxx AND expires > now`.
2. If not found → redirect to `/auth/verify-email?error=invalid`.
3. Set `users.emailVerified = new Date()` where `email = identifier`.
4. Delete the token row.
5. Redirect to `/dashboard?verified=true`.

### Verification page (`/auth/verify-email`)
- On mount, calls the GET endpoint.
- Three UI states: loading spinner / success (auto-redirect after 2s) / error with resend link.

### Email verify banner (`/dashboard/layout.tsx`)
- Dashboard layout fetches `user.emailVerified` from DB after `auth()` check.
- Passes it as prop to `<EmailVerifyBanner email={user.email} />`.
- Banner is dismissible per session (sessionStorage key).
- "Resend verification" button → `POST /api/auth/resend-verification`.
- Resend rate limit: 1 request per 5 minutes per user (using existing `rateLimit()` util keyed on `userId`).
- OAuth users (GitHub/Google) always have `emailVerified` set by adapter — never see the banner.

---

## Profile Settings Page

The page converts from a pure server component to a hybrid:
- Server component fetches user data and renders the shell.
- Three client sub-components handle each mutation independently.

### Name update (Server Action in `src/actions/user.ts`)
```
updateProfile(formData: FormData) → Zod parse → db.update users.name → revalidatePath
```
- Form `action={updateProfile}` with `useFormState` / `useActionState` for inline error/success.
- After success, client calls `useSession().update()` to refresh name in dashboard header.

### Avatar upload (`POST /api/user/avatar`)
```
Client: file input → validate MIME + size (client) → FormData → fetch('/api/user/avatar', POST)
Server: parse FormData → Zod validate MIME + size again → upload to Cloudinary (signed) 
      → db.update users.image → return { imageUrl }
Client: update preview → session.update()
```
- Upload spinner shown during request.
- Instant local preview via `URL.createObjectURL()` before upload.

### Password change (`PATCH /api/user/password`)
```
Client: Zod validate form → fetch('/api/user/password', PATCH, JSON)
Server: auth() check → fetch user.passwordHash → bcrypt.compare(current) 
      → if no passwordHash: return 400 "Use Forgot Password to set a password"
      → bcrypt.hash(new, 12) → db.update → 200
Client: clear form → show success message
```

---

## Security Hardening

| Layer | Measure |
|-------|---------|
| All mutation API routes | `auth()` → 401 if no session |
| All mutation API routes | Reject if `accountStatus === "BANNED"` or `"SUSPENDED"` |
| Registration | Rate limit: 5/15min per IP (existing) |
| Resend verification | Rate limit: 1/5min per userId |
| Avatar upload | Server-side MIME sniff (read first bytes), not just `Content-Type` header |
| Password change | `bcrypt.compare` before any write; separate route from profile |
| Forgot password | Always returns same response regardless of whether email exists (already correct) |
| Sign-in banned error | Map `ACCOUNT_BANNED` AuthError → "Your account has been suspended. Contact support." |
| Zod | Parse at API boundary on every route; client-side parse before submit for UX |

---

## Verification

### Manual test checklist
- [ ] Register with email → verification email arrives → click link → `emailVerified` set → banner gone
- [ ] Register with email → sign in → dashboard shows verify banner → dismiss persists in session
- [ ] Register with email → resend verification → second email arrives, token works
- [ ] OAuth sign-in (GitHub/Google) → no verify banner shown
- [ ] Settings: update name → header updates without page reload
- [ ] Settings: upload avatar → Cloudinary URL saved, avatar shown in header
- [ ] Settings: change password → sign out → sign in with new password works
- [ ] Settings: change password with wrong current password → error shown
- [ ] Settings: OAuth-only account → password section shows "use Forgot Password" message
- [ ] Banned user → credentials sign-in → clear suspended message shown
- [ ] Resend verification → rate limit hit → appropriate error shown

### Database checks
```sql
-- Verify email verification token created on registration
SELECT * FROM "verificationToken" WHERE identifier = 'test@example.com';

-- Verify emailVerified set after clicking link
SELECT email, "emailVerified" FROM "user" WHERE email = 'test@example.com';
```

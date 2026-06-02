# Security & Architecture Audit — festoug

Scope: Next.js 16 App Router, Drizzle ORM, NextAuth v5, Lemon Squeezy, Cloudinary.
Reviewed all 39 route handlers, server actions, auth/db/rate-limit libs, and infra config.

**Overall:** PR #23 hardening is real — bcrypt cost 12, hashed+TTL reset tokens, atomic token
consumption, upload magic-byte verification, timing-safe webhook signatures, render-time HTML
sanitization, `.env*` gitignored. No SQL injection (Drizzle fully parameterized). No IDOR (every
user-scoped query filtered by `session.user.id`). Findings below are the remaining gaps.

---

## HIGH

### 1. Webhook has no idempotency → duplicate orders & duplicate license issuance
- **Severity:** High
- **Location:** `src/app/api/webhooks/lemonsqueezy/route.ts` (`order_created`, lines ~36-78); schema `src/lib/db/schema.ts:150`
- **Exploit Scenario:** Lemon Squeezy retries webhooks on any non-2xx or network blip and can deliver
  the same event twice. `externalOrderId` has no unique constraint and the handler never checks for an
  existing order. A replayed `order_created` inserts a second `orders` row and issues a SECOND license
  key for one payment. Same gap on `subscription_created` (duplicate active subscriptions). Signature
  verification does not stop replay of a validly-signed event.
- **Remediation:**
  ```ts
  // schema.ts
  externalOrderId: text("external_order_id").unique(),

  // route.ts, before inserting the order
  const existing = await db.query.orders.findFirst({
    where: eq(orders.externalOrderId, externalOrderId),
  });
  if (existing) return NextResponse.json({ message: "Already processed" }, { status: 200 });
  ```
  Mirror for `subscriptions.lsSubscriptionId`.

---

## MEDIUM

### 2. Credentials login unthrottled; rate limiter ineffective on serverless
- **Severity:** Medium (High for login gap)
- **Location:** `src/lib/auth.ts:97-126` (`authorize`); `src/lib/rate-limit.ts:11`
- **Exploit Scenario:** (a) register/forgot/reset/checkout/chat are rate-limited but the actual
  password-login path (`CredentialsProvider.authorize`) is NOT → unthrottled password brute-force
  against `/api/auth/callback/credentials`. (b) The limiter uses a module-level `Map`; on Vercel each
  instance has its own memory and scales horizontally, so effective limit = limit × instanceCount and
  resets on cold start.
- **Remediation:** Move rate-limit to shared store (Upstash Redis / `@vercel/kv`) keyed by IP+email;
  add explicit throttle inside `authorize` before `bcrypt.compare`.

### 3. Public `project-inquiry`: no auth, no rate limit, no schema validation
- **Severity:** Medium
- **Location:** `src/app/api/project-inquiry/route.ts:9-37`
- **Exploit Scenario:** Unauthenticated POST writes a DB row and emails admin on every call. No zod, no
  rate limit, raw `body` with no length bound → DB flooding, admin email-bombing (Resend quota burn),
  unbounded string storage.
- **Remediation:** Add `rateLimit(\`inquiry:${getClientIp(req)}\`, { limit: 3, windowSeconds: 900 })`
  and a zod schema with `.max()` on every field (mirror `register`).

### 4. No security response headers (CSP, X-Frame-Options, HSTS)
- **Severity:** Medium
- **Location:** `vercel.json` (crons only); `next.config.ts` (no `headers()`)
- **Exploit Scenario:** No `X-Frame-Options`/`frame-ancestors` → clickjacking. No CSP → any future XSS
  (app ships `dangerouslySetInnerHTML` for blog content) has no second line of defense. No HSTS, no
  `X-Content-Type-Options`.
- **Remediation:** Add `headers()` in `next.config.ts`:
  ```ts
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
      ],
    }];
  }
  ```

---

## LOW

### 5. Raw error messages leaked to clients
- **Severity:** Low
- **Location:** `src/app/api/upload/route.ts:105` (`{ error: message }`); `src/app/api/checkout/route.ts:73` (`details: error.message`)
- **Exploit Scenario:** 500s return raw exception strings (Cloudinary/Lemon Squeezy internals),
  disclosing backend config. Other routes correctly return generic messages — these two are inconsistent.
- **Remediation:** Log detail server-side, return generic message; drop `message`/`details` from body.

### 6. docker-compose: weak hardcoded password, host-published port, root, no limits
- **Severity:** Low (dev-only)
- **Location:** `docker-compose.yml:6-16`
- **Exploit Scenario:** Committed `POSTGRES_PASSWORD: festoug_dev` + `5432:5432` published on all host
  interfaces → guessable, reachable DB on any non-firewalled dev/CI host. Runs as root, no resource limits.
- **Remediation:** Bind loopback (`"127.0.0.1:5432:5432"`), source password from non-committed `.env`,
  add `user: postgres` and `deploy.resources.limits`.

---

## Cleared / no issue found
- **SQL injection:** none — Drizzle parameterizes all queries; no raw SQL, no dynamic identifiers.
- **IDOR:** defended — `notifications/[id]`, `reviews/[id]`, `user/me`, `trial`, profile action scope by
  `session.user.id`; admin routes re-check `role === "ADMIN"` server-side (not only in `proxy.ts`).
- **Stored XSS (blog):** sanitized at render via `sanitizeHtml` (`blog/[slug]/page.tsx:98`); writes admin-only.
- **Secrets:** `.env*` gitignored; only `.env.local.example` tracked. No hardcoded app secrets in source.
- **Supply chain:** `pnpm-workspace.yaml` exposes no internal packages; `next 16.1.6` past CVE-2025-29927.

**Priority:** Fix #1 (financial integrity) and #2 (login brute-force) first; then #3, #4.

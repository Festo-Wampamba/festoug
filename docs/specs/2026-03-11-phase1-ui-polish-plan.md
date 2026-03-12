# Phase 1: UI/UX Polish — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the homepage (testimonials, clients marquee), redesign auth pages with Coastal Midnight palette, add forgot-password flow via Resend, and install a new typography system.

**Architecture:** Five independent features sharing the Coastal Midnight color palette defined in `globals.css`. Schema changes (testimonials `rating`/`role` columns, `password_reset_tokens` table) are applied via `drizzle-kit push`. Font system replaces Poppins with Inter + IBM Plex Sans + IBM Plex Mono loaded in the root layout.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 (`@theme inline`), Drizzle ORM + PostgreSQL, Resend SDK, `next/font/google`, `crypto.randomBytes`.

**Spec:** `docs/specs/2026-03-11-phase1-ui-polish-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/lib/email.ts` | Resend client singleton + `sendPasswordResetEmail()` |
| `src/app/api/auth/forgot-password/route.ts` | POST: generate token, send email |
| `src/app/api/auth/reset-password/route.ts` | POST: validate token, update password |
| `src/app/(main)/auth/forgot-password/page.tsx` | Forgot password request form |
| `src/app/(main)/auth/reset-password/page.tsx` | Reset password form (token from URL) |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Replace Poppins with Inter + IBM Plex Sans + IBM Plex Mono |
| `src/app/globals.css` | Add Coastal Midnight palette colors, marquee keyframes, reduced-motion query |
| `src/lib/db/schema.ts` | Add `rating`/`role` to testimonials, add `passwordResetTokens` table |
| `src/lib/db/seed.ts` | Add `rating`/`role` to seed data |
| `src/components/marketing/testimonial-card.tsx` | Redesign with star ratings, role, Coastal Midnight styling |
| `src/app/(main)/page.tsx` | Pass new props to testimonial cards, replace clients section with marquee |
| `src/app/(main)/auth/signin/page.tsx` | Coastal Midnight redesign, add forgot password link, SVG brand icons |
| `src/app/(main)/auth/signup/page.tsx` | Coastal Midnight redesign, SVG brand icons |
| `.env.local.example` | Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| `package.json` | Add `resend` dependency |

---

## Chunk 1: Typography System + Coastal Midnight Palette

### Task 1: Install Fonts in Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace Poppins with Inter + IBM Plex Sans + IBM Plex Mono**

Replace the font imports and configuration:

```tsx
import { Inter, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
```

Update the `<body>` className to include all three font variables:

```tsx
<body className={`${inter.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased min-h-screen selection:bg-orange-yellow-crayola selection:text-smoky-black bg-smoky-black text-light-gray`}>
```

- [ ] **Step 2: Verify fonts load**

Run: `pnpm dev`

Open browser DevTools → Elements → `<body>` should have CSS variables `--font-inter`, `--font-ibm-plex-sans`, `--font-ibm-plex-mono` set.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: replace Poppins with Inter + IBM Plex Sans + IBM Plex Mono font system"
```

### Task 2: Add Coastal Midnight Colors + Font Mappings to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add Coastal Midnight palette and font family mappings inside `@theme inline`**

Add these entries inside the existing `@theme inline { }` block, after the legacy colors:

```css
/* Coastal Midnight Palette */
--color-cm-bg: #0B1120;
--color-cm-surface: #111C35;
--color-cm-border: #1A2845;
--color-cm-ocean: #5BA4CF;
--color-cm-dusk: #E8A87C;
--color-cm-text: #D6E4F0;
--color-cm-muted: #5D7A9A;

/* Font Family Mappings */
--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
--font-body: var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono: var(--font-ibm-plex-mono), ui-monospace, monospace;
```

- [ ] **Step 2: Verify colors are available**

Run: `pnpm dev`

In browser DevTools, confirm that `bg-cm-bg` class produces `background-color: #0B1120`.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add Coastal Midnight color palette and font family mappings"
```

---

## Chunk 2: Testimonials Redesign

### Task 3: Add `rating` and `role` columns to testimonials schema

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add rating and role columns**

Add two new columns to the `testimonials` table definition, after the `avatar` field:

```typescript
role: text("role"),
rating: integer("rating").default(5).notNull(),
```

The full table should look like:

```typescript
export const testimonials = pgTable("testimonial", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  role: text("role"),
  rating: integer("rating").default(5).notNull(),
  testimonial: text("testimonial").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Push schema to database**

Run: `pnpm drizzle-kit push`

Expected: Columns `role` (nullable text) and `rating` (integer, default 5) added to `testimonial` table.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add rating and role columns to testimonials table"
```

### Task 4: Update seed data with ratings and roles

**Files:**
- Modify: `src/lib/db/seed.ts`

- [ ] **Step 1: Add role and rating to rawTestimonials**

```typescript
const rawTestimonials = [
  { name: "Danie T", avatar: "/images/avatar-1.png", role: "CTO, TechVentures", rating: 5, testimonial: "Festo was hired to develop our software solution. We were extremely impressed with his expertise in Python and JavaScript, delivering a top-notch product that exceeded our expectations." },
  { name: "Bakeine Grace", avatar: "/images/avatar-2.png", role: "Data Lead, AnalyticsCo", rating: 4, testimonial: "Festo provided exceptional data modeling services for our project. His proficiency in database programming ensured our data structures were optimized and efficient." },
  { name: "Jenny Eden", avatar: "/images/avatar-3.png", role: "Product Manager, WebFlow", rating: 5, testimonial: "Festo was hired to design our website. His skills with React and NextJS resulted in a highly responsive and user-friendly interface that our users love." },
  { name: "Edrine K", avatar: "/images/avatar-4.png", role: "Ops Director, DataSafe", rating: 4, testimonial: "Festo managed our database with great expertise. His attention to detail and knowledge in database management significantly improved our system's performance and reliability." },
];
```

- [ ] **Step 2: Include role and rating in the seed insert mapping**

Update the testimonials seed `.values()` mapping to include the new fields:

```typescript
rawTestimonials.map((t, i) => ({
  name: t.name,
  avatar: t.avatar,
  role: t.role,
  rating: t.rating,
  testimonial: t.testimonial,
  sortOrder: i,
}))
```

- [ ] **Step 3: Run seed to update**

Run: `pnpm db:seed`

Expected: Seed completes. (Existing rows won't be duplicated due to `onConflictDoNothing`, so you may need to clear the table first if you want the new data: run `DELETE FROM testimonial;` via docker exec, then re-seed.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/seed.ts
git commit -m "feat: add rating and role to testimonial seed data"
```

### Task 5: Redesign TestimonialCard component

**Files:**
- Modify: `src/components/marketing/testimonial-card.tsx`

- [ ] **Step 1: Rewrite the TestimonialCard with star ratings and Coastal Midnight styling**

```tsx
import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  avatar: string;
  role?: string;
  rating: number;
  testimonial: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-cm-dusk" : "text-cm-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialCard({ name, avatar, role, rating, testimonial }: TestimonialCardProps) {
  return (
    <div className="min-w-full sm:min-w-[calc(50%-8px)] shrink-0 snap-center">
      <div className="bg-cm-surface border border-cm-border rounded-2xl p-6 h-full flex flex-col">
        {/* Star Rating */}
        <StarRating rating={rating} />

        {/* Testimonial Text */}
        <blockquote className="text-cm-text text-sm font-light leading-relaxed mt-4 flex-1">
          <p>&ldquo;{testimonial}&rdquo;</p>
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-cm-border">
          <Image
            src={avatar}
            alt={name}
            width={44}
            height={44}
            className="rounded-full object-cover"
          />
          <div>
            <h4 className="text-cm-text text-sm font-semibold">{name}</h4>
            {role && (
              <p className="text-cm-muted text-xs">{role}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update homepage to pass new props**

In `src/app/(main)/page.tsx`, update the TestimonialCard usage (around line 78):

```tsx
<TestimonialCard
  key={index}
  name={testimonial.name}
  avatar={testimonial.avatar || "/images/avatar-1.png"}
  role={testimonial.role ?? undefined}
  rating={testimonial.rating}
  testimonial={testimonial.testimonial}
/>
```

- [ ] **Step 3: Verify in browser**

Run: `pnpm dev`

Navigate to homepage. Testimonial cards should show star ratings in warm dusk color, dark surface background, author info at bottom with role subtitle.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/testimonial-card.tsx src/app/\(main\)/page.tsx
git commit -m "feat: redesign testimonial cards with star ratings and Coastal Midnight palette"
```

---

## Chunk 3: Clients Auto-Scroll Marquee

### Task 6: Add marquee CSS keyframes

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add marquee animation and reduced-motion media query**

Add after the `@layer base { ... }` block at the bottom of the file:

```css
/* Marquee Animation */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add CSS marquee animation with reduced-motion support"
```

### Task 7: Replace clients section with marquee

**Files:**
- Modify: `src/app/(main)/page.tsx`

- [ ] **Step 1: Replace the entire Clients section (lines ~88-106)**

Replace the current clients `<section>` with:

```tsx
{/* Clients */}
<section className="mb-4">
  <h3 className="text-white-2 text-2xl font-semibold capitalize mb-6">
    Clients
  </h3>
  <div className="overflow-hidden relative">
    {/* Fade edges */}
    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-eerie-black-2 to-transparent z-10 pointer-events-none" />
    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-eerie-black-2 to-transparent z-10 pointer-events-none" />

    <div className="flex animate-marquee" style={{ width: "max-content" }}>
      {/* First set */}
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <div key={`a-${num}`} className="mx-8 flex items-center shrink-0">
          <Image
            src={`/images/logo-${num}-color.png`}
            alt={`Client ${num}`}
            width={120}
            height={40}
            className="filter grayscale opacity-50 hover:filter-none hover:opacity-100 transition-all duration-300 object-contain"
          />
        </div>
      ))}
      {/* Duplicate set for seamless loop */}
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <div key={`b-${num}`} className="mx-8 flex items-center shrink-0" aria-hidden="true">
          <Image
            src={`/images/logo-${num}-color.png`}
            alt=""
            width={120}
            height={40}
            className="filter grayscale opacity-50 hover:filter-none hover:opacity-100 transition-all duration-300 object-contain"
          />
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify marquee in browser**

Run: `pnpm dev`

Navigate to homepage. Client logos should scroll infinitely left-to-right with fade edges. Hovering should pause the animation. Logos should colorize on hover.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/page.tsx src/app/globals.css
git commit -m "feat: replace clients section with infinite auto-scroll marquee"
```

---

## Chunk 4: Sign-in / Sign-up Coastal Midnight Redesign

### Task 8: Redesign Sign-in page

**Files:**
- Modify: `src/app/(main)/auth/signin/page.tsx`

- [ ] **Step 1: Rewrite the SignInForm with Coastal Midnight palette and SVG brand icons**

Replace the entire `SignInForm` function body (keep the handler functions, update the JSX return):

```tsx
function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const oauthError = searchParams.get("error");
  const resetSuccess = searchParams.get("reset") === "true";
  const registeredSuccess = searchParams.get("registered") === "true";
  const oauthErrorMap: Record<string, string> = {
    OAuthSignin: "Could not start sign-in. Please try again.",
    OAuthCallback: "Sign-in failed. Please try again.",
    OAuthAccountNotLinked: "This email is already associated with another sign-in method.",
    Callback: "Sign-in failed. Please try again.",
    Default: "An unexpected error occurred. Please try again.",
  };
  const [error, setError] = useState<string | null>(
    oauthError ? oauthErrorMap[oauthError] || oauthErrorMap.Default : null
  );

  const handleCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading("credentials");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setIsLoading(null);
      return;
    }

    router.push(callbackUrl);
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-cm-text text-3xl font-semibold tracking-tight mb-2 font-[family-name:var(--font-inter)]">
              Welcome back
            </h1>
            <p className="text-cm-muted text-sm">Sign in to your FestoUG account</p>
          </div>

          {/* Success messages */}
          {resetSuccess && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
              Password reset successful. Sign in with your new password.
            </div>
          )}
          {registeredSuccess && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
              Account created! Sign in to get started.
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-2 border border-cm-border bg-cm-bg text-cm-text text-sm font-medium py-3 px-4 rounded-xl hover:bg-cm-border transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              {isLoading === "github" ? "..." : "GitHub"}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-2 border border-cm-border bg-cm-bg text-cm-text text-sm font-medium py-3 px-4 rounded-xl hover:bg-cm-border transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {isLoading === "google" ? "..." : "Google"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <hr className="flex-1 border-cm-border" />
            <span className="text-cm-muted text-xs">or with email</span>
            <hr className="flex-1 border-cm-border" />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 pr-12 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cm-muted hover:text-cm-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-cm-ocean text-xs hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading === "credentials" ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-cm-muted text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-cm-ocean hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

Remove the `Github, Chrome` imports from lucide-react (keep `Eye, EyeOff`).

- [ ] **Step 2: Verify in browser**

Run: `pnpm dev` → Navigate to `/auth/signin`

Expected: Dark ocean background (#0B1120), surface card (#111C35), visible borders (#1A2845), ocean blue focus rings (#5BA4CF), actual GitHub/Google SVG logos, "Forgot password?" link, proper labels above inputs.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/auth/signin/page.tsx
git commit -m "feat: redesign sign-in page with Coastal Midnight palette and SVG brand icons"
```

### Task 9: Redesign Sign-up page

**Files:**
- Modify: `src/app/(main)/auth/signup/page.tsx`

- [ ] **Step 1: Apply Coastal Midnight palette to sign-up form**

Update the JSX return to match the sign-in styling pattern. Key changes:

- Replace `bg-smoky-black` → `bg-cm-bg`
- Replace `bg-gradient-to-br from-[...] to-[...]` → `bg-cm-surface`
- Replace `border-jet` → `border-cm-border`
- Replace `text-white-2` → `text-cm-text`
- Replace `text-light-gray` → `text-cm-muted`
- Replace `focus:border-orange-yellow-crayola` → `focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean`
- Replace `bg-orange-yellow-crayola text-smoky-black` → `bg-cm-ocean text-cm-bg`
- Replace `text-orange-yellow-crayola` → `text-cm-ocean`
- Add `<label>` elements above each input with `text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider`
- Add `placeholder:text-cm-muted/50` to all inputs
- Remove the `absolute inset-[1px]` inner background div
- Add the same OAuth buttons (GitHub + Google) at top with divider, calling `signIn()` from `next-auth/react`

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading("credentials");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm = formData.get("confirm");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(null);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setIsLoading(null);
        return;
      }

      router.push("/auth/signin?registered=true");
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(null);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-cm-text text-3xl font-semibold tracking-tight mb-2 font-[family-name:var(--font-inter)]">
              Create your account
            </h1>
            <p className="text-cm-muted text-sm">Join FestoUG to access digital products</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-2 border border-cm-border bg-cm-bg text-cm-text text-sm font-medium py-3 px-4 rounded-xl hover:bg-cm-border transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              {isLoading === "github" ? "..." : "GitHub"}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-2 border border-cm-border bg-cm-bg text-cm-text text-sm font-medium py-3 px-4 rounded-xl hover:bg-cm-border transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {isLoading === "google" ? "..." : "Google"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <hr className="flex-1 border-cm-border" />
            <span className="text-cm-muted text-xs">or with email</span>
            <hr className="flex-1 border-cm-border" />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Full Name</label>
              <input id="name" type="text" name="name" placeholder="John Doe" required autoComplete="name"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50" />
            </div>
            <div>
              <label htmlFor="email" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input id="email" type="email" name="email" placeholder="you@example.com" required autoComplete="email"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50" />
            </div>
            <div>
              <label htmlFor="password" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} name="password" placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
                  className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 pr-12 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50" />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cm-muted hover:text-cm-text transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <input id="confirm" type={showPassword ? "text" : "password"} name="confirm" placeholder="Re-enter password" required minLength={8} autoComplete="new-password"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50" />
            </div>

            <button type="submit" disabled={!!isLoading}
              className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 mt-2">
              {isLoading === "credentials" ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-cm-muted text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-cm-ocean hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run: `pnpm dev` → Navigate to `/auth/signup`

Expected: Matches sign-in styling — Coastal Midnight palette, visible labels, proper contrast, OAuth buttons with actual brand SVGs.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/auth/signup/page.tsx
git commit -m "feat: redesign sign-up page with Coastal Midnight palette and OAuth buttons"
```

---

## Chunk 5: Forgot Password Flow (Resend)

### Task 10: Install Resend and create email utility

**Files:**
- Create: `src/lib/email.ts`
- Modify: `.env.local.example`
- Modify: `package.json` (via pnpm add)

- [ ] **Step 1: Install Resend SDK**

Run: `pnpm add resend`

- [ ] **Step 2: Add env vars to .env.local.example**

Add at the end:

```
# Resend (Password Reset Emails)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

- [ ] **Step 3: Create the email utility**

Create `src/lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: email,
    subject: "Reset your FestoUG password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #D6E4F0; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #5D7A9A; font-size: 14px; line-height: 1.6;">
          You requested a password reset. Click the button below to set a new password.
          This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #5BA4CF; color: #0B1120; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          Reset Password
        </a>
        <p style="color: #5D7A9A; font-size: 12px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/email.ts .env.local.example package.json pnpm-lock.yaml
git commit -m "feat: add Resend email utility for password reset"
```

### Task 11: Add password_reset_tokens table to schema

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add the passwordResetTokens table**

Add after the `bannedEmails` table, before the Relations section:

```typescript
// ─── Password Reset Tokens ──────────────────────────────────────────────────
export const passwordResetTokens = pgTable("password_reset_token", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Push schema to database**

Run: `pnpm drizzle-kit push`

Expected: `password_reset_token` table created with `id`, `user_id`, `token`, `expires_at`, `created_at` columns.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add password_reset_tokens table to schema"
```

### Task 12: Create forgot-password API route

**Files:**
- Create: `src/app/api/auth/forgot-password/route.ts`

- [ ] **Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { withRetry } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: "If an account exists with that email, a reset link has been sent.",
    });

    // Look up user — only send reset for credentials users (those with passwordHash)
    const [user] = await withRetry((db) =>
      db.select({ id: users.id, passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1)
    );

    if (!user || !user.passwordHash) {
      return successResponse;
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token
    await withRetry((db) =>
      db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      })
    );

    // Send email
    await sendPasswordResetEmail(email, token);

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/auth/forgot-password/route.ts
git commit -m "feat: add forgot-password API route with token generation"
```

### Task 13: Create reset-password API route

**Files:**
- Create: `src/app/api/auth/reset-password/route.ts`

- [ ] **Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { withRetry } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Find valid, non-expired token
    const [resetToken] = await withRetry((db) =>
      db.select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1)
    );

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(password, 12);

    await withRetry((db) =>
      db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, resetToken.userId))
    );

    // Delete all reset tokens for this user (cleanup)
    await withRetry((db) =>
      db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, resetToken.userId))
    );

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/auth/reset-password/route.ts
git commit -m "feat: add reset-password API route with token validation"
```

### Task 14: Create forgot-password page

**Files:**
- Create: `src/app/(main)/auth/forgot-password/page.tsx`

- [ ] **Step 1: Write the forgot password page**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl">
          {/* Back link */}
          <Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-cm-muted text-sm hover:text-cm-ocean transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-cm-ocean/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-cm-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Check your email</h1>
              <p className="text-cm-muted text-sm leading-relaxed">
                If an account exists for <strong className="text-cm-text">{email}</strong>, we&apos;ve sent a password reset link.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-cm-text text-2xl font-semibold mb-2">Forgot password?</h1>
                <p className="text-cm-muted text-sm">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(main\)/auth/forgot-password/page.tsx
git commit -m "feat: add forgot password page with email form"
```

### Task 15: Create reset-password page

**Files:**
- Create: `src/app/(main)/auth/reset-password/page.tsx`

- [ ] **Step 1: Write the reset password page**

```tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl text-center">
          <h1 className="text-cm-text text-2xl font-semibold mb-2">Invalid link</h1>
          <p className="text-cm-muted text-sm">This reset link is invalid or has expired. Please request a new one.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      router.push("/auth/signin?reset=true");
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl">
          <div className="mb-6">
            <h1 className="text-cm-text text-2xl font-semibold mb-2">Set new password</h1>
            <p className="text-cm-muted text-sm">Choose a strong password for your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 pr-12 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cm-muted hover:text-cm-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm" className="block text-cm-muted text-xs font-medium mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                name="confirm"
                placeholder="Re-enter password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-cm-bg border border-cm-border text-cm-text text-[15px] px-4 py-3 rounded-xl outline-none focus:border-cm-ocean focus:ring-1 focus:ring-cm-ocean transition-colors placeholder:text-cm-muted/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cm-ocean text-cm-bg font-semibold text-[15px] py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cm-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cm-ocean border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

- [ ] **Step 2: Verify the complete forgot password flow**

Run: `pnpm dev`

1. Navigate to `/auth/signin` → click "Forgot password?" → should go to `/auth/forgot-password`
2. Enter email → submit → should show "Check your email" confirmation
3. Navigate to `/auth/reset-password?token=test` → should show reset form
4. Submit with mismatched passwords → should show error

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/auth/reset-password/page.tsx
git commit -m "feat: add reset password page with token validation"
```

### Task 16: Final build verification

**Files:** None (verification only)

- [ ] **Step 1: Run build**

Run: `pnpm build`

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Final commit if any fixes needed**

If build reveals issues, fix them and commit with an appropriate message.

---

## Summary

| Chunk | Tasks | What it delivers |
|-------|-------|-----------------|
| 1 | 1-2 | Typography system + Coastal Midnight palette in CSS |
| 2 | 3-5 | Testimonial cards with star ratings, roles |
| 3 | 6-7 | Infinite auto-scroll clients marquee |
| 4 | 8-9 | Sign-in/sign-up redesign with Coastal Midnight |
| 5 | 10-16 | Full forgot password flow with Resend |

All chunks are independent and can be implemented in parallel by separate agents.

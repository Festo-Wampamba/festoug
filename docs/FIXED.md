# FIXED.md — Bug & Issue Resolution Log

> **Project:** festoug — Personal Portfolio (Next.js 15 / App Router)  
> **Author:** Festo Wampamba  
> **Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Drizzle ORM, Neon Postgres, Cloudinary, Vercel

This document records every significant bug, misconfiguration, or design issue encountered during development — what caused it, how it was diagnosed, how it was fixed, and what future developers should know to avoid it.

---

## Table of Contents

1. [React Hydration Mismatch — Testimonial Carousel](#1-react-hydration-mismatch--testimonial-carousel)
2. [Literal `\n` Characters Rendering in Resume Page](#2-literal-n-characters-rendering-in-resume-page)
3. [Vercel Deployment: Build Completing in Under 5 Seconds](#3-vercel-deployment-build-completing-in-under-5-seconds)
4. [Cloudinary Image Upload Failing in Production](#4-cloudinary-image-upload-failing-in-production)
5. [Cloudinary Cloud Name Typo — 401 Mismatch Error](#5-cloudinary-cloud-name-typo--401-mismatch-error)
6. [Broken Images on Homepage (next/image Remote Patterns)](#6-broken-images-on-homepage-nextimage-remote-patterns)
7. [Sidebar Cut Off on HP ProBook G2 & Lenovo 11e](#7-sidebar-cut-off-on-hp-probook-g2--lenovo-11e)
8. [Sidebar Empty Space and Text Truncation on Large Screens](#8-sidebar-empty-space-and-text-truncation-on-large-screens)
9. [`.gitignore` Missing Key Entries](#9-gitignore-missing-key-entries)

---

## 1. React Hydration Mismatch — Testimonial Carousel

### Symptom
The browser console showed:

```
Error: Hydration failed because the server rendered HTML didn't match the client.
"Slide 1 of 5" (server) vs "Slide 1 of 3" (client)
```

The testimonial carousel was broken on first load.

### Root Cause
The `perPage` state (how many cards to show per view) was initialised using a lazy function that read `window.innerWidth`:

```tsx
// WRONG — window is undefined on the server
const [perPage, setPerPage] = useState(() =>
  typeof window !== "undefined" ? (window.innerWidth >= 1280 ? 3 : 1) : 1
);
```

The server always returns `1` (no window), but the client re-evaluates immediately with the real window width, producing a different value. React detects this mismatch and throws the hydration error.

### Fix
Initialise the state to the server-safe default (`1`), then correct it on the client inside `useEffect` (which only runs after hydration):

```tsx
const [perPage, setPerPage] = useState(1);

useEffect(() => {
  const update = () => setPerPage(window.innerWidth >= 1280 ? 3 : 1);
  update();
  window.addEventListener("resize", update);
  return () => window.removeEventListener("resize", update);
}, []);
```

### Rule for Future Developers
**Never** read `window`, `document`, or any browser API inside a `useState` initialiser or the component render body. These run on the server too. Always defer browser-only logic to `useEffect`.

---

## 2. Literal `\n` Characters Rendering in Resume Page

### Symptom
The resume page rendered raw text like:

```
Developed backend APIs\nManaged PostgreSQL databases\nLed deployment on AWS
```

Instead of actual line breaks.

### Root Cause
JSX **string attributes** (double-quoted values) do **not** process escape sequences. `\n` inside a quoted string is stored as two characters: a backslash and the letter `n`.

```tsx
// WRONG — \n is not a newline here
<TimelineItem description="Developed APIs\nManaged databases" />
```

### Fix
Switch to a **template literal** wrapped in JSX braces. Template literals do process `\n` as a real newline:

```tsx
// CORRECT
<TimelineItem description={`Developed APIs\nManaged databases`} />
```

Or use an array of strings rendered with `<br />` between them.

### Rule for Future Developers
If you need escape sequences (`\n`, `\t`, Unicode `\u...`) inside JSX, always use a template literal `{``...``}`, never a plain string attribute `"..."`. The JSX spec treats attribute strings as literal character sequences.

---

## 3. Vercel Deployment: Build Completing in Under 5 Seconds

### Symptom
After pushing to `main`, Vercel deployments were completing in 5–219 ms and the live site returned a 404. Build logs showed no `pnpm install` or `next build` steps running.

### Root Cause
Two Vercel project settings were misconfigured:

1. **Build Command Override** was toggled ON with a custom value — this bypassed the real `next build`.
2. **Root Directory** was set to `./` — Vercel interprets this as an ambiguous path and skips the build.

Both settings together caused Vercel to treat each deployment as a no-op.

### Fix
In the Vercel dashboard → Project → Settings → Build & Development Settings:
- **Disable all Override toggles** (Build Command, Output Directory, Install Command).
- **Clear the Root Directory field** — leave it completely empty.

After saving, the next deployment ran a proper ~60 second build with full `pnpm install` and `next build` output.

### Rule for Future Developers
Only use Vercel override toggles when you have a non-standard monorepo or custom build pipeline. For standard Next.js projects, leave all overrides OFF and leave Root Directory empty. If a build completes in under 10 seconds without log output, suspect a skipped build, not a fast one.

---

## 4. Cloudinary Image Upload Failing in Production

### Symptom
Image uploads worked locally but failed in production on Vercel with a filesystem write error.

### Root Cause
The original upload route wrote uploaded files to `public/uploads/` using Node's `fs.writeFile`:

```ts
// WRONG in production
await fs.writeFile(`public/uploads/${filename}`, buffer);
```

**Vercel's filesystem is read-only at runtime.** Only the build output directory is writable during the build phase. Any runtime file write fails silently or throws.

### Fix
Replaced local filesystem storage with **Cloudinary** using the Node.js SDK v2. Files are uploaded as base64 data URIs directly to Cloudinary's CDN:

```ts
// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export { cloudinary };
```

```ts
// src/app/api/upload/route.ts
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
const result = await cloudinary.uploader.upload(base64, {
  folder: "festoug",
  resource_type: "image",
});
return NextResponse.json({ url: result.secure_url }, { status: 201 });
```

The returned `secure_url` is stored in the database instead of a local path.

### Required Environment Variables
Set these in Vercel → Project → Settings → Environment Variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Why `upload()` over `upload_stream()`
`upload_stream()` uses Node.js streams which can behave unpredictably in Vercel's serverless environment (request body may already be consumed). The base64 `upload()` method reads the entire buffer into memory first — more reliable for small-to-medium images in serverless functions.

### Rule for Future Developers
**Never write files to the local filesystem in a Vercel (or any serverless) deployment.** Use object storage (Cloudinary, AWS S3, Supabase Storage, Vercel Blob) for any user-uploaded content. The `public/` folder is only for static assets committed at build time.

---

## 5. Cloudinary Cloud Name Typo — 401 Mismatch Error

### Symptom
Cloudinary uploads returned:

```
Error: cloud_name mismatch — expected "di17wrrgb", received "dl17wrrgb"
HTTP 401 Unauthorized
```

### Root Cause
The cloud name `di17wrrgb` (letter **i**) was written everywhere as `dl17wrrgb` (letter **l**). The two characters look nearly identical in most fonts.

This caused every upload attempt to authenticate against the wrong Cloudinary account.

### Diagnosis
Ran a ping test locally to isolate the SDK config from the upload logic:

```bash
node -e "
const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
cloudinary.api.ping().then(console.log).catch(console.error);
"
```

The error message clearly showed the expected vs received cloud name, revealing the typo.

### Fix
Corrected the value in both:
- `.env.local` — `CLOUDINARY_CLOUD_NAME=di17wrrgb`
- Vercel Environment Variables dashboard — updated the same key

### Rule for Future Developers
When dealing with credential-based 401 errors, always **print the config values** before assuming the API itself is broken. A one-character typo in an environment variable is a common root cause. Use a `ping` or `health` endpoint to validate credentials independently of your feature code.

---

## 6. Broken Images on Homepage (next/image Remote Patterns)

### Symptom
After uploading a testimonial image via Cloudinary, the admin panel displayed it correctly (using a plain `<img>` tag) but the homepage showed a broken image icon.

### Root Cause
The `TestimonialCard` component used `next/image` (`import Image from "next/image"`). Next.js's `<Image>` component **blocks all external domains by default** for security. Without explicitly whitelisting `res.cloudinary.com`, the image request was denied at the Next.js level and returned a 400 error.

### Fix
Added a `remotePatterns` entry in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};
```

### Rule for Future Developers
Any time you use `next/image` with a URL from an external service (Cloudinary, S3, Supabase, a CMS, etc.), you **must** add the hostname to `remotePatterns` in `next.config.ts`. The plain `<img>` HTML tag has no such restriction — this is a common source of confusion when testing in admin panels that use `<img>` but the public site uses `<Image>`.

---

## 7. Sidebar Cut Off on HP ProBook G2 & Lenovo 11e

### Symptom
On HP ProBook G2 and Lenovo 11e laptops the sidebar either:
- Showed as a collapsed strip (only the profile photo + name, no contact items), or
- Showed partially clipped — contact items were hidden below the visible area.

The issue did not appear on the development machine.

### Root Cause — Wrong Breakpoint

The layout used the `xl:` Tailwind breakpoint (≥ 1280 px) to switch between stacked (mobile) and side-by-side (desktop) layouts:

```tsx
// WRONG — xl: is 1280px
<div className="flex flex-col xl:flex-row ...">
  <aside className="xl:w-[280px] xl:sticky ...">
```

Both HP ProBook G2 and Lenovo 11e have **1366 × 768 px physical screens**. However, with **Windows display scaling at 125%** (the default for these laptops), the browser reports a CSS viewport width of:

```
1366 ÷ 1.25 = 1093 px CSS pixels
```

`1093 px < 1280 px` → The `xl:` breakpoint never triggered → The layout stayed in stacked/mobile mode → The sidebar collapsed to `max-h-[148px]`, showing only the profile strip.

### Root Cause — Fixed Height Cap

The sidebar also had a viewport-capped height:

```tsx
xl:h-[calc(100vh-120px)]
```

At 768 px viewport height this is `648 px`. Combined with `overflow-hidden`, any content taller than this was silently clipped.

### Fix

**Step 1** — Lower breakpoint from `xl:` (1280 px) to `lg:` (1024 px) across all three layout files:

```tsx
// layout.tsx
<div className="flex flex-col lg:flex-row lg:mb-0 ...">
  <main className="lg:pt-[75px] ...">

// sidebar.tsx
<aside className="lg:w-[300px] lg:sticky lg:top-[30px] lg:self-start lg:h-auto ...">

// navbar.tsx
<nav className="lg:hidden ...">       {/* mobile pill */}
<nav className="hidden lg:block ..."> {/* desktop top nav */}
```

**Step 2** — Remove the fixed height cap and internal scroll:

```tsx
// BEFORE — capped and scrollable
lg:h-[calc(100vh-120px)] lg:flex lg:flex-col
// contact div: lg:flex-1 lg:min-h-0 lg:overflow-y-auto

// AFTER — natural height, no scroll
lg:h-auto lg:self-start lg:overflow-visible
// contact div: no height constraint, no overflow-y-auto
```

### Why `lg:` (1024 px) Is the Safe Threshold
| Device | Physical | Scaling | CSS pixels | xl: triggers? | lg: triggers? |
|---|---|---|---|---|---|
| HP ProBook G2 | 1366 px | 125% | 1093 px | ❌ No | ✅ Yes |
| Lenovo 11e | 1366 px | 125% | 1093 px | ❌ No | ✅ Yes |
| Standard 1080p | 1920 px | 100% | 1920 px | ✅ Yes | ✅ Yes |
| MacBook 13" | 1280 px | 100% | 1280 px | ✅ Yes | ✅ Yes |

### Rule for Future Developers
Always design breakpoints with **Windows display scaling in mind**. A 1366 px screen at 125% scaling is a very common laptop configuration. Using `lg:` (1024 px) as the desktop-layout breakpoint is safer than `xl:` (1280 px) for portfolio/personal sites that must work on budget business laptops. Check real device CSS pixel widths using the browser DevTools device toolbar, not the physical screen spec.

---

## 8. Sidebar Empty Space and Text Truncation on Large Screens

### Symptom
On wide/large desktop monitors (1080p+):
- The sidebar had a large empty grey area below the last contact item.
- The name "Wampamba Festo" showed as "Wampamba Fe..." (truncated).
- The location "Bugolobi, Kampala, Uganda" showed as "Bugoloobi, Ug..." (truncated).

### Root Cause — Flex Stretch

The layout container is `flex-row` on desktop. By default, flexbox items **stretch to fill the container's cross-axis height** (`align-items: stretch`). The sidebar had no `align-self` override, so it grew to match the height of the main content area — even when the main content was 2000+ px tall. The sidebar's own content was only ~650 px.

### Root Cause — Forced Truncation

The name used `whitespace-nowrap overflow-hidden text-ellipsis` unconditionally — even on desktop where there is plenty of width. With a 280 px sidebar and 24 px padding on each side, the inner text area was only 232 px — not enough for "Wampamba Festo" at desktop font sizes.

Same for the contact anchor: `truncate` (which is shorthand for `whitespace-nowrap overflow-hidden text-ellipsis`) clipped "Bugolobi, Kampala, Uganda".

### Fix

**Empty space:** Add `lg:self-start` to the aside — this overrides `align-self: stretch` and lets the sidebar shrink to its content height:

```tsx
<aside className="... lg:self-start">
```

**Name truncation:** Allow the name to wrap on desktop:

```tsx
<h1 className="... whitespace-nowrap overflow-hidden text-ellipsis lg:whitespace-normal lg:overflow-visible">
```

**Contact value truncation:** Allow contact links to wrap on desktop:

```tsx
<a className="... truncate lg:whitespace-normal lg:overflow-visible block">
```

**Slightly wider sidebar:** Increased from `lg:w-[280px]` to `lg:w-[300px]` to give all text comfortable room at any zoom level.

### Rule for Future Developers
- Always add `self-start` (or `align-self: flex-start`) to fixed-width sidebars in a flex-row layout. Without it, the sidebar will stretch to the height of the tallest sibling, creating empty space.
- Avoid applying `truncate`/`whitespace-nowrap` globally — scope it to mobile only (e.g., `whitespace-nowrap lg:whitespace-normal`). On desktop you have room to wrap; on mobile you need to clip.

---

## 9. `.gitignore` Missing Key Entries

### Symptom
Generated IDE and tool folders were being tracked by git and appeared in diffs.

### Fix
Added the following entries to `.gitignore`:

```gitignore
# IDE
.vscode/

# Playwright MCP browser automation state
.playwright-mcp/

# Local file uploads (not for production; use Cloudinary in prod)
public/uploads/
```

### Rule for Future Developers
- `.vscode/` contains editor-specific settings that differ per developer. Commit it only if your team has agreed on shared settings via a `settings.json` template.
- `public/uploads/` should never be committed. In production, all uploads go to Cloudinary. Locally, uploads to this folder are temporary.
- `.playwright-mcp/` is created by the Claude Playwright MCP server for browser automation state. It is machine-specific and should always be ignored.

---

## General Lessons Learned

| Category | Lesson |
|---|---|
| **Hydration** | Never read `window`/`document` at render time. Defer to `useEffect`. |
| **JSX strings** | Use template literals `{``...``}` for escape sequences. String attributes are literal. |
| **Vercel** | Serverless = read-only filesystem. All uploads must go to external storage. |
| **Breakpoints** | Target `lg:` (1024 px) for desktop layouts to account for Windows 125% scaling on 1366 px laptops. |
| **Flex layout** | Add `self-start` to sidebars. Without it, `align-items: stretch` causes empty space in flex-row layouts. |
| **next/image** | All external image domains must be whitelisted in `remotePatterns` in `next.config.ts`. |
| **Credentials** | Validate API keys independently (ping endpoint) before debugging application code. |
| **Vercel overrides** | Leave build overrides OFF and Root Directory empty for standard Next.js projects. |
| **Text overflow** | Apply `truncate`/`whitespace-nowrap` only on mobile. Allow text to wrap on desktop. |

---

*Last updated: April 2026*

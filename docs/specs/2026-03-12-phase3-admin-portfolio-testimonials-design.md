# Phase 3: Toast Notifications, Portfolio CRUD, Testimonial CRUD

## Overview

Three independent admin subsystems: a custom toast notification system replacing browser alerts, database-driven portfolio management with admin CRUD, and admin CRUD for the existing testimonials table.

## Tech Stack

- Next.js 16 App Router, React 19, Tailwind CSS v4
- Drizzle ORM + PostgreSQL (Docker local, Neon production)
- Zod v4 validation (`zod/v4`)
- Existing `/api/upload` route for file uploads
- Dark admin theme: `eerie-black-1`, `eerie-black-2`, `jet`, `orange-yellow-crayola`, `smoky-black`, `white-2`, `light-gray`, `light-gray-70`

---

## Part A: Toast Notification System

### Architecture

Custom React Context + portal. No external dependencies.

### Components

**`src/components/ui/toast-provider.tsx`** (client component)
- React Context providing `toast` object with methods: `success(message)`, `error(message)`, `info(message)`
- Internal state: array of `{ id, type, message }` objects
- Auto-dismiss after 4 seconds via `setTimeout`
- Manual dismiss via X button
- Renders toast container as a portal to `document.body`
- Max 5 visible toasts (oldest dismissed when limit exceeded)

**`src/components/ui/toast.tsx`** (client component)
- Individual toast rendering
- Variants by type:
  - `success`: green-500 left border + CheckCircle2 icon
  - `error`: red-500 left border + XCircle icon
  - `info`: blue-500 left border + Info icon
- Dark theme styling: `bg-eerie-black-1 border border-jet` with colored left border
- Slide-in from right animation, fade-out on dismiss
- X button top-right for manual dismiss

### Position

Fixed top-right corner (`top-4 right-4`), stacks downward with `gap-3`.

### Integration

- Wrap admin layout (`src/app/admin/layout.tsx`) with `<ToastProvider>`
- Also wrap main layout for customer-facing toasts (review form, helpful votes)
- Export `useToast` hook
- Replace error `alert()` calls with `toast.error()` in:
  - `src/components/admin/delete-blog-button.tsx`
  - `src/components/admin/delete-product-button.tsx`
  - `src/app/admin/reviews/review-admin-actions.tsx`
  - `src/app/(main)/dashboard/reviews/my-review-actions.tsx`
- Add success toasts after successful operations (delete, approve, reject)
- Keep `confirm()` dialogs as-is for destructive action confirmation (these require user decision, not notification)

### API

```typescript
const { toast } = useToast();
toast.success("Product deleted successfully");
toast.error("Failed to delete product");
toast.info("Review sent for moderation");
```

---

## Part B: Portfolio Admin CRUD

### Schema

The `projects` table already exists in `src/lib/db/schema.ts` with fields: id, title, slug (unique), category (text), image, description, liveUrl, repoUrl, isActive, sortOrder, createdAt.

**Extend the existing table** by adding these columns via ALTER TABLE:
- `isFeatured` boolean default false NOT NULL
- `updatedAt` timestamp default now() NOT NULL

Keep existing column names as-is (`image` not `imageUrl`, `repoUrl` not `githubUrl`, `category` as plain text not enum). The `category` field stays as free-text to match existing data (values like "Web development", "Software development", "Applications").

### Validation

New Zod schema in `src/lib/validations.ts`:

```
projectSchema:
  title:       string, min 1, max 200
  slug:        string, min 1, max 200, lowercase-alphanumeric-hyphens regex
  description: string, max 5000, nullable/optional
  image:       string, max 500, nullable/optional
  liveUrl:     string, url, max 500, nullable/optional
  repoUrl:     string, url, max 500, nullable/optional
  category:    string, min 1, max 100
  isFeatured:  boolean, optional, default false
  sortOrder:   number, int, optional, default 0
  isActive:    boolean, optional, default true
```

### Admin Pages

**`/admin/portfolio`** — List page
- Table/card view of all projects ordered by sortOrder
- Columns: thumbnail, title, category badge, featured badge, active status, actions
- "Add Project" button top-right
- Edit and delete actions per row

**`/admin/portfolio/new`** — Create page
- Form with all fields
- Image: URL input with optional upload button (uses `/api/upload`)
- Slug auto-generated from title (can be manually edited)

**`/admin/portfolio/[id]/edit`** — Edit page
- Same form pre-filled with existing data
- Delete button with confirmation

### API Routes

**`/api/admin/portfolio`**
- GET: List all projects (admin only), ordered by sortOrder
- POST: Create project (admin only), validate with projectSchema

**`/api/admin/portfolio/[id]`**
- PATCH: Update project (admin only)
- DELETE: Delete project (admin only)

### Public Page Migration

Modify `src/app/(main)/portfolio/page.tsx`:
- Replace static JSON import with database query
- Query: all projects where isActive = true, ordered by sortOrder
- Add category filter tabs derived from existing data (All + unique category values)
- Featured projects shown first

### Admin Nav

Add "Portfolio" entry with `FolderKanban` icon after "Reviews" in `src/components/admin/admin-nav.tsx`.

### Seed Data

Add seed function in `src/lib/db/seed.ts` that migrates data from `public/projects.json` into the projects table.

---

## Part E: Testimonial Admin CRUD

### Existing Schema

The `testimonials` table already exists with fields: id, name, avatar, role, rating (default 5), testimonial, isActive (default true), sortOrder (default 0), createdAt.

### Validation

New Zod schema in `src/lib/validations.ts`:

```
testimonialSchema:
  name:        string, min 1, max 100
  avatar:      string, max 500, nullable/optional
  role:        string, max 200, nullable/optional
  rating:      number, int, min 1, max 5
  testimonial: string, min 10, max 2000
  isActive:    boolean, optional, default true
  sortOrder:   integer, optional, default 0
```

### Admin Pages

**`/admin/testimonials`** — List page
- Cards showing avatar, name, role, star rating, testimonial preview, active status
- Toggle active/inactive inline
- Edit and delete actions
- "Add Testimonial" button top-right

**`/admin/testimonials/new`** — Create page
- Form: name, role, avatar (URL input + upload button), rating (StarRatingInput component reuse), testimonial textarea, isActive toggle, sortOrder number

**`/admin/testimonials/[id]/edit`** — Edit page
- Same form pre-filled
- Delete button with confirmation

### API Routes

**`/api/admin/testimonials`**
- GET: List all testimonials (admin only), ordered by sortOrder
- POST: Create testimonial (admin only), validate with testimonialSchema

**`/api/admin/testimonials/[id]`**
- PATCH: Update testimonial (admin only)
- DELETE: Delete testimonial (admin only)

### Avatar Upload

The avatar field supports two input methods:
1. Direct URL paste into text input
2. Upload button that calls `/api/upload`, receives URL back, and populates the text input

### Admin Nav

Add "Testimonials" entry with `Quote` icon after "Portfolio" in `src/components/admin/admin-nav.tsx`.

---

## File Map

### New Files
- `src/components/ui/toast-provider.tsx` — Toast context + portal container
- `src/components/ui/toast.tsx` — Individual toast component
- `src/app/admin/portfolio/page.tsx` — Portfolio list page
- `src/app/admin/portfolio/new/page.tsx` — Create portfolio page
- `src/app/admin/portfolio/[id]/edit/page.tsx` — Edit portfolio page
- `src/components/admin/portfolio-form.tsx` — Shared portfolio form (client component)
- `src/app/api/admin/portfolio/route.ts` — GET + POST
- `src/app/api/admin/portfolio/[id]/route.ts` — PATCH + DELETE
- `src/app/admin/testimonials/page.tsx` — Testimonials list page
- `src/app/admin/testimonials/new/page.tsx` — Create testimonial page
- `src/app/admin/testimonials/[id]/edit/page.tsx` — Edit testimonial page
- `src/components/admin/testimonial-form.tsx` — Shared testimonial form (client component)
- `src/app/api/admin/testimonials/route.ts` — GET + POST
- `src/app/api/admin/testimonials/[id]/route.ts` — PATCH + DELETE

### Modified Files
- `src/lib/db/schema.ts` — Extend existing projects table (add isFeatured, updatedAt columns)
- `src/lib/validations.ts` — Add projectSchema, testimonialSchema
- `src/lib/db/seed.ts` — Add portfolio seed from projects.json
- `src/app/admin/layout.tsx` — Wrap with ToastProvider
- `src/app/(main)/layout.tsx` — Wrap with ToastProvider
- `src/components/admin/admin-nav.tsx` — Add Portfolio + Testimonials nav items
- `src/app/(main)/portfolio/page.tsx` — Migrate from JSON to DB query + category filters
- `src/components/admin/delete-blog-button.tsx` — Replace alert() with toast
- `src/components/admin/delete-product-button.tsx` — Replace alert() with toast
- `src/app/admin/reviews/review-admin-actions.tsx` — Replace alert() with toast
- `src/app/(main)/dashboard/reviews/my-review-actions.tsx` — Add success/error toasts (keep confirm() for delete)

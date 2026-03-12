# Phase 2: Customer Review & Rating System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a verified-buyer review system with star ratings, smart auto-publish moderation, and admin management — integrated into product pages, customer dashboard, and admin panel.

**Architecture:** Reviews are stored in a `reviews` table linked to users, products, and orders. Smart auto-publish: 3-5 star reviews go live immediately, 1-2 star reviews enter a pending queue for admin approval. One review per customer per product, editable. A `review_helpful_votes` table tracks "Was this helpful?" votes. Customer dashboard gets a "My Reviews" section. Admin gets a review management page with approve/reject/delete actions. Product pages display reviews with aggregate ratings.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM + PostgreSQL, Zod validation, NextAuth JWT sessions, Tailwind CSS v4 (dark theme: eerie-black-1/jet/orange-yellow-crayola), Lucide React icons.

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/lib/db/schema.ts` | (modify) Add `reviewStatusEnum`, `reviews` table, `reviewHelpfulVotes` table, relations |
| `src/lib/validations.ts` | (modify) Add `reviewSchema` Zod validator |
| `src/components/reviews/star-rating-input.tsx` | Interactive star rating selector (client component) |
| `src/components/reviews/review-card.tsx` | Single review display card (renders HelpfulButton client child) |
| `src/components/reviews/review-form.tsx` | Create/edit review form (client component) |
| `src/components/reviews/helpful-button.tsx` | "Was this helpful?" vote button (client component) |
| `src/app/api/reviews/route.ts` | POST create review (customer) |
| `src/app/api/reviews/[id]/route.ts` | PATCH update, DELETE own review (customer) |
| `src/app/api/reviews/[id]/helpful/route.ts` | POST toggle helpful vote (customer) |
| `src/app/api/reviews/product/[productId]/route.ts` | GET reviews for a product (public) |
| `src/app/api/admin/reviews/route.ts` | GET all reviews with filters (admin) |
| `src/app/api/admin/reviews/[id]/route.ts` | PATCH approve/reject, DELETE review (admin) |
| `src/app/admin/reviews/page.tsx` | Admin review management page |
| `src/app/(main)/dashboard/reviews/page.tsx` | Customer "My Reviews" dashboard page |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/db/schema.ts` | Add reviewStatusEnum, reviews table, reviewHelpfulVotes table, relations |
| `src/lib/validations.ts` | Add reviewSchema |
| `src/app/(main)/store/[slug]/page.tsx` | Add reviews section below product details |
| `src/app/(main)/dashboard/purchases/page.tsx` | Add "Write Review" button on completed orders |
| `src/components/dashboard/dashboard-nav.tsx` | Add "Reviews" nav link after "Purchases" |
| `src/app/admin/page.tsx` | Add reviews stats card |
| `src/components/admin/admin-nav.tsx` | Add "Reviews" link after "Orders" in admin nav |

---

## Chunk 1: Database Schema & Validation

### Task 1: Add review status enum and reviews table to schema

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add the reviewStatusEnum after existing enums**

Add `uniqueIndex` to the imports from `drizzle-orm/pg-core`:

```typescript
import { ..., uniqueIndex } from "drizzle-orm/pg-core";
```

Add after the `accountStatusEnum` definition:

```typescript
export const reviewStatusEnum = pgEnum("review_status", [
  "APPROVED",
  "PENDING",
  "REJECTED",
]);
```

- [ ] **Step 2: Add the reviews table after the `passwordResetTokens` table**

```typescript
export const reviews = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: reviewStatusEnum("status").default("PENDING").notNull(),
    helpfulCount: integer("helpful_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    productIdx: index("review_product_idx").on(t.productId),
    userIdx: index("review_user_idx").on(t.userId),
    statusIdx: index("review_status_idx").on(t.status),
    userProductUniq: uniqueIndex("review_user_product_uniq").on(t.userId, t.productId),
  })
);
```

- [ ] **Step 3: Add the reviewHelpfulVotes table after reviews**

```typescript
export const reviewHelpfulVotes = pgTable(
  "review_helpful_vote",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    reviewIdx: index("helpful_vote_review_idx").on(t.reviewId),
    userReviewUniq: uniqueIndex("helpful_vote_user_review_uniq").on(t.reviewId, t.userId),
  })
);
```

- [ ] **Step 4: Add relations for reviews and reviewHelpfulVotes**

Add after the existing relations blocks:

```typescript
export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
  helpfulVotes: many(reviewHelpfulVotes),
}));

export const reviewHelpfulVotesRelations = relations(reviewHelpfulVotes, ({ one }) => ({
  review: one(reviews, { fields: [reviewHelpfulVotes.reviewId], references: [reviews.id] }),
  user: one(users, { fields: [reviewHelpfulVotes.userId], references: [users.id] }),
}));
```

- [ ] **Step 5: Add reviews relation to existing usersRelations and productsRelations**

In `usersRelations`, add: `reviews: many(reviews),`
In `productsRelations`, add: `reviews: many(reviews),`
In `ordersRelations`, add: `reviews: many(reviews),`

- [ ] **Step 6: Push schema to database**

Run: `docker exec festoug-db psql -U festoug -d festoug` with the following SQL:

```sql
CREATE TYPE review_status AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

CREATE TABLE review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status review_status NOT NULL DEFAULT 'PENDING',
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX review_product_idx ON review(product_id);
CREATE INDEX review_user_idx ON review(user_id);
CREATE INDEX review_status_idx ON review(status);
CREATE UNIQUE INDEX review_user_product_uniq ON review(user_id, product_id);

CREATE TABLE review_helpful_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES review(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX helpful_vote_review_idx ON review_helpful_vote(review_id);
CREATE UNIQUE INDEX helpful_vote_user_review_uniq ON review_helpful_vote(review_id, user_id);
```

- [ ] **Step 7: Verify schema**

Run: `docker exec festoug-db psql -U festoug -d festoug -c "\d review"`
Expected: Table with all columns matching schema definition.

- [ ] **Step 8: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add reviews and helpful_votes tables to schema"
```

---

### Task 2: Add Zod validation schema for reviews

**Files:**
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Add reviewSchema after existing schemas**

```typescript
export const reviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be under 200 characters"),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review must be under 2000 characters"),
});

export const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be under 200 characters"),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review must be under 2000 characters"),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat: add Zod validation schemas for reviews"
```

---

## Chunk 2: Customer-Facing API Routes

### Task 3: Create review API route (POST — create review)

**Files:**
- Create: `src/app/api/reviews/route.ts`

- [ ] **Step 1: Create the POST handler**

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, orders } from "@/lib/db/schema";
import { reviewSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = reviewSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { productId, orderId, rating, title, body: reviewBody } = result.data;

  // Verify the order belongs to this user and is completed
  const order = await db.query.orders.findFirst({
    where: and(
      eq(orders.id, orderId),
      eq(orders.userId, session.user.id),
      eq(orders.productId, productId),
      eq(orders.status, "COMPLETED")
    ),
  });

  if (!order) {
    return NextResponse.json(
      { error: "You can only review products you have purchased" },
      { status: 403 }
    );
  }

  // Check if user already reviewed this product
  const existingReview = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.userId, session.user.id),
      eq(reviews.productId, productId)
    ),
  });

  if (existingReview) {
    return NextResponse.json(
      { error: "You have already reviewed this product. You can edit your existing review." },
      { status: 409 }
    );
  }

  // Smart auto-publish: 3-5 stars auto-approve, 1-2 stars pending
  const status = rating >= 3 ? "APPROVED" : "PENDING";

  const [review] = await db
    .insert(reviews)
    .values({
      userId: session.user.id,
      productId,
      orderId,
      rating,
      title,
      body: reviewBody,
      status,
    })
    .returning();

  return NextResponse.json(review, { status: 201 });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/reviews/route.ts
git commit -m "feat: add POST /api/reviews for creating reviews"
```

---

### Task 4: Create review update/delete API route

**Files:**
- Create: `src/app/api/reviews/[id]/route.ts`

- [ ] **Step 1: Create PATCH and DELETE handlers**

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { reviewUpdateSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = reviewUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Verify ownership
  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.id, id), eq(reviews.userId, session.user.id)),
  });

  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const { rating, title, body: reviewBody } = result.data;

  // Smart auto-publish on edit: 3+ stars auto-approve UNLESS admin previously rejected
  const status = existing.status === "REJECTED"
    ? "PENDING"  // Admin rejected — edits go back to pending for re-review
    : rating >= 3 ? "APPROVED" : "PENDING";

  const [updated] = await db
    .update(reviews)
    .set({ rating, title, body: reviewBody, status, updatedAt: new Date() })
    .where(and(eq(reviews.id, id), eq(reviews.userId, session.user.id)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.id, id), eq(reviews.userId, session.user.id)),
  });

  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  await db
    .delete(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/reviews/[id]/route.ts
git commit -m "feat: add PATCH/DELETE /api/reviews/[id] for editing/deleting own reviews"
```

---

### Task 5: Create helpful vote API route

**Files:**
- Create: `src/app/api/reviews/[id]/helpful/route.ts`

- [ ] **Step 1: Create POST toggle handler**

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, reviewHelpfulVotes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check review exists
  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, id),
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Can't vote on own review
  if (review.userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot vote on your own review" },
      { status: 400 }
    );
  }

  // Toggle vote atomically
  const existingVote = await db.query.reviewHelpfulVotes.findFirst({
    where: and(
      eq(reviewHelpfulVotes.reviewId, id),
      eq(reviewHelpfulVotes.userId, session.user.id)
    ),
  });

  if (existingVote) {
    await db.transaction(async (tx) => {
      await tx
        .delete(reviewHelpfulVotes)
        .where(eq(reviewHelpfulVotes.id, existingVote.id));
      await tx
        .update(reviews)
        .set({ helpfulCount: sql`${reviews.helpfulCount} - 1` })
        .where(eq(reviews.id, id));
    });
    return NextResponse.json({ voted: false });
  } else {
    await db.transaction(async (tx) => {
      await tx.insert(reviewHelpfulVotes).values({
        reviewId: id,
        userId: session.user.id,
      });
      await tx
        .update(reviews)
        .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
        .where(eq(reviews.id, id));
    });
    return NextResponse.json({ voted: true });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/reviews/[id]/helpful/route.ts
git commit -m "feat: add POST /api/reviews/[id]/helpful for toggling helpful votes"
```

---

### Task 6: Create public product reviews API route

**Files:**
- Create: `src/app/api/reviews/product/[productId]/route.ts`

- [ ] **Step 1: Create GET handler**

```typescript
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const productReviews = await db.query.reviews.findMany({
    where: and(
      eq(reviews.productId, productId),
      eq(reviews.status, "APPROVED")
    ),
    with: {
      user: { columns: { id: true, name: true, image: true } },
    },
    orderBy: [desc(reviews.createdAt)],
  });

  return NextResponse.json(productReviews);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/reviews/product/[productId]/route.ts
git commit -m "feat: add GET /api/reviews/product/[productId] for public reviews"
```

---

## Chunk 3: Admin API Routes & Admin Page

### Task 7: Create admin reviews API routes

**Files:**
- Create: `src/app/api/admin/reviews/route.ts`
- Create: `src/app/api/admin/reviews/[id]/route.ts`

- [ ] **Step 1: Create admin GET all reviews route**

```typescript
// src/app/api/admin/reviews/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const validStatuses = ["APPROVED", "PENDING", "REJECTED"];
  const statusFilter = status && validStatuses.includes(status) ? status as "APPROVED" | "PENDING" | "REJECTED" : undefined;

  const allReviews = await db.query.reviews.findMany({
    where: statusFilter ? eq(reviews.status, statusFilter) : undefined,
    with: {
      user: { columns: { id: true, name: true, email: true, image: true } },
      product: { columns: { id: true, name: true, slug: true } },
    },
    orderBy: [desc(reviews.createdAt)],
  });

  return NextResponse.json(allReviews);
}
```

- [ ] **Step 2: Create admin PATCH/DELETE review route**

```typescript
// src/app/api/admin/reviews/[id]/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["APPROVED", "PENDING", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(reviews)
    .set({ status, updatedAt: new Date() })
    .where(eq(reviews.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.delete(reviews).where(eq(reviews.id, id));
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/reviews/route.ts src/app/api/admin/reviews/[id]/route.ts
git commit -m "feat: add admin review management API routes"
```

---

### Task 8: Create admin reviews management page

**Files:**
- Create: `src/app/admin/reviews/page.tsx`

- [ ] **Step 1: Create the admin reviews page**

```tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Star, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReviewAdminActions } from "./review-admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/");

  const { status } = await searchParams;

  const allReviews = await db.query.reviews.findMany({
    where: status
      ? eq(reviews.status, status as "APPROVED" | "PENDING" | "REJECTED")
      : undefined,
    with: {
      user: { columns: { id: true, name: true, email: true, image: true } },
      product: { columns: { id: true, name: true, slug: true } },
    },
    orderBy: [desc(reviews.createdAt)],
  });

  const pendingCount = allReviews.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-light-gray-70 hover:text-orange-yellow-crayola transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold text-white-2">
            Reviews Management
            {pendingCount > 0 && (
              <span className="ml-3 text-sm bg-orange-400/10 text-orange-400 border border-orange-400/20 px-2.5 py-1 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { label: "All", value: "" },
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Rejected", value: "REJECTED" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/reviews?status=${tab.value}` : "/admin/reviews"}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              (status || "") === tab.value
                ? "bg-orange-yellow-crayola text-smoky-black"
                : "bg-eerie-black-1 text-light-gray-70 border border-jet hover:text-white-2"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {allReviews.length === 0 ? (
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-10 text-center text-light-gray">
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allReviews.map((review) => (
            <div
              key={review.id}
              className="bg-eerie-black-1 border border-jet rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white-2 font-semibold">
                      {review.user.name || review.user.email}
                    </span>
                    <span className="text-light-gray-70 text-sm">on</span>
                    <Link
                      href={`/store/${review.product.slug}`}
                      className="text-orange-yellow-crayola text-sm hover:underline"
                    >
                      {review.product.name}
                    </Link>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        review.status === "APPROVED"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : review.status === "PENDING"
                          ? "bg-orange-400/10 text-orange-400 border border-orange-400/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= review.rating
                            ? "text-orange-yellow-crayola fill-orange-yellow-crayola"
                            : "text-jet"
                        }`}
                      />
                    ))}
                  </div>

                  <h4 className="text-white-2 font-medium mb-1">{review.title}</h4>
                  <p className="text-light-gray text-sm leading-relaxed">{review.body}</p>
                  <p className="text-light-gray-70 text-xs mt-2">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {review.helpfulCount > 0 && (
                      <span className="ml-3">
                        {review.helpfulCount} found helpful
                      </span>
                    )}
                  </p>
                </div>

                <ReviewAdminActions reviewId={review.id} status={review.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create the ReviewAdminActions client component**

Create `src/app/admin/reviews/review-admin-actions.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";

export function ReviewAdminActions({
  reviewId,
  status,
}: {
  reviewId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "APPROVED" | "REJECTED" | "delete") {
    setLoading(true);
    try {
      if (action === "delete") {
        if (!confirm("Delete this review permanently?")) {
          setLoading(false);
          return;
        }
        await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      } else {
        await fetch(`/api/admin/reviews/${reviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action }),
        });
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {status !== "APPROVED" && (
        <button
          onClick={() => handleAction("APPROVED")}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors"
          title="Approve"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-orange-400/10 text-orange-400 transition-colors"
          title="Reject"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
      <button
        onClick={() => handleAction("delete")}
        disabled={loading}
        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Add Reviews link to admin nav**

In `src/components/admin/admin-nav.tsx`, add a "Reviews" navigation item to the `navItems` array after "Orders". Import `Star` from lucide-react and add: `{ label: "Reviews", href: "/admin/reviews", icon: Star }`.

- [ ] **Step 4: Add reviews pending count to admin dashboard**

In `src/app/admin/page.tsx`, add a card showing pending review count, matching existing stat card styling.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/reviews/ src/components/admin/admin-nav.tsx src/app/admin/page.tsx
git commit -m "feat: add admin reviews management page with approve/reject/delete"
```

---

## Chunk 4: Review UI Components

### Task 9: Create StarRatingInput component

**Files:**
- Create: `src/components/reviews/star-rating-input.tsx`

- [ ] **Step 1: Create interactive star rating selector**

```tsx
"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? "text-orange-yellow-crayola fill-orange-yellow-crayola"
                : "text-jet"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reviews/star-rating-input.tsx
git commit -m "feat: add StarRatingInput interactive component"
```

---

### Task 10: Create ReviewCard component

**Files:**
- Create: `src/components/reviews/review-card.tsx`

- [ ] **Step 1: Create review display card**

```tsx
import { Star, ThumbsUp } from "lucide-react";
import { HelpfulButton } from "./helpful-button";

interface ReviewCardProps {
  id: string;
  userName: string;
  userImage?: string | null;
  rating: number;
  title: string;
  body: string;
  helpfulCount: number;
  createdAt: string;
  isOwnReview: boolean;
  hasVoted: boolean;
  isAuthenticated: boolean;
}

export function ReviewCard({
  id,
  userName,
  userImage,
  rating,
  title,
  body,
  helpfulCount,
  createdAt,
  isOwnReview,
  hasVoted,
  isAuthenticated,
}: ReviewCardProps) {
  return (
    <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-eerie-black-2 border border-jet flex items-center justify-center shrink-0 overflow-hidden">
          {userImage ? (
            <img src={userImage} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-orange-yellow-crayola font-bold text-sm">
              {userName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-white-2 font-medium text-sm">{userName}</span>
            <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full">
              Verified Purchase
            </span>
          </div>

          {/* Stars + date */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= rating
                      ? "text-orange-yellow-crayola fill-orange-yellow-crayola"
                      : "text-jet"
                  }`}
                />
              ))}
            </div>
            <span className="text-light-gray-70 text-xs">
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <h4 className="text-white-2 font-semibold text-sm mb-1">{title}</h4>
          <p className="text-light-gray text-sm leading-relaxed">{body}</p>

          {/* Helpful */}
          <div className="mt-4 flex items-center gap-3">
            {!isOwnReview && isAuthenticated && (
              <HelpfulButton
                reviewId={id}
                initialCount={helpfulCount}
                initialVoted={hasVoted}
              />
            )}
            {(isOwnReview || !isAuthenticated) && helpfulCount > 0 && (
              <span className="text-light-gray-70 text-xs flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" />
                {helpfulCount} found helpful
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reviews/review-card.tsx
git commit -m "feat: add ReviewCard display component"
```

---

### Task 11: Create HelpfulButton component

**Files:**
- Create: `src/components/reviews/helpful-button.tsx`

- [ ] **Step 1: Create the toggle helpful vote button**

```tsx
"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

interface HelpfulButtonProps {
  reviewId: string;
  initialCount: number;
  initialVoted: boolean;
}

export function HelpfulButton({ reviewId, initialCount, initialVoted }: HelpfulButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setVoted(data.voted);
        setCount((prev) => (data.voted ? prev + 1 : prev - 1));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
        voted
          ? "bg-orange-yellow-crayola/10 text-orange-yellow-crayola border-orange-yellow-crayola/20"
          : "text-light-gray-70 border-jet hover:text-white-2 hover:border-light-gray-70"
      }`}
    >
      <ThumbsUp className="w-3.5 h-3.5" />
      Helpful{count > 0 ? ` (${count})` : ""}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reviews/helpful-button.tsx
git commit -m "feat: add HelpfulButton toggle vote component"
```

---

### Task 12: Create ReviewForm component

**Files:**
- Create: `src/components/reviews/review-form.tsx`

- [ ] **Step 1: Create the review form**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRatingInput } from "./star-rating-input";

interface ReviewFormProps {
  productId: string;
  orderId: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string;
    body: string;
  };
  onClose?: () => void;
}

export function ReviewForm({ productId, orderId, existingReview, onClose }: ReviewFormProps) {
  const router = useRouter();
  const isEdit = !!existingReview;
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const body = form.get("body") as string;

    try {
      const url = isEdit
        ? `/api/reviews/${existingReview.id}`
        : "/api/reviews";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? { rating, title, body }
            : { productId, orderId, rating, title, body }
        ),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
        return;
      }

      router.refresh();
      onClose?.();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-light-gray text-sm font-medium mb-2">Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-title" className="block text-light-gray text-sm font-medium mb-2">
          Title
        </label>
        <input
          id="review-title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={200}
          defaultValue={existingReview?.title}
          placeholder="Summarize your experience"
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors"
        />
      </div>

      <div>
        <label htmlFor="review-body" className="block text-light-gray text-sm font-medium mb-2">
          Review
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          defaultValue={existingReview?.body}
          placeholder="Share your thoughts about this product..."
          className="w-full bg-eerie-black-2 border border-jet rounded-xl px-4 py-3 text-white-2 text-sm placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola transition-colors resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-orange-yellow-crayola/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Submitting..." : isEdit ? "Update Review" : "Submit Review"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-light-gray-70 px-6 py-3 rounded-xl text-sm hover:text-white-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {rating > 0 && rating < 3 && (
        <p className="text-light-gray-70 text-xs">
          Reviews with 1-2 stars are reviewed by our team before publishing.
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reviews/review-form.tsx
git commit -m "feat: add ReviewForm create/edit component"
```

---

## Chunk 5: Page Integrations

### Task 13: Add reviews section to product detail page

**Files:**
- Modify: `src/app/(main)/store/[slug]/page.tsx`

- [ ] **Step 1: Import required modules and add reviews query**

At the top of the file, add imports:

```typescript
import { reviews, reviewHelpfulVotes, orders } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewForm } from "@/components/reviews/review-form";
import { Star } from "lucide-react";
```

- [ ] **Step 2: Add reviews data fetching inside the page component**

After the product query, add:

```typescript
const session = await auth();

// Fetch approved reviews with user info
const productReviews = await withRetry((db) =>
  db.query.reviews.findMany({
    where: and(
      eq(reviews.productId, product.id),
      eq(reviews.status, "APPROVED")
    ),
    with: {
      user: { columns: { id: true, name: true, image: true } },
    },
    orderBy: [desc(reviews.createdAt)],
  })
);

// Calculate aggregate stats
const totalReviews = productReviews.length;
const avgRating = totalReviews > 0
  ? productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
  : 0;

// Get user's helpful votes for these reviews
let userVotedReviewIds: Set<string> = new Set();
if (session?.user?.id) {
  const votes = await withRetry((db) =>
    db.query.reviewHelpfulVotes.findMany({
      where: eq(reviewHelpfulVotes.userId, session.user.id),
      columns: { reviewId: true },
    })
  );
  userVotedReviewIds = new Set(votes.map((v) => v.reviewId));
}

// Check if user can write a review (has a completed order for this product)
let canReview = false;
let userOrder: { id: string } | undefined;
let existingUserReview: { id: string; rating: number; title: string; body: string } | undefined;

if (session?.user?.id) {
  userOrder = await withRetry((db) =>
    db.query.orders.findFirst({
      where: and(
        eq(orders.userId, session.user.id),
        eq(orders.productId, product.id),
        eq(orders.status, "COMPLETED")
      ),
      columns: { id: true },
    })
  ) ?? undefined;

  if (userOrder) {
    const existing = await withRetry((db) =>
      db.query.reviews.findFirst({
        where: and(
          eq(reviews.userId, session.user.id),
          eq(reviews.productId, product.id)
        ),
        columns: { id: true, rating: true, title: true, body: true },
      })
    );
    existingUserReview = existing ?? undefined;
    canReview = !existing; // Can write new review if none exists
  }
}
```

- [ ] **Step 3: Add reviews section in the JSX after the Product Overview section**

Add inside the `lg:col-span-8 space-y-10` div, after the Product Overview `<section>`:

```tsx
{/* Reviews Section */}
<section className="bg-eerie-black-1 border border-jet rounded-[20px] p-8 shadow-1">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-2xl font-bold text-white-2 flex items-center gap-3">
      <span className="bg-orange-yellow-crayola/10 text-orange-yellow-crayola p-2 rounded-xl">
        <Star className="w-5 h-5" />
      </span>
      Customer Reviews
    </h3>
    {totalReviews > 0 && (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${
                s <= Math.round(avgRating)
                  ? "text-orange-yellow-crayola fill-orange-yellow-crayola"
                  : "text-jet"
              }`}
            />
          ))}
        </div>
        <span className="text-white-2 font-medium text-sm">
          {avgRating.toFixed(1)}
        </span>
        <span className="text-light-gray-70 text-sm">
          ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
        </span>
      </div>
    )}
  </div>

  {productReviews.length === 0 ? (
    <p className="text-light-gray-70 text-sm">
      No reviews yet. Purchase this product to be the first to leave a review!
    </p>
  ) : (
    <div className="space-y-4">
      {productReviews.map((review) => (
        <ReviewCard
          key={review.id}
          id={review.id}
          userName={review.user.name || "Anonymous"}
          userImage={review.user.image}
          rating={review.rating}
          title={review.title}
          body={review.body}
          helpfulCount={review.helpfulCount}
          createdAt={review.createdAt.toISOString()}
          isOwnReview={review.userId === session?.user?.id}
          hasVoted={userVotedReviewIds.has(review.id)}
          isAuthenticated={!!session?.user?.id}
        />
      ))}
    </div>
  )}

  {/* Write / Edit Review Form */}
  {(canReview || existingUserReview) && userOrder && (
    <div id={existingUserReview ? "edit-review" : "write-review"} className="mt-8 pt-6 border-t border-jet">
      <h4 className="text-lg font-semibold text-white-2 mb-4">
        {existingUserReview ? "Edit Your Review" : "Write a Review"}
      </h4>
      <ReviewForm
        productId={product.id}
        orderId={userOrder.id}
        existingReview={existingUserReview}
      />
    </div>
  )}
</section>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(main)/store/[slug]/page.tsx
git commit -m "feat: add customer reviews section with inline review form to product detail page"
```

---

### Task 14: Add "Write Review" button to purchases page

**Files:**
- Modify: `src/app/(main)/dashboard/purchases/page.tsx`

- [ ] **Step 1: Import review-related modules**

Add imports at the top:

```typescript
import { reviews } from "@/lib/db/schema";
import { Star } from "lucide-react";
```

- [ ] **Step 2: Fetch user's existing reviews**

After the orders query, add:

```typescript
const userReviews = await withRetry((db) =>
  db.query.reviews.findMany({
    where: eq(reviews.userId, session.user.id),
    columns: { id: true, productId: true },
  })
);
const reviewedProductIds = new Set(userReviews.map((r) => r.productId));
```

- [ ] **Step 3: Add review button in the order card actions**

Inside the actions `div` (after the Receipt button), add conditionally for completed orders:

```tsx
{isCompleted && product && (
  reviewedProductIds.has(product.id) ? (
    <Link
      href="/dashboard/reviews"
      className="flex items-center justify-center gap-2 bg-transparent text-green-500 border border-green-500/20 px-6 py-3 rounded-xl font-medium hover:bg-green-500/10 transition-colors w-full sm:w-auto"
    >
      <Star className="w-4 h-4" /> Review Submitted
    </Link>
  ) : (
    <Link
      href={`/store/${product.slug}#write-review`}
      className="flex items-center justify-center gap-2 bg-transparent text-orange-yellow-crayola border border-orange-yellow-crayola/20 px-6 py-3 rounded-xl font-medium hover:bg-orange-yellow-crayola/10 transition-colors w-full sm:w-auto"
    >
      <Star className="w-4 h-4" /> Write Review
    </Link>
  )
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(main)/dashboard/purchases/page.tsx
git commit -m "feat: add Write Review button to purchases page"
```

---

### Task 15: Create customer "My Reviews" dashboard page

**Files:**
- Create: `src/app/(main)/dashboard/reviews/page.tsx`

- [ ] **Step 1: Create the my reviews page**

```tsx
import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Star, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { DeleteReviewButton } from "./delete-review-button";

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const myReviews = await withRetry((db) =>
    db.query.reviews.findMany({
      where: eq(reviews.userId, session.user.id),
      with: { product: { columns: { id: true, name: true, slug: true } } },
      orderBy: [desc(reviews.createdAt)],
    })
  );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <h3 className="text-2xl font-semibold text-white-2 mb-6">My Reviews</h3>

      {myReviews.length === 0 ? (
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-10 text-center text-light-gray">
          <p className="mb-4 text-lg">You haven&apos;t written any reviews yet.</p>
          <Link
            href="/dashboard/purchases"
            className="inline-flex items-center justify-center bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-bold hover:bg-orange-yellow-crayola/90 transition-colors"
          >
            View Purchases
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myReviews.map((review) => (
            <div
              key={review.id}
              className="bg-eerie-black-1 border border-jet rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/store/${review.product.slug}`}
                      className="text-orange-yellow-crayola font-medium hover:underline"
                    >
                      {review.product.name}
                    </Link>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        review.status === "APPROVED"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : review.status === "PENDING"
                          ? "bg-orange-400/10 text-orange-400 border border-orange-400/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>

                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= review.rating
                            ? "text-orange-yellow-crayola fill-orange-yellow-crayola"
                            : "text-jet"
                        }`}
                      />
                    ))}
                  </div>

                  <h4 className="text-white-2 font-medium mb-1">{review.title}</h4>
                  <p className="text-light-gray text-sm leading-relaxed">{review.body}</p>
                  <p className="text-light-gray-70 text-xs mt-2">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/store/${review.product.slug}#edit-review`}
                    className="p-2 rounded-lg hover:bg-orange-yellow-crayola/10 text-orange-yellow-crayola transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <DeleteReviewButton reviewId={review.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create DeleteReviewButton client component**

Create `src/app/(main)/dashboard/reviews/delete-review-button.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
```

- [ ] **Step 3: Add "Reviews" link to dashboard nav**

In `src/components/dashboard/dashboard-nav.tsx`, add a "Reviews" navigation item to the `navItems` array after "Purchases". Import `Star` from lucide-react and add: `{ name: "Reviews", href: "/dashboard/reviews", icon: Star }`.

- [ ] **Step 4: Commit**

```bash
git add src/app/(main)/dashboard/reviews/ src/components/dashboard/dashboard-nav.tsx
git commit -m "feat: add My Reviews dashboard page with edit/delete"
```

---

### Task 16: Build verification and final cleanup

- [ ] **Step 1: Run the build**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Verify all routes are accessible**

Check these pages load without errors:
- `/admin/reviews` — admin review management
- `/dashboard/reviews` — customer my reviews
- `/store/<any-slug>` — product page with reviews section
- `/dashboard/purchases` — purchases with review buttons

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 2 customer review & rating system"
```

---

## Summary

| Chunk | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-2 | Schema (reviews + helpful_votes tables) + Zod validation |
| 2 | 3-6 | Customer API routes (create, update, delete, helpful vote, public list) |
| 3 | 7-8 | Admin API routes + admin reviews management page |
| 4 | 9-12 | UI components (StarRatingInput, ReviewCard, HelpfulButton, ReviewForm) |
| 5 | 13-16 | Page integrations (product page, purchases, my reviews, build verify) |

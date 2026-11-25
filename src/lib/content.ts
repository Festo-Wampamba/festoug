import { revalidateTag, unstable_cache } from "next/cache";
import { and, asc, count, desc, eq } from "drizzle-orm";

import { withRetry } from "@/lib/db";
import { blogPosts, products, projects, reviews, services, testimonials } from "@/lib/db/schema";

/**
 * Cached reads for the public content pages. Each query runs against the
 * database at most once per hour (or until an admin save clears its tag), so
 * visitors don't wait on a database round trip or a Neon cold start.
 *
 * unstable_cache (not `use cache`) because entries must survive deployments
 * and this app doesn't enable Cache Components. Nothing here may read the
 * request: per-visitor data (session, orders) stays uncached in the page.
 */

export type ContentTag = "projects" | "blog" | "services" | "testimonials" | "products" | "reviews";

const HOUR = 60 * 60;

/** Call after any write that changes what the public pages show. */
export function revalidateContent(...tags: ContentTag[]) {
  // expire: 0 so the admin sees their edit on the next load, not a stale copy.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
}

// The cache stores JSON, which turns Date fields into strings. Turn them back
// so callers get the same types the database query returns.
function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reviveDates) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        typeof v === "string" && key.endsWith("At") ? new Date(v) : reviveDates(v),
      ]),
    ) as T;
  }
  return value;
}

function cached<Args extends unknown[], R>(fn: (...args: Args) => Promise<R>, key: string, tags: ContentTag[]) {
  const run = unstable_cache(fn, [key], { tags, revalidate: HOUR });
  return async (...args: Args): Promise<R> => reviveDates(await run(...args));
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export const getActiveServices = cached(
  () => withRetry((db) => db.query.services.findMany({ where: eq(services.isActive, true), orderBy: [asc(services.sortOrder)] })),
  "active-services",
  ["services"],
);

export const getActiveTestimonials = cached(
  () => withRetry((db) => db.query.testimonials.findMany({ where: eq(testimonials.isActive, true), orderBy: [asc(testimonials.sortOrder)] })),
  "active-testimonials",
  ["testimonials"],
);

// ─── Projects ─────────────────────────────────────────────────────────────────

export const getFeaturedProjects = cached(
  (limit: number) =>
    withRetry((db) =>
      db.select().from(projects).where(eq(projects.isActive, true)).orderBy(desc(projects.isFeatured), asc(projects.sortOrder)).limit(limit),
    ),
  "featured-projects",
  ["projects"],
);

export const getActiveProjects = cached(
  () => withRetry((db) => db.select().from(projects).where(eq(projects.isActive, true)).orderBy(asc(projects.sortOrder))),
  "active-projects",
  ["projects"],
);

export const getProjectBySlug = cached(
  async (slug: string) => (await withRetry((db) => db.query.projects.findFirst({ where: eq(projects.slug, slug) }))) ?? null,
  "project-by-slug",
  ["projects"],
);

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const getPublishedPostCount = cached(
  async () => {
    const [{ value }] = await withRetry((db) => db.select({ value: count() }).from(blogPosts).where(eq(blogPosts.isPublished, true)));
    return value;
  },
  "published-post-count",
  ["blog"],
);

export const getPublishedPosts = cached(
  (limit: number, offset: number) =>
    withRetry((db) =>
      db.query.blogPosts.findMany({
        where: eq(blogPosts.isPublished, true),
        orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
        limit,
        offset,
      }),
    ),
  "published-posts",
  ["blog"],
);

export const getPostBySlug = cached(
  async (slug: string) => (await withRetry((db) => db.query.blogPosts.findFirst({ where: eq(blogPosts.slug, slug) }))) ?? null,
  "post-by-slug",
  ["blog"],
);

// ─── Store ────────────────────────────────────────────────────────────────────

export const getActiveProducts = cached(
  () => withRetry((db) => db.query.products.findMany({ where: eq(products.isActive, true), orderBy: [desc(products.createdAt)] })),
  "active-products",
  ["products"],
);

export const getProductBySlug = cached(
  async (slug: string) => (await withRetry((db) => db.query.products.findFirst({ where: eq(products.slug, slug) }))) ?? null,
  "product-by-slug",
  ["products"],
);

export const getApprovedReviews = cached(
  (productId: string) =>
    withRetry((db) =>
      db.query.reviews.findMany({
        where: and(eq(reviews.productId, productId), eq(reviews.status, "APPROVED")),
        with: { user: { columns: { id: true, name: true, image: true } } },
        orderBy: [desc(reviews.createdAt)],
      }),
    ),
  "approved-reviews",
  ["reviews"],
);

import { withRetry } from "@/lib/db";
import { auth } from "@/lib/auth";
import { products, reviews, orders, reviewHelpfulVotes } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, LayoutTemplate, ShieldCheck, Star, Zap } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { ReviewCard } from "@/components/reviews/review-card";
import { ProductReviewForm } from "./product-review-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await withRetry((db) => db.query.products.findFirst({
    where: eq(products.slug, slug)
  }));
  if (!p) return { title: "Product Not Found" };
  return {
    title: `${p.name} | FestoUG Store`,
    description: p.description || `Purchase ${p.name} digital download.`,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await withRetry((db) => db.query.products.findFirst({
    where: eq(products.slug, slug),
  }));

  if (!product || !product.isActive) {
    notFound();
  }

  const session = await auth();

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

  // Check if current user can review (has completed order, hasn't reviewed yet)
  let canReview = false;
  let userOrder: { id: string } | undefined;
  let existingReview: typeof productReviews[0] | undefined;

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
    );

    existingReview = await withRetry((db) =>
      db.query.reviews.findFirst({
        where: and(
          eq(reviews.userId, session.user.id),
          eq(reviews.productId, product.id)
        ),
        with: {
          user: { columns: { id: true, name: true, image: true } },
        },
      })
    );

    canReview = !!userOrder && !existingReview;
  }

  // Get user's helpful votes for display
  const userVotes = session?.user?.id
    ? await withRetry((db) =>
        db.query.reviewHelpfulVotes.findMany({
          where: eq(reviewHelpfulVotes.userId, session.user.id),
          columns: { reviewId: true },
        })
      )
    : [];
  const votedReviewIds = new Set(userVotes.map((v) => v.reviewId));

  // Calculate average rating
  const avgRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0;

  const features = [
    "Lifetime Access & Updates",
    "Source Code Included",
    "Clean, Modern Architecture",
    "Easy to Customize",
    "Premium Support (30 days)",
  ];

  return (
    <article className="animate-in fade-in duration-500 xl:pr-[60px]">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-light-gray-70 hover:text-orange-yellow-crayola transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="aspect-video bg-eerie-black-1 border border-jet rounded-[20px] overflow-hidden flex items-center justify-center relative shadow-1">
            {product.thumbnailUrl ? (
              <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-12">
                <LayoutTemplate className="w-20 h-20 text-orange-yellow-crayola/20 mx-auto mb-4" />
                <span className="text-light-gray-70 text-lg font-light">Preview Image Loading...</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="bg-smoky-black/80 backdrop-blur-sm border border-jet text-xs font-semibold px-4 py-1.5 rounded-full text-light-gray uppercase tracking-wider">
                {product.category}
              </span>
            </div>
          </div>

          <section className="bg-eerie-black-1 border border-jet rounded-[20px] p-8 shadow-1">
            <h3 className="text-2xl font-bold text-white-2 mb-6 flex items-center gap-3">
              <span className="bg-orange-yellow-crayola/10 text-orange-yellow-crayola p-2 rounded-xl">
                <Zap className="w-5 h-5" />
              </span>
              Product Overview
            </h3>
            <div className="prose prose-invert prose-orange max-w-none text-light-gray font-light leading-relaxed">
              {product.description ? (
                product.description.split('\n').map((para, i) => (
                  <p key={i} className={para.trim() ? "mb-4" : ""}>{para}</p>
                ))
              ) : (
                <p>No description provided yet.</p>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-eerie-black-1 border border-jet rounded-[20px] p-8 shadow-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white-2 flex items-center gap-3">
                <span className="bg-orange-yellow-crayola/10 text-orange-yellow-crayola p-2 rounded-xl">
                  <Star className="w-5 h-5" />
                </span>
                Reviews
                {productReviews.length > 0 && (
                  <span className="text-light-gray-70 text-base font-normal ml-1">
                    ({productReviews.length})
                  </span>
                )}
              </h3>
              {avgRating > 0 && (
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
                  <span className="text-white-2 font-semibold text-sm">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Write Review */}
            {canReview && userOrder && (
              <div className="mb-6 pb-6 border-b border-jet">
                <ProductReviewForm productId={product.id} orderId={userOrder.id} />
              </div>
            )}

            {/* Edit existing review notice */}
            {existingReview && (
              <div className="mb-6 pb-6 border-b border-jet">
                <p className="text-light-gray-70 text-sm">
                  You have already reviewed this product. Visit{" "}
                  <Link href="/dashboard/reviews" className="text-orange-yellow-crayola hover:underline">
                    My Reviews
                  </Link>{" "}
                  to edit your review.
                </p>
              </div>
            )}

            {/* Reviews List */}
            {productReviews.length === 0 ? (
              <p className="text-light-gray-70 text-center py-8">
                No reviews yet. Be the first to review this product!
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
                    hasVoted={votedReviewIds.has(review.id)}
                    isAuthenticated={!!session?.user?.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-[100px] bg-eerie-black-1 border border-jet rounded-[20px] p-8 shadow-2">
            <h1 className="text-3xl font-bold text-white-2 mb-2 line-clamp-2">{product.name}</h1>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-bold text-orange-yellow-crayola">${product.price}</span>
              <span className="text-light-gray-70 text-sm">USD</span>
            </div>

            <div className="space-y-4 mb-8">
              <Link
                href={`/api/checkout?productId=${product.id}`}
                className="block w-full text-center bg-orange-yellow-crayola text-smoky-black py-4 rounded-xl font-bold text-lg hover:bg-orange-yellow-crayola/90 hover:shadow-[0_0_20px_rgba(255,181,63,0.3)] transition-all shadow-md"
              >
                Purchase Now
              </Link>
              <p className="text-center text-xs text-light-gray-70 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-500/80" />
                Secure checkout handled by Lemon Squeezy
              </p>
            </div>

            <hr className="border-jet mb-6" />

            <h4 className="text-white-2 font-semibold mb-4 text-sm uppercase tracking-wider">What&apos;s Included</h4>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-light-gray text-sm">
                  <CheckCircle2 className="w-5 h-5 text-orange-yellow-crayola shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

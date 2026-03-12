import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MyReviewActions } from "./my-review-actions";

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userReviews = await withRetry((db) =>
    db.query.reviews.findMany({
      where: eq(reviews.userId, session.user.id),
      with: {
        product: { columns: { id: true, name: true, slug: true } },
      },
      orderBy: [desc(reviews.createdAt)],
    })
  );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="text-light-gray-70 hover:text-orange-yellow-crayola transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h3 className="text-2xl font-semibold text-white-2">My Reviews</h3>
      </div>

      {userReviews.length === 0 ? (
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
          {userReviews.map((review) => (
            <div
              key={review.id}
              className="bg-eerie-black-1 border border-jet rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                    {review.helpfulCount > 0 && (
                      <span className="ml-3">
                        {review.helpfulCount} found helpful
                      </span>
                    )}
                  </p>
                </div>

                <MyReviewActions review={review} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

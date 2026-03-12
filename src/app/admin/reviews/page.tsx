import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Star } from "lucide-react";
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
    where: status && ["APPROVED", "PENDING", "REJECTED"].includes(status)
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
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
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

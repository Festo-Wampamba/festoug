import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { orders, reviews } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Download, ExternalLink, Star, Pencil } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userOrders = await withRetry((db) =>
    db.query.orders.findMany({
      where: eq(orders.userId, session.user.id),
      with: { product: true },
      orderBy: [desc(orders.createdAt)],
    })
  );

  const userReviews = await withRetry((db) =>
    db.query.reviews.findMany({
      where: eq(reviews.userId, session.user.id),
      columns: { id: true, productId: true },
    })
  );
  const reviewedProductIds = new Set(userReviews.map((r) => r.productId));

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <h3 className="text-2xl font-semibold text-white-2 mb-6">Order History & Downloads</h3>

      {userOrders.length === 0 ? (
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-10 text-center text-light-gray">
          <p className="mb-4 text-lg">You have no purchase history yet.</p>
          <Link 
            href="/store"
            className="inline-flex items-center justify-center bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-bold hover:bg-orange-yellow-crayola/90 transition-colors"
          >
            Explore Store
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {userOrders.map((order) => {
            const product = order.product;
            const isCompleted = order.status === "COMPLETED";

            return (
              <div 
                key={order.id} 
                className="bg-eerie-black-1 border border-jet rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative shadow-1"
              >
                <div className="flex items-center gap-6">
                  {/* Product Thumbnail Fallback */}
                  <div className="w-20 h-20 rounded-xl bg-eerie-black-2 border border-jet flex items-center justify-center shrink-0">
                    {product?.thumbnailUrl ? (
                      <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-orange-yellow-crayola text-2xl font-bold">{product?.name.charAt(0)}</span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-white-2 mb-1">{product?.name || "Deleted Product"}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray-70">
                      <span>Order: #{order.externalOrderId || order.id.slice(0, 8)}</span>
                      <span className="w-1 h-1 rounded-full bg-jet hidden sm:block"></span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-jet hidden sm:block"></span>
                      <span className="font-medium text-white-2">${order.amount} {order.currency}</span>
                    </div>
                    
                    <div className="mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isCompleted
                          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                          : "bg-orange-400/10 text-orange-400 border border-orange-400/20"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  {isCompleted && product?.downloadUrl ? (
                    <a 
                      href={product.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-orange-yellow-crayola text-smoky-black px-6 py-3 rounded-xl font-medium hover:bg-orange-yellow-crayola/90 transition-colors w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" /> Download Assets
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="flex items-center justify-center gap-2 bg-jet/50 text-light-gray-70 px-6 py-3 rounded-xl font-medium cursor-not-allowed w-full sm:w-auto"
                    >
                      {isCompleted ? "No Downloads" : "Processing Payment"}
                    </button>
                  )}
                  
                  <button className="flex items-center justify-center gap-2 bg-transparent text-light-gray border border-jet px-6 py-3 rounded-xl font-medium hover:bg-jet hover:text-white-2 transition-colors w-full sm:w-auto">
                    Receipt <ExternalLink className="w-4 h-4" />
                  </button>
                  {isCompleted && product && (
                    reviewedProductIds.has(product.id) ? (
                      <Link
                        href="/dashboard/reviews"
                        className="flex items-center justify-center gap-2 bg-transparent text-orange-yellow-crayola border border-orange-yellow-crayola/20 px-6 py-3 rounded-xl font-medium hover:bg-orange-yellow-crayola/10 transition-colors w-full sm:w-auto"
                      >
                        <Pencil className="w-4 h-4" /> Edit Review
                      </Link>
                    ) : (
                      <Link
                        href={`/store/${product.slug}`}
                        className="flex items-center justify-center gap-2 bg-transparent text-orange-yellow-crayola border border-orange-yellow-crayola/20 px-6 py-3 rounded-xl font-medium hover:bg-orange-yellow-crayola/10 transition-colors w-full sm:w-auto"
                      >
                        <Star className="w-4 h-4" /> Write Review
                      </Link>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { withRetry } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Pencil, ChevronLeft } from "lucide-react";

export const metadata = { title: "Admin | Testimonials" };

export const dynamic = "force-dynamic";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xs ${i <= rating ? "text-orange-yellow-crayola" : "text-jet"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function AdminTestimonialsPage() {
  const allTestimonials = await withRetry((db) =>
    db.select().from(testimonials).orderBy(asc(testimonials.sortOrder))
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h2 className="text-white-2 text-xl font-bold">Testimonials</h2>
          <Link
            href="/admin/testimonials/new"
            className="flex items-center gap-2 bg-orange-yellow-crayola text-smoky-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-yellow-crayola/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Testimonial
          </Link>
        </div>
      </div>

      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
        {allTestimonials.length === 0 ? (
          <p className="text-light-gray-70 text-sm p-8 text-center">
            No testimonials yet. Click &quot;Add Testimonial&quot; to create your first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-jet text-light-gray-70 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Person</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Excerpt</th>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allTestimonials.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-jet/50 hover:bg-jet/20 transition-colors group relative"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {t.avatar && (
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-8 h-8 rounded-full object-cover border border-jet"
                          />
                        )}
                        <div>
                          <p className="text-white-2 font-medium">
                            <Link
                              href={`/admin/testimonials/${t.id}/edit`}
                              className="before:absolute before:inset-0"
                            >
                              {t.name}
                            </Link>
                          </p>
                          {t.role && (
                            <p className="text-light-gray-70 text-xs">{t.role}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StarDisplay rating={t.rating} />
                    </td>
                    <td className="px-6 py-4 text-light-gray-70 max-w-[200px] truncate">
                      {t.testimonial.slice(0, 80)}
                      {t.testimonial.length > 80 ? "..." : ""}
                    </td>
                    <td className="px-6 py-4 text-light-gray-70">{t.sortOrder}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`w-2.5 h-2.5 rounded-full inline-block ${
                          t.isActive ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative z-10">
                        <Link
                          href={`/admin/testimonials/${t.id}/edit`}
                          className="p-2 rounded-lg hover:bg-eerie-black-1 text-light-gray hover:text-orange-yellow-crayola transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

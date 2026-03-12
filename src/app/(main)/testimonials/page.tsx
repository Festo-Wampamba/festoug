import { withRetry } from "@/lib/db";
import { testimonials as testimonialsTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Testimonials",
  description: "What clients say about working with Festo Wampamba.",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-orange-yellow-crayola" : "text-jet"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const testimonials = await withRetry((db) =>
    db.query.testimonials.findMany({
      where: eq(testimonialsTable.isActive, true),
      orderBy: [asc(testimonialsTable.sortOrder)],
    })
  );

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 relative pb-[15px]">
        <h2 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          Testimonials
        </h2>
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-gradient-to-r from-orange-yellow-crayola to-orange-400 rounded-[3px]" />
      </header>

      <p className="text-light-gray text-[15px] font-light leading-relaxed mb-8">
        Here&apos;s what clients and collaborators have to say about working with me.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="relative bg-eerie-black-1 border border-jet rounded-2xl p-6 pt-10 shadow-1 animate-in fade-in zoom-in-95 duration-500"
          >
            {/* Avatar */}
            <figure className="absolute top-0 left-6 -translate-y-1/2 rounded-2xl overflow-hidden shadow-lg border-2 border-jet">
              <Image
                src={t.avatar || "/images/avatar-1.png"}
                alt={t.name}
                width={56}
                height={56}
                className="object-cover w-14 h-14"
              />
            </figure>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white-2 text-base font-semibold capitalize">
                  {t.name}
                </h3>
                {t.role && (
                  <p className="text-light-gray text-xs">{t.role}</p>
                )}
              </div>
              <StarRating rating={t.rating} />
            </div>

            {/* Quote */}
            <blockquote className="text-light-gray text-sm font-light leading-relaxed">
              &ldquo;{t.testimonial}&rdquo;
            </blockquote>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <p className="text-light-gray text-center py-12">
          No testimonials yet.
        </p>
      )}
    </div>
  );
}

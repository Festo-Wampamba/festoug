import { withRetry } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Admin | Edit Testimonial" };

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const testimonial = await withRetry((db) =>
    db.query.testimonials.findFirst({
      where: eq(testimonials.id, id),
    })
  );

  if (!testimonial) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Testimonials
        </Link>
        <h2 className="text-white-2 text-xl font-bold">
          Edit: {testimonial.name}&apos;s Testimonial
        </h2>
      </div>
      <TestimonialForm
        testimonial={{
          id: testimonial.id,
          name: testimonial.name,
          avatar: testimonial.avatar,
          role: testimonial.role,
          rating: testimonial.rating,
          testimonial: testimonial.testimonial,
          isActive: testimonial.isActive,
          sortOrder: testimonial.sortOrder,
        }}
      />
    </div>
  );
}

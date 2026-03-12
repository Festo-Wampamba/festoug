import { TestimonialForm } from "@/components/admin/testimonial-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Admin | New Testimonial" };

export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Testimonials
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Add New Testimonial</h2>
      </div>
      <TestimonialForm />
    </div>
  );
}

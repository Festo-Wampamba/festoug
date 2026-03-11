import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  avatar: string;
  role?: string;
  rating: number;
  testimonial: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-cm-dusk" : "text-cm-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialCard({ name, avatar, role, rating, testimonial }: TestimonialCardProps) {
  return (
    <div className="min-w-[calc(50%-8px)] max-w-[calc(50%-8px)] shrink-0 snap-start">
      <div className="relative bg-gradient-to-br from-cm-surface to-[#0d1528] border border-cm-border rounded-[14px] p-5 pt-8 shadow-lg mt-8 flex flex-col">
        {/* Avatar - positioned at top-left overlapping */}
        <figure className="absolute top-0 left-0 transform translate-x-[15px] -translate-y-[25px] bg-gradient-to-br from-cm-surface to-[#0d1528] rounded-[14px] shadow-lg">
          <Image
            src={avatar}
            alt={name}
            width={60}
            height={60}
            className="rounded-[14px] object-cover"
          />
        </figure>

        {/* Name + Role */}
        <div className="ml-[70px] mb-2">
          <h4 className="text-cm-text text-base font-semibold capitalize">{name}</h4>
          {role && <p className="text-cm-muted text-xs">{role}</p>}
        </div>

        {/* Star Rating */}
        <div className="mb-3">
          <StarRating rating={rating} />
        </div>

        {/* Testimonial Text */}
        <div className="text-cm-text/80 text-sm font-light leading-relaxed flex-1 flex items-start">
          <p>{testimonial}</p>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  avatar: string;
  role?: string;
  rating: number;
  testimonial: string;
  isActive?: boolean;
}

export function TestimonialCard({ name, avatar, role, rating, testimonial, isActive }: TestimonialCardProps) {
  return (
    <div className="flex-1 min-w-0 pt-6">
      <div
        className={`relative bg-eerie-black-1 rounded-[14px] p-5 pt-4 shadow-lg flex flex-col min-h-[180px] h-full border transition-all duration-700 ease-in-out ${
          isActive
            ? "border-orange-yellow-crayola/50 shadow-[0_0_28px_rgba(127,34,254,0.18)] -translate-y-1"
            : "border-jet"
        }`}
      >
        {/* Avatar overlapping top-left */}
        <figure className="absolute -top-5 left-4 w-11 h-11">
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="rounded-[10px] object-cover w-full h-full shadow-lg"
          />
        </figure>

        {/* Big quote glyph — Flowstep accent */}
        <Quote
          className="absolute top-4 right-4 w-7 h-7 text-orange-yellow-crayola/25 rotate-180 fill-current"
          aria-hidden
        />

        {/* Name + Role + Stars */}
        <div className="mt-4 mb-2.5 pr-8">
          <h4 className="text-white-2 text-sm font-semibold capitalize">{name}</h4>
          {role && <p className="text-orange-yellow-crayola text-[11px] mt-0.5">{role}</p>}
          {/* Star rating */}
          <div className="flex items-center gap-0.5 mt-1.5" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(rating)
                    ? "text-accent-4 fill-accent-4"
                    : "text-jet fill-jet"
                }`}
                aria-hidden
              />
            ))}
          </div>
        </div>

        {/* Testimonial Text */}
        <p className="text-light-gray text-[13px] font-light leading-relaxed flex-1">
          {testimonial}
        </p>
      </div>
    </div>
  );
}

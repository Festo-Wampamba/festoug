import Image from "next/image";
import { QuoteIcon, StarFilledIcon, StarIcon } from "@radix-ui/react-icons";

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
        className={`relative flex h-full min-h-[180px] flex-col rounded-2xl border bg-card p-5 pt-4 shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out ${
          isActive
            ? "-translate-y-0.5 border-primary/60 bg-secondary/50 shadow-md motion-reduce:translate-y-0"
            : "border-border"
        }`}
      >
        {/* Avatar overlapping top-left */}
        <figure className="absolute -top-5 left-4 w-11 h-11">
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="h-full w-full rounded-xl object-cover shadow-sm ring-2 ring-background"
          />
        </figure>

        {/* Small quote mark keeps the card visually anchored without a glow. */}
        <QuoteIcon
          className="absolute right-4 top-4 h-7 w-7 text-primary/30"
          aria-hidden
        />

        {/* Name + Role + Stars */}
        <div className="mt-4 mb-2.5 pr-8">
          <h4 className="text-sm font-semibold capitalize text-card-foreground">{name}</h4>
          {role && <p className="mt-0.5 text-xs text-primary">{role}</p>}
          {/* Star rating */}
          <div className="flex items-center gap-0.5 mt-1.5" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              i < Math.round(rating) ? (
                <StarFilledIcon
                  key={i}
                  className="h-3.5 w-3.5 text-primary"
                  aria-hidden
                />
              ) : (
                <StarIcon
                  key={i}
                  className="h-3.5 w-3.5 text-muted-foreground/40"
                  aria-hidden
                />
              )
            ))}
          </div>
        </div>

        {/* Testimonial Text */}
        <p className="flex-1 text-base font-normal leading-relaxed text-muted-foreground">
          {testimonial}
        </p>
      </div>
    </div>
  );
}

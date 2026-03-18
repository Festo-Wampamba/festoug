import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  avatar: string;
  role?: string;
  rating: number;
  testimonial: string;
}

export function TestimonialCard({ name, avatar, role, rating, testimonial }: TestimonialCardProps) {
  return (
    <div className="flex-1 min-w-0 pt-6">
      <div className="relative bg-gradient-to-br from-cm-surface to-cm-bg border border-cm-border rounded-[14px] p-5 pt-4 shadow-lg flex flex-col min-h-[180px] h-full">
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

        {/* Name + Role */}
        <div className="mt-4 mb-3">
          <h4 className="text-cm-text text-sm font-semibold capitalize">{name}</h4>
          {role && <p className="text-orange-yellow-crayola text-[11px] mt-0.5">{role}</p>}
        </div>

        {/* Testimonial Text */}
        <p className="text-cm-text/80 text-[13px] font-light leading-relaxed flex-1">
          {testimonial}
        </p>
      </div>
    </div>
  );
}

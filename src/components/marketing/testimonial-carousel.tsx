"use client";

import { useRef, useEffect, useCallback } from "react";
import { TestimonialCard } from "./testimonial-card";

interface Testimonial {
  name: string;
  avatar: string | null;
  role: string | null;
  rating: number;
  testimonial: string;
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = el.firstElementChild?.clientWidth ?? 0;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (el.scrollLeft >= maxScroll - 10) {
      // Loop back to start
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    // Auto-scroll every 30 seconds
    timerRef.current = setInterval(scrollNext, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scrollNext]);

  // Pause on hover
  const handleMouseEnter = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleMouseLeave = () => {
    timerRef.current = setInterval(scrollNext, 5000);
  };

  return (
    <ul
      ref={scrollRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex gap-[15px] overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar px-4 -mx-4"
    >
      {testimonials.map((t, index) => (
        <TestimonialCard
          key={index}
          name={t.name}
          avatar={t.avatar || "/images/avatar-1.png"}
          role={t.role ?? undefined}
          rating={t.rating}
          testimonial={t.testimonial}
        />
      ))}
    </ul>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TestimonialCard } from "./testimonial-card";

interface Testimonial {
  name: string;
  avatar: string | null;
  role: string | null;
  rating: number;
  testimonial: string;
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  // Lazy initializer: reads window once on mount, avoids synchronous setState in effect
  const [perPage, setPerPage] = useState(() =>
    typeof window !== "undefined" ? (window.innerWidth >= 768 ? 2 : 1) : 1
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Only listen for resize changes — initial value is already set above
  useEffect(() => {
    const handler = () => setPerPage(window.innerWidth >= 768 ? 2 : 1);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const totalPages = Math.ceil(testimonials.length / perPage);
  // Derived safe page — no setState in effect needed; modulo naturally wraps out-of-bounds pages
  const safePage = totalPages > 0 ? currentPage % totalPages : 0;

  const goNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, 5000);
  }, [goNext]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = startTimer;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); pause(); }
    if (e.key === "ArrowRight") { e.preventDefault(); goNext(); pause(); }
  };

  const startIdx = safePage * perPage;
  const visible = testimonials.slice(startIdx, startIdx + perPage);

  return (
    <div
      className="relative"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Testimonials carousel"
      aria-roledescription="carousel"
      tabIndex={0}
    >
      {/* Cards row */}
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Slide ${safePage + 1} of ${totalPages}`}
        className="flex gap-4"
      >
        {visible.map((t, i) => (
          <TestimonialCard
            key={startIdx + i}
            name={t.name}
            avatar={t.avatar || "/images/avatar-1.png"}
            role={t.role ?? undefined}
            rating={t.rating}
            testimonial={t.testimonial}
          />
        ))}
        {/* Ghost spacer when showing 2 per page but only 1 card left */}
        {perPage === 2 && visible.length === 1 && <div className="flex-1" />}
      </div>

      {/* Dot navigation */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5" role="tablist" aria-label="Carousel navigation">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === safePage}
              aria-label={`Go to slide ${i + 1} of ${totalPages}`}
              onClick={() => { setCurrentPage(i); pause(); }}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-orange-yellow-crayola focus-visible:outline-offset-2 ${
                i === safePage
                  ? "w-5 bg-orange-yellow-crayola"
                  : "w-2 bg-jet hover:bg-light-gray-70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

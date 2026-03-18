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
  const [perPage, setPerPage] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect screen size (mobile = 1 card, md+ = 2 cards)
  useEffect(() => {
    const update = () => setPerPage(window.innerWidth >= 768 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalPages = Math.ceil(testimonials.length / perPage);

  // Keep currentPage in bounds when perPage changes
  useEffect(() => {
    if (currentPage >= totalPages) setCurrentPage(0);
  }, [totalPages, currentPage]);

  const goNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
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

  const startIdx = currentPage * perPage;
  const visible = testimonials.slice(startIdx, startIdx + perPage);

  return (
    <div className="relative" onMouseEnter={pause} onMouseLeave={resume}>
      {/* Cards row */}
      <div className="flex gap-4">
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
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setCurrentPage(i); pause(); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentPage
                  ? "w-5 bg-orange-yellow-crayola"
                  : "w-2 bg-jet hover:bg-light-gray-70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

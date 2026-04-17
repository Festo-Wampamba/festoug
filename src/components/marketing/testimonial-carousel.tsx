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
  const total = testimonials.length;
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isMobile,  setIsMobile]  = useState(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goNext = useCallback(() => {
    setDirection("next");
    setCurrent(p => (p + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setDirection("prev");
    setCurrent(p => (p - 1 + total) % total);
  }, [total]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, 5000);
  }, [goNext]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const pause  = useCallback(() => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  const resume = startTimer;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft")  { e.preventDefault(); goPrev(); pause(); }
    if (e.key === "ArrowRight") { e.preventDefault(); goNext(); pause(); }
  };

  const onTouchStart = (e: React.TouchEvent) => { dragStartX.current = e.touches[0].clientX; pause(); };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    dragStartX.current = null;
    resume();
  };

  const onMouseDown     = (e: React.MouseEvent) => { dragStartX.current = e.clientX; pause(); };
  const onMouseUp       = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    dragStartX.current = null;
    resume();
  };
  const onMouseLeave = (e: React.MouseEvent) => {
    if (dragStartX.current !== null) onMouseUp(e);
    resume();
  };

  // Always show 2 cards, wrapping around — on mobile show 1
  const cardCount = isMobile ? 1 : 2;
  const visible = Array.from({ length: cardCount }, (_, i) =>
    testimonials[(current + i) % total]
  );

  return (
    <div
      className="relative select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={pause}
      onMouseLeave={onMouseLeave}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={handleKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      role="region"
      aria-label="Testimonials carousel"
      tabIndex={0}
    >
      {/* Cards — key on `current` triggers re-mount → CSS animation fires */}
      <div
        key={current}
        aria-live="polite"
        aria-atomic="true"
        className={`flex gap-4 pointer-events-none ${
          direction === "next" ? "testimonial-slide-next" : "testimonial-slide-prev"
        }`}
      >
        {visible.map((t, i) => (
          <TestimonialCard
            key={i}
            name={t.name}
            avatar={t.avatar || "/images/avatar-1.png"}
            role={t.role ?? undefined}
            rating={t.rating}
            testimonial={t.testimonial}
          />
        ))}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-5" role="tablist" aria-label="Carousel navigation">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => { setDirection(i > current ? "next" : "prev"); setCurrent(i); pause(); }}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-orange-yellow-crayola focus-visible:outline-offset-2 ${
                i === current ? "w-5 bg-orange-yellow-crayola" : "w-2 bg-jet hover:bg-light-gray-70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

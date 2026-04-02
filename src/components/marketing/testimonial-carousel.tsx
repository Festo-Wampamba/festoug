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

  // Touch / mouse drag state
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const getPerPage = () => (window.innerWidth >= 768 ? 2 : 1);
    setPerPage(getPerPage());
    const handler = () => setPerPage(getPerPage());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const totalPages = Math.ceil(testimonials.length / perPage);
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

  const pause = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const resume = startTimer;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); pause(); }
    if (e.key === "ArrowRight") { e.preventDefault(); goNext(); pause(); }
  };

  // ── Touch handlers (mobile swipe) ──────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    pause();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    dragStartX.current = null;
    resume();
  };

  // ── Mouse drag handlers (desktop) ──────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = false;
    pause();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    if (Math.abs(e.clientX - dragStartX.current) > 5) isDragging.current = true;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    dragStartX.current = null;
    resume();
  };

  const onMouseLeaveDrag = (e: React.MouseEvent) => {
    if (dragStartX.current !== null) onMouseUp(e);
    resume();
  };

  const startIdx = safePage * perPage;
  const visible = testimonials.slice(startIdx, startIdx + perPage);

  return (
    <div
      className="relative select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={pause}
      onMouseLeave={onMouseLeaveDrag}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={handleKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
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
        className="flex gap-4 pointer-events-none"
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

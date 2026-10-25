"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
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
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => { if (media.matches) setAutoplay(false); };
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isMobile,  setIsMobile]  = useState(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef<number | null>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);

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
    if (autoplay && total > 1) timerRef.current = setInterval(goNext, 5000);
  }, [goNext, autoplay, total]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  // Restart CSS animation without remounting (prevents layout-reflow flicker)
  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const cls = direction === "next" ? "testimonial-slide-next" : "testimonial-slide-prev";
    el.classList.remove("testimonial-slide-next", "testimonial-slide-prev");
    void el.getBoundingClientRect(); // force reflow locally
    el.classList.add(cls);
  }, [current, direction]);

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
  // No testimonials → render nothing (avoids `% 0` = NaN indexing into undefined).
  if (total === 0) return null;

  const visible = Array.from({ length: cardCount }, (_, i) =>
    testimonials[(current + i) % total]
  );

  return (
    <div
      className="relative select-none cursor-grab active:cursor-grabbing testimonial-viewport"
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
      <div
        ref={cardsRef}
        aria-live="polite"
        aria-atomic="true"
        className="flex gap-4 pointer-events-none"
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
        <div className="mt-5 flex flex-wrap justify-center gap-1" role="group" aria-label="Carousel navigation">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => { setDirection(i > current ? "next" : "prev"); setCurrent(i); pause(); }}
              className="flex size-11 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
            ><span aria-hidden className={`h-2 rounded-full transition-colors ${i === current ? "w-5 bg-primary" : "w-2 bg-border"}`} /></button>
          ))}
          <button type="button" aria-label={autoplay ? "Pause testimonials" : "Play testimonials"} onClick={() => setAutoplay(value => !value)} className="flex size-11 items-center justify-center rounded-lg text-primary transition-colors hover:bg-secondary">{autoplay ? <PauseIcon aria-hidden /> : <PlayIcon aria-hidden />}</button>
        </div>
      )}
    </div>
  );
}

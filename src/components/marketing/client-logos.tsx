"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function ClientLogos() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  // Speed in pixels per frame at 60fps (adjust to taste)
  const SPEED = 0.6;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure the width of one set of logos (half the total track)
    const totalWidth = track.scrollWidth;
    const halfWidth = totalWidth / 2;

    function step() {
      if (!isPausedRef.current) {
        posRef.current += SPEED;
        // Reset when we've scrolled exactly one full set — creates seamless loop
        if (posRef.current >= halfWidth) {
          posRef.current = 0;
        }
        if (track) {
          track.style.transform = `translate3d(-${posRef.current}px, 0, 0)`;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const logos = [1, 2, 3, 4, 5, 6];

  const logoItem = (num: number, prefix: string) => (
    <div
      key={`${prefix}-${num}`}
      className="mx-6 sm:mx-8 flex items-center shrink-0"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
      onTouchStart={() => { isPausedRef.current = true; }}
      onTouchEnd={() => {
        setTimeout(() => { isPausedRef.current = false; }, 1500);
      }}
    >
      <Image
        src={`/images/logo-${num}-color.png`}
        alt={`Client ${num}`}
        width={120}
        height={40}
        className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 object-contain select-none"
        draggable={false}
      />
    </div>
  );

  return (
    <div
      className="overflow-hidden relative"
      aria-label="Client logos"
      role="region"
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-eerie-black-2 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-eerie-black-2 to-transparent z-10 pointer-events-none" />

      {/* track — JS moves this via transform */}
      <div
        ref={trackRef}
        className="flex flex-nowrap marquee-track"
        aria-hidden="true"
      >
        {logos.map((num) => logoItem(num, "a"))}
        {logos.map((num) => logoItem(num, "b"))}
      </div>
    </div>
  );
}

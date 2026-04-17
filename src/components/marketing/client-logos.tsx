"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function ClientLogos() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SPEED = 0.6;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function step() {
      if (!isPausedRef.current) {
        const halfWidth = track!.scrollWidth / 2;
        posRef.current += SPEED;
        if (posRef.current >= halfWidth) posRef.current = 0;
        track!.style.transform = `translate3d(-${posRef.current}px, 0, 0)`;
      }
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  const logos: { src: string; alt: string; width: number }[] = [
    { src: "/images/logo-1-color.png",        alt: "Client 1",          width: 120 },
    { src: "/images/logo-2-color.png",        alt: "Client 2",          width: 120 },
    { src: "/images/logo-3-color.png",        alt: "Client 3",          width: 120 },
    { src: "/images/logo-4-color.png",        alt: "Client 4",          width: 120 },
    { src: "/images/logo-5-color.png",        alt: "Client 5",          width: 120 },
    { src: "/images/logo-6-color.png",        alt: "Client 6",          width: 120 },
    { src: "/images/logo-afridrop-color.svg", alt: "Afridrop Solutions", width: 150 },
  ];

  const logoItem = (logo: typeof logos[0], prefix: string, idx: number) => {
    const key = `${prefix}-${idx}`;
    const isActive = activeKey === key;

    return (
      <div
        key={key}
        className="mx-6 sm:mx-8 flex items-center shrink-0 cursor-pointer"
        onMouseEnter={() => { isPausedRef.current = true; setActiveKey(key); }}
        onMouseLeave={() => { isPausedRef.current = false; setActiveKey(null); }}
        onTouchStart={() => {
          if (resumeTimer.current) clearTimeout(resumeTimer.current);
          isPausedRef.current = true;
          setActiveKey(key);
        }}
        onTouchEnd={() => {
          resumeTimer.current = setTimeout(() => {
            isPausedRef.current = false;
            setActiveKey(null);
          }, 1500);
        }}
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={40}
          className={`transition-all duration-500 object-contain select-none ${
            isActive ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-40"
          }`}
          draggable={false}
        />
      </div>
    );
  };

  return (
    <div className="overflow-hidden relative" aria-label="Client logos" role="region">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-eerie-black-2 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-eerie-black-2 to-transparent z-10 pointer-events-none" />

      <div ref={trackRef} className="flex flex-nowrap marquee-track" aria-hidden="true">
        {logos.map((logo, i) => logoItem(logo, "a", i))}
        {logos.map((logo, i) => logoItem(logo, "b", i))}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export function ClientLogos() {
  // Only used for mobile touch — desktop hover is handled entirely by CSS
  const [isPaused, setIsPaused] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logos = [1, 2, 3, 4, 5, 6];

  // Mobile touch handlers only — no mouse handlers (prevents synthetic-event interference)
  const handleTouchStart = (key: string) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setIsPaused(true);
    setActiveKey(key);
  };
  const handleTouchEnd = () => {
    resumeTimer.current = setTimeout(() => {
      setIsPaused(false);
      setActiveKey(null);
    }, 1500);
  };

  const logoItem = (num: number, prefix: string) => {
    const key = `${prefix}-${num}`;
    const isActive = activeKey === key;
    return (
      <div
        key={key}
        className="logo-item mx-6 sm:mx-8 flex items-center shrink-0"
        onTouchStart={() => handleTouchStart(key)}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={`/images/logo-${num}-color.png`}
          alt={`Client ${num}`}
          width={120}
          height={40}
          className={`transition-all duration-500 object-contain select-none ${
            isActive ? "grayscale-0 opacity-100" : "grayscale opacity-40"
          }`}
          draggable={false}
        />
      </div>
    );
  };

  return (
    <div className="overflow-hidden relative" aria-label="Client logos" role="region">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-eerie-black-2 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-eerie-black-2 to-transparent z-10 pointer-events-none" />

      <div
        className={`flex animate-marquee ${isPaused ? "marquee-paused" : "marquee-running"}`}
        aria-hidden="true"
      >
        {logos.map((num) => logoItem(num, "a"))}
        {logos.map((num) => logoItem(num, "b"))}
      </div>
    </div>
  );
}

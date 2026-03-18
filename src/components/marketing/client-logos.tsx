"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export function ClientLogos() {
  const [isPaused, setIsPaused] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logos = [1, 2, 3, 4, 5, 6];

  // --- Desktop (mouse) handlers ---
  const handleMouseEnter = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setIsPaused(true);
  };
  const handleMouseLeave = () => {
    setIsPaused(false);
    setActiveKey(null);
  };

  // --- Mobile (touch) handlers per logo ---
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

  const renderLogo = (num: number, prefix: string) => {
    const key = `${prefix}-${num}`;
    const isActive = activeKey === key;
    return (
      <div
        key={key}
        className="mx-8 flex items-center shrink-0"
        onMouseEnter={() => setActiveKey(key)}
        onMouseLeave={() => setActiveKey(null)}
        onTouchStart={() => handleTouchStart(key)}
        onTouchEnd={handleTouchEnd}
        aria-hidden={prefix === "b" ? true : undefined}
      >
        <Image
          src={`/images/logo-${num}-color.png`}
          alt={prefix === "a" ? `Client ${num}` : ""}
          width={120}
          height={40}
          className={`transition-all duration-500 object-contain ${
            isActive ? "grayscale-0 opacity-100" : "grayscale opacity-40"
          }`}
        />
      </div>
    );
  };

  return (
    <div className="overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-eerie-black-2 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-eerie-black-2 to-transparent z-10 pointer-events-none" />

      <div
        className={`flex animate-marquee ${isPaused ? "marquee-paused" : "marquee-running"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {logos.map((num) => renderLogo(num, "a"))}
        {logos.map((num) => renderLogo(num, "b"))}
      </div>
    </div>
  );
}

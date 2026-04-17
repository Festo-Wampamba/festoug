"use client";

import { useEffect, useRef, useState } from "react";

const RADIUS       = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 263.9

interface SkillBarProps {
  title: string;
  value: number;
  index?: number;
}

export function SkillBar({ title, value, index = 0 }: SkillBarProps) {
  const wrapRef   = useRef<HTMLLIElement>(null);
  const [visible,    setVisible]    = useState(false);
  const [displayed,  setDisplayed]  = useState(0);
  const [isHovered,  setIsHovered]  = useState(false);

  // ≥90 → flame tier  |  85 → thumbs tier
  const tier = value >= 90 ? "flame" : value === 85 ? "thumbs" : null;
  const targetOffset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;

  // Scroll-reveal trigger
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!visible) return;
    const duration = 1400;
    let start: number | null = null;
    let frameId: number;
    const tick = (now: number) => {
      if (!start) start = now;
      const p    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * value));
      if (p < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [visible, value]);

  const showFlame  = isHovered && tier === "flame";
  const showThumbs = isHovered && tier === "thumbs";

  return (
    // Outer <li> is the rotating rainbow border wrapper
    <li
      ref={wrapRef}
      className={`skill-card skill-card-delay-${index} skill-rotating-border`}
    >
      {/* Inner card surface — sits above the conic layer via z-index in CSS */}
      <div
        className="skill-card-inner h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Circular progress ring */}
        <div className="relative w-[96px] h-[96px]">
          <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
            {/* Track — glows flame-orange on hover for 90%+ */}
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className={`transition-all duration-500 ${showFlame ? "ring-track-flame" : "text-jet"}`}
            />
            {/* Filled arc */}
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={visible ? targetOffset : CIRCUMFERENCE}
              className={`ring-progress transition-colors duration-500 ${
                showFlame ? "text-orange-300" : "text-orange-yellow-crayola"
              }`}
            />
          </svg>

          {/* Center: flame / thumbs / percentage */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {showFlame ? (
              <span className="text-2xl select-none flame-glow" aria-hidden>
                🔥
              </span>
            ) : showThumbs ? (
              <span className="text-xl select-none" aria-hidden>👍</span>
            ) : (
              <span className="text-white-2 text-[18px] font-bold tabular-nums leading-none">
                {displayed}<span className="text-[11px] text-light-gray font-normal">%</span>
              </span>
            )}
          </div>
        </div>

        {/* Label */}
        <p className={`text-[12px] font-medium text-center leading-snug transition-colors duration-200 ${
          isHovered ? "text-white-2" : "text-light-gray"
        }`}>
          {title}
        </p>
      </div>
    </li>
  );
}

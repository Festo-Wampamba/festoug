"use client";

import { useEffect, useRef, useState } from "react";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 263.9

interface SkillBarProps {
  title: string;
  value: number;
  index?: number;
}

export function SkillBar({ title, value, index = 0 }: SkillBarProps) {
  const wrapRef  = useRef<HTMLLIElement>(null);
  const [visible,   setVisible]   = useState(false);
  const [displayed, setDisplayed] = useState(0);

  const targetOffset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  return (
    <li
      ref={wrapRef}
      className={`skill-card skill-card-delay-${index}
        flex flex-col items-center gap-3 rounded-2xl p-5
        bg-eerie-black-1 border border-jet
        hover:border-orange-yellow-crayola/30
        transition-colors duration-300 group`}
    >
      {/* Circular progress ring */}
      <div className="relative w-[96px] h-[96px]">
        <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
          {/* Track */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-jet"
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
            className="text-orange-yellow-crayola ring-progress"
          />
        </svg>

        {/* Percentage */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white-2 text-[18px] font-bold tabular-nums leading-none">
            {displayed}<span className="text-[11px] text-light-gray font-normal">%</span>
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="text-light-gray group-hover:text-white-2 text-[12px] font-medium text-center leading-snug transition-colors duration-200">
        {title}
      </p>
    </li>
  );
}

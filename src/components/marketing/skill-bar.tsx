"use client";

import { useEffect, useRef, useState } from "react";

const RADIUS        = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 263.9

interface SkillBarProps {
  title: string;
  value: number;
  index?: number;
}

type Tier = "excellent" | "very-good" | "good";

function getTier(v: number): Tier | null {
  if (v >= 95) return "excellent";
  if (v >= 85) return "very-good";
  if (v >= 70) return "good";
  return null;
}

const TIER_RING_COLOR: Record<Tier, string> = {
  excellent:  "#ca953d",
  "very-good": "#34d399",
  good:        "#60a5fa",
};

export function SkillBar({ title, value, index = 0 }: SkillBarProps) {
  const wrapRef = useRef<HTMLLIElement>(null);
  const [visible,   setVisible]   = useState(false);
  const [displayed, setDisplayed] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const tier         = getTier(value);
  const targetOffset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;
  const canFlip      = tier !== null;

  // Scroll-reveal trigger
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!visible) return;
    const duration = 1400;
    let start: number | null = null;
    let fid: number;
    const tick = (now: number) => {
      if (!start) start = now;
      const p    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * value));
      if (p < 1) fid = requestAnimationFrame(tick);
    };
    fid = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(fid);
  }, [visible, value]);

  const ringColor = tier ? TIER_RING_COLOR[tier] : undefined;

  return (
    <li
      ref={wrapRef}
      className={`skill-card skill-card-delay-${index}`}
      style={{ minHeight: "160px" }}
    >
      <div
        className={`skill-flip-card${canFlip && isFlipped ? " is-flipped" : ""}`}
        onMouseEnter={() => canFlip && setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        onTouchStart={() => canFlip && setIsFlipped(f => !f)}
      >
        <div className="skill-flip-inner">

          {/* ── Front face ── */}
          <div className="skill-flip-front skill-card-surface">
            <div className="relative w-[96px] h-[96px]">
              <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
                <circle
                  cx="50" cy="50" r={RADIUS}
                  fill="none" stroke="currentColor" strokeWidth="6"
                  className="text-jet"
                />
                <circle
                  cx="50" cy="50" r={RADIUS}
                  fill="none" stroke="currentColor" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={visible ? targetOffset : CIRCUMFERENCE}
                  className="ring-progress text-orange-yellow-crayola"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white-2 text-[18px] font-bold tabular-nums leading-none">
                  {displayed}
                  <span className="text-[11px] text-light-gray font-normal">%</span>
                </span>
              </div>
            </div>
            <p className="text-[12px] font-medium text-center leading-snug text-light-gray">
              {title}
            </p>
          </div>

          {/* ── Back face (tiered cards only) ── */}
          {canFlip && tier ? (
            <div
              className="skill-flip-back skill-card-surface skill-flip-back-tier"
              data-tier={tier}
            >
              {/* Decorative concentric rings */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 160 160"
                aria-hidden
              >
                <circle cx="80" cy="80" r="68" fill="none" stroke={ringColor}
                  strokeWidth="0.6" strokeOpacity="0.14" />
                <circle cx="80" cy="80" r="52" fill="none" stroke={ringColor}
                  strokeWidth="1" strokeOpacity="0.20" strokeDasharray="5 5" />
                <circle cx="80" cy="80" r="36" fill="none" stroke={ringColor}
                  strokeWidth="0.6" strokeOpacity="0.10" />
              </svg>

              <div className="relative flex flex-col items-center gap-2">
                <span className="skill-tier-value">
                  {value}
                  <span className="text-[1rem] opacity-65">%</span>
                </span>
                <span className="skill-tier-badge">
                  {tier === "excellent" ? "Excellent" : tier === "very-good" ? "Very Good" : "Good"}
                </span>
                <span className="skill-tier-name">{title}</span>
              </div>
            </div>
          ) : (
            /* No tier — back mirrors front so no visible flip */
            <div className="skill-flip-back skill-card-surface">
              <div className="relative w-[96px] h-[96px]">
                <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="currentColor"
                    strokeWidth="6" className="text-jet" />
                  <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="currentColor"
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={visible ? targetOffset : CIRCUMFERENCE}
                    className="ring-progress text-orange-yellow-crayola" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white-2 text-[18px] font-bold tabular-nums leading-none">
                    {value}
                    <span className="text-[11px] text-light-gray font-normal">%</span>
                  </span>
                </div>
              </div>
              <p className="text-[12px] font-medium text-center leading-snug text-light-gray">{title}</p>
            </div>
          )}

        </div>
      </div>
    </li>
  );
}

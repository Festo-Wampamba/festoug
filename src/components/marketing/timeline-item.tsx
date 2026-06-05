"use client";

import { useEffect, useRef } from "react";

interface TimelineItemProps {
  institution: string;
  period: string;
  program?: string;
  role?: string;
  description: string;
}

export function TimelineItem({ institution, period, program, role, description }: TimelineItemProps) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      className="reveal-item group relative mb-4 overflow-hidden rounded-xl
        bg-eerie-black-1 border border-jet hover:border-light-gray-70/30
        p-4 sm:p-5 transition-[transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-1 motion-reduce:hover:translate-y-0"
    >
      <h4 className="text-white-2 text-[14px] sm:text-[16px] font-bold capitalize mb-1 font-head leading-snug">
        {program || role}
      </h4>
      <h5 className="text-accent-3 text-[12px] sm:text-[13px] font-medium capitalize mb-1">
        {institution}
      </h5>
      <span className="text-accent-2 text-[11px] sm:text-[12px] font-medium block mb-2.5 tracking-wide">
        {period}
      </span>
      <div className="text-light-gray text-[13px] sm:text-[14px] font-light leading-[1.7] space-y-2">
        {description.split("\n").map((line, i) => {
          const t = line.trim();
          return t ? <p key={i}>{t}</p> : null;
        })}
      </div>
    </li>
  );
}

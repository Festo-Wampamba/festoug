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
    <li ref={ref} className="reveal-item relative mb-6 ml-0 sm:ml-5">
      <div className="hidden sm:block absolute top-[5px] left-[calc(-20px-11px)] w-[12px] h-[12px] bg-orange-yellow-crayola rounded-full z-10 shadow-[0_0_0_4px_theme(colors.jet)]" />

      <h4 className="text-white-2 text-[13px] sm:text-[15px] font-semibold capitalize mb-[4px] sm:mb-[6px]">
        {program || role}
      </h4>
      <h5 className="text-light-gray text-[12px] sm:text-[14px] font-medium capitalize mb-[4px] sm:mb-[6px]">
        {institution}
      </h5>
      <span className="text-orange-yellow-crayola text-[11px] sm:text-[13px] font-light block mb-[8px] sm:mb-[10px] tracking-wide">
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

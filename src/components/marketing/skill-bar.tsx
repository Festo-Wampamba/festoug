"use client";

import { useEffect, useRef, useState } from "react";

interface SkillBarProps {
  title: string;
  value: number;
}

export function SkillBar({ title, value }: SkillBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [displayedValue, setDisplayedValue] = useState(0);

  useEffect(() => {
    const progressBar = progressRef.current;
    if (!progressBar) return;

    const duration = 2000; // 2 seconds animation

    const handleAnimation = () => {
      let startTime: number | null = null;
      let frameId: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function for smoother finish
        const easeOutQuad = progress * (2 - progress);
        const currentValue = Math.floor(easeOutQuad * value);
        
        setDisplayedValue(currentValue);
        progressBar.style.width = `${currentValue}%`;

        if (progress < 1) {
          frameId = requestAnimationFrame(animate);
        }
      };

      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleAnimation();
        } else {
          setDisplayedValue(0);
          progressBar.style.width = "0%";
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(progressBar);

    return () => {
      observer.unobserve(progressBar);
    };
  }, [value]);

  return (
    <li className="mb-[25px]">
      <div className="flex items-center gap-[5px] mb-[8px]">
        <h5 className="text-white-2 text-[15px] font-medium capitalize font-sans">{title}</h5>
        <data className="text-light-gray text-[15px] font-light font-sans ml-auto" value={value}>
          {displayedValue}%
        </data>
      </div>
      
      <div className="bg-jet w-full h-[8px] rounded-[10px] overflow-hidden">
        <div
          ref={progressRef}
          className="bg-orange-yellow-crayola h-full rounded-[10px]"
          style={{ width: "0%" }}
        />
      </div>
    </li>
  );
}

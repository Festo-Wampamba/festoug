"use client";

import { ReactNode } from "react";

interface ServiceCardProps {
  title: string;
  icon: ReactNode;
  features: string[];
  description: string;
}

export function ServiceCard({ title, icon, features, description }: ServiceCardProps) {
  return (
    <div className="group relative bg-eerie-black-1 border border-jet rounded-2xl p-5 md:p-6 overflow-hidden transition-all duration-300 hover:border-orange-yellow-crayola/50 hover:shadow-[0_0_20px_rgba(255,181,63,0.15)]">
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-yellow-crayola/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-orange-yellow-crayola/10 text-orange-yellow-crayola text-2xl">
            {icon}
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-white-2">{title}</h3>
        </div>

        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-light-gray text-sm md:text-base">
              <span className="text-orange-yellow-crayola mr-3 mt-1 text-[10px]">●</span>
              {feature}
            </li>
          ))}
        </ul>

        <p className="text-light-gray-70 text-sm leading-relaxed border-t border-jet pt-6">
          {description}
        </p>
      </div>
    </div>
  );
}

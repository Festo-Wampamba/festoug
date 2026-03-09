"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";

export interface PricingPlanProps {
  name: string;
  target: string;
  price: number;
  interval: "Monthly" | "Project";
  features: { name: string; included: boolean }[];
  isPopular?: boolean;
}

export function PricingCard({ plan }: { plan: PricingPlanProps }) {
  return (
    <div 
      className={`relative bg-eerie-black-1 rounded-2xl p-6 xl:p-8 flex flex-col h-full border ${
        plan.isPopular 
          ? "border-orange-yellow-crayola shadow-[0_0_30px_rgba(255,181,63,0.1)]" 
          : "border-jet"
      }`}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max">
          <span className="bg-orange-yellow-crayola text-smoky-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 mt-2">
        <h3 className="text-2xl font-bold text-white-2 mb-2">{plan.name}</h3>
        <p className="text-light-gray-70 text-sm mb-6">{plan.target}</p>
        
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-bold text-orange-yellow-crayola">
            ${Math.floor(plan.price)}
          </span>
          <span className="text-light-gray-70 text-sm font-medium">
            {plan.interval === "Monthly" ? "/ month" : "/ project"}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <Link 
        href="/contact"
        className={`w-full py-3 rounded-xl font-semibold text-center transition-all duration-300 mb-8 ${
          plan.isPopular
            ? "bg-orange-yellow-crayola text-smoky-black hover:bg-orange-yellow-crayola/90 hover:shadow-[0_0_15px_rgba(255,181,63,0.4)]"
            : "bg-jet text-orange-yellow-crayola hover:bg-jet/80"
        }`}
      >
        Get Started Now
      </Link>

      {/* Features List */}
      <div className="flex-grow">
        <p className="text-white-2 text-sm font-semibold mb-4">
          {plan.name} includes:
        </p>
        <ul className="space-y-4">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-orange-yellow-crayola shrink-0" />
              ) : (
                <X className="w-5 h-5 text-jet shrink-0" />
              )}
              <span className={`text-sm ${feature.included ? 'text-light-gray' : 'text-jet line-through'}`}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Shield, Zap, Award } from "lucide-react";

const TIERS = [
  {
    name: "Basic",
    tierLevel: 1,
    Icon: Shield,
    description: "Essential upkeep for small sites",
    features: [
      "Monthly updates",
      "Security monitoring",
      "Uptime checks",
      "Email support",
    ],
    cta: { label: "Get Started", href: "/get-started" },
    featured: false,
    iconBg:       "bg-light-gray-70/10 group-hover:bg-light-gray-70/15",
    iconColor:    "text-light-gray-70",
    tierBarFill:  "bg-light-gray-70/50",
    dotColor:     "bg-light-gray-70/60",
    cardHover:    "hover:border-light-gray-70/25 hover:shadow-[0_8px_24px_rgba(255,255,255,0.05)]",
    btnClass:     "border border-jet text-light-gray-70 hover:bg-jet hover:text-white-2",
  },
  {
    name: "Pro",
    tierLevel: 2,
    Icon: Zap,
    description: "Full management for growing projects",
    features: [
      "Everything in Basic",
      "Server management",
      "Performance tuning",
      "Priority support",
      "Monthly report",
    ],
    cta: { label: "Get Started", href: "/get-started" },
    featured: true,
    iconBg:       "bg-green-500/10 group-hover:bg-green-500/20",
    iconColor:    "text-green-400",
    tierBarFill:  "bg-green-400",
    dotColor:     "bg-green-400",
    cardHover:    "hover:border-green-400 hover:shadow-[0_8px_32px_rgba(34,197,94,0.2)]",
    btnClass:     "bg-green-500 text-white hover:bg-green-600",
  },
  {
    name: "Enterprise",
    tierLevel: 3,
    Icon: Award,
    description: "Tailored to your needs",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom SLA",
      "Multiple projects",
      "Quarterly strategy call",
    ],
    cta: { label: "Contact Us", href: "/contact" },
    featured: false,
    iconBg:       "bg-purple-400/10 group-hover:bg-purple-400/15",
    iconColor:    "text-purple-400",
    tierBarFill:  "bg-purple-400",
    dotColor:     "bg-purple-400/70",
    cardHover:    "hover:border-purple-400/40 hover:shadow-[0_8px_28px_rgba(192,132,252,0.12)]",
    btnClass:     "border border-jet text-light-gray-70 hover:bg-jet hover:text-white-2",
  },
];

export function MaintenanceCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`group relative flex flex-col rounded-2xl p-6 bg-eerie-black-1 transition-all duration-300 hover:-translate-y-1.5 ${
            tier.featured
              ? `border-2 border-green-500 ${tier.cardHover}`
              : `border border-jet ${tier.cardHover}`
          }`}
        >
          {tier.featured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
              Most Popular
            </div>
          )}

          {/* Tier strength bar */}
          <div className="flex gap-1 mb-5">
            {[1, 2, 3].map((seg) => (
              <div
                key={seg}
                className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                  seg <= tier.tierLevel ? tier.tierBarFill : "bg-jet"
                }`}
              />
            ))}
          </div>

          {/* Icon + tier name row */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg ${tier.iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
              <tier.Icon className={`w-4 h-4 ${tier.iconColor}`} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-light-gray-70">
              {tier.name}
            </p>
          </div>

          <p className="text-sm text-light-gray mb-5 leading-relaxed">{tier.description}</p>

          <ul className="flex-1 space-y-2.5 mb-6">
            {tier.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-light-gray">
                <span className={`w-1.5 h-1.5 rounded-full ${tier.dotColor} flex-shrink-0 transition-transform duration-300 group-hover:scale-125`} />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={tier.cta.href}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group/btn ${tier.btnClass}`}
          >
            {tier.cta.label}
            <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
          </Link>
        </div>
      ))}
    </div>
  );
}

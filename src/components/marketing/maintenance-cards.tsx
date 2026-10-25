import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeIcon,
  LightningBoltIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";

const TIERS = [
  {
    name: "Basic",
    tierLevel: 1,
    Icon: LockClosedIcon,
    description: "Essential upkeep for small sites",
    features: [
      "Monthly updates",
      "Security monitoring",
      "Uptime checks",
      "Email support",
    ],
    cta: { label: "Get Started", href: "/get-started" },
    featured: false,
    iconBg:       "bg-muted text-muted-foreground group-hover:bg-secondary group-hover:text-secondary-foreground",
    iconColor:    "text-muted-foreground",
    tierBarFill:  "bg-primary/60",
    dotColor:     "bg-primary/60",
    cardHover:    "hover:border-primary/40 hover:shadow-lg",
    btnClass:     "border border-border text-foreground hover:bg-secondary hover:text-secondary-foreground",
  },
  {
    name: "Pro",
    tierLevel: 2,
    Icon: LightningBoltIcon,
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
    iconBg:       "bg-primary/10 text-primary group-hover:bg-primary/20",
    iconColor:    "text-primary",
    tierBarFill:  "bg-primary",
    dotColor:     "bg-primary",
    cardHover:    "hover:border-primary hover:shadow-lg",
    btnClass:     "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    name: "Enterprise",
    tierLevel: 3,
    Icon: BadgeIcon,
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
    iconBg:       "bg-secondary text-secondary-foreground group-hover:bg-secondary/80",
    iconColor:    "text-secondary-foreground",
    tierBarFill:  "bg-primary/80",
    dotColor:     "bg-primary/80",
    cardHover:    "hover:border-primary/50 hover:shadow-lg",
    btnClass:     "border border-border text-foreground hover:bg-secondary hover:text-secondary-foreground",
  },
];

export function MaintenanceCards() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-8">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`group relative flex flex-col rounded-2xl p-6 bg-card text-card-foreground transition-all duration-300 hover:-translate-y-1 ${
            tier.featured
              ? `border-2 border-primary ${tier.cardHover}`
              : `border border-border ${tier.cardHover}`
          }`}
        >
          {tier.featured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
              Most Popular
            </div>
          )}

          {/* Tier strength bar */}
          <div className="flex gap-1 mb-5">
            {[1, 2, 3].map((seg) => (
              <div
                key={seg}
                className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                  seg <= tier.tierLevel ? tier.tierBarFill : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Icon + tier name row */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg ${tier.iconBg} flex items-center justify-center transition-colors duration-300`}>
              <tier.Icon className={`w-4 h-4 ${tier.iconColor}`} aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {tier.name}
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{tier.description}</p>

          <ul className="flex-1 space-y-2.5 mb-6">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground">
                <span className={`w-1.5 h-1.5 rounded-full ${tier.dotColor} flex-shrink-0 transition-transform duration-300 group-hover:scale-125`} />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={tier.cta.href}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98] ${tier.btnClass}`}
          >
            {tier.cta.label}
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      ))}
    </div>
  );
}

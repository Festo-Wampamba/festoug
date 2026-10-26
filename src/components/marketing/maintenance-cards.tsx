import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeIcon,
  CheckCircledIcon,
  LightningBoltIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";

const TIERS = [
  {
    name: "Basic",
    Icon: LockClosedIcon,
    description: "Routine maintenance for smaller business websites, with scheduled updates, service checks, and a defined channel for reporting issues.",
    features: [
      "Monthly updates",
      "Security monitoring",
      "Uptime checks",
      "Email support",
    ],
    cta: { label: "Get Started", href: "/get-started" },
    featured: false,
    iconClass: "bg-secondary text-secondary-foreground",
    iconHoverClass: "group-hover:bg-primary group-hover:text-primary-foreground",
  },
  {
    name: "Pro",
    Icon: LightningBoltIcon,
    description: "Coordinated application and server maintenance for growing products, with performance reviews, priority handling, and regular reporting.",
    features: [
      "Everything in Basic",
      "Server management",
      "Performance tuning",
      "Priority support",
      "Monthly report",
    ],
    cta: { label: "Get Started", href: "/get-started" },
    featured: true,
    badge: "Managed support",
    iconClass: "bg-primary/10 text-primary",
    iconHoverClass: "group-hover:bg-primary group-hover:text-primary-foreground",
  },
  {
    name: "Enterprise",
    Icon: BadgeIcon,
    description: "A tailored support arrangement for teams coordinating multiple projects or a more involved infrastructure and planning scope.",
    features: [
      "Everything in Pro",
      "Direct support channel",
      "Agreed service scope",
      "Multiple projects",
      "Quarterly strategy call",
    ],
    cta: { label: "Contact Us", href: "/contact" },
    featured: false,
    iconClass: "bg-secondary text-secondary-foreground",
    iconHoverClass: "group-hover:bg-primary group-hover:text-primary-foreground",
  },
];

export function MaintenanceCards() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))] gap-5">
      {TIERS.map((tier) => (
        <article
          key={tier.name}
          className={`service-reveal group relative flex flex-col rounded-2xl border bg-card p-6 text-card-foreground transition-[transform,border-color,background-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-secondary motion-reduce:hover:translate-y-0 ${
            tier.featured ? "border-primary/70" : "border-border hover:border-primary/40"
          }`}
        >
          {tier.badge && (
            <div className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold tracking-wide text-primary-foreground">
              {tier.badge}
            </div>
          )}

          <div className="mb-5 flex items-center justify-between gap-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-border transition-colors duration-200 ${tier.iconClass} ${tier.iconHoverClass}`}>
              <tier.Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{tier.name}</p>
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">{tier.description}</p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Included scope</p>
          <ul className="mt-3 flex-1 space-y-2.5">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-base leading-relaxed text-card-foreground">
                <CheckCircledIcon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href={tier.cta.href}
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-card-foreground transition-[background-color,border-color,transform] duration-200 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground motion-safe:active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {tier.cta.label}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}

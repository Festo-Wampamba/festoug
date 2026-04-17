import Link from "next/link";

const TIERS = [
  {
    name: "Basic",
    description: "Essential upkeep for small sites",
    features: [
      "Monthly updates",
      "Security monitoring",
      "Uptime checks",
      "Email support",
    ],
    cta: { label: "Get Started →", href: "/get-started" },
    featured: false,
  },
  {
    name: "Pro",
    description: "Full management for growing projects",
    features: [
      "Everything in Basic",
      "Server management",
      "Performance tuning",
      "Priority support",
      "Monthly report",
    ],
    cta: { label: "Get Started →", href: "/get-started" },
    featured: true,
  },
  {
    name: "Enterprise",
    description: "Tailored to your needs",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom SLA",
      "Multiple projects",
      "Quarterly strategy call",
    ],
    cta: { label: "Contact Us →", href: "/contact" },
    featured: false,
  },
];

export function MaintenanceCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`bg-eerie-black-1 rounded-2xl p-6 flex flex-col ${
            tier.featured
              ? "border-2 border-green-500 relative"
              : "border border-jet"
          }`}
        >
          {tier.featured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
              Most Popular
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-widest text-light-gray-70 mb-2">
            {tier.name}
          </p>
          <p className="text-sm text-light-gray mb-6">{tier.description}</p>
          <ul className="flex-1 space-y-2 mb-6">
            {tier.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-light-gray">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={tier.cta.href}
            className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tier.featured
                ? "bg-green-500 text-white hover:bg-green-600"
                : "border border-jet text-light-gray-70 hover:bg-jet hover:text-white-2"
            }`}
          >
            {tier.cta.label}
          </Link>
        </div>
      ))}
    </div>
  );
}

// src/app/(main)/services/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Code2, MonitorSmartphone, Palette, Rocket, Search, Share2 } from "lucide-react";
import { MaintenanceCards } from "@/components/marketing/maintenance-cards";

export const metadata: Metadata = {
  title:       "Services & Pricing | FestoUG",
  description: "Web development, custom projects, and ongoing maintenance plans. Clear pricing, no hidden fees.",
};

export const dynamic = "force-dynamic";

const SERVICE_CHIPS = [
  { icon: <Code2  className="w-4 h-4" />, label: "Web Development"    },
  { icon: <MonitorSmartphone className="w-4 h-4" />, label: "Mobile Apps" },
  { icon: <Palette className="w-4 h-4" />, label: "UI / UX Design"    },
  { icon: <Rocket  className="w-4 h-4" />, label: "E-commerce"        },
  { icon: <Search  className="w-4 h-4" />, label: "SEO & Marketing"   },
  { icon: <Share2  className="w-4 h-4" />, label: "Social Media"      },
];

const PROJECT_TIERS = [
  {
    name:    "Lite",
    price:   "$999",
    note:    "Best for landing pages & simple sites",
    popular: false,
    features: [
      "Up to 5 pages",
      "Responsive design",
      "Basic SEO setup",
      "Contact form",
      "2 revision rounds",
    ],
  },
  {
    name:    "Premium",
    price:   "$2,499",
    note:    "Full website with CMS & authentication",
    popular: true,
    features: [
      "Up to 15 pages",
      "CMS integration",
      "Auth system",
      "Admin dashboard",
      "API integrations",
      "5 revision rounds",
    ],
  },
  {
    name:    "Pro",
    price:   "$4,999",
    note:    "Full platform with custom backend",
    popular: false,
    features: [
      "Unlimited pages",
      "Custom backend & API",
      "Third-party integrations",
      "Performance optimization",
      "Deployment & CI/CD",
      "Unlimited revisions",
    ],
  },
];

export default async function ServicesPage() {
  return (
    <div className="animate-in fade-in duration-500">

      {/* Page Header */}
      <header className="mb-16 xl:max-w-[60%]">
        <h2 className="text-white-2 text-3xl md:text-5xl font-semibold mb-6 pb-5 capitalize relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-orange-yellow-crayola before:rounded-sm">
          Services <span className="text-light-gray-70 font-light">&amp; Pricing</span>
        </h2>
        <p className="text-light-gray text-base md:text-lg leading-relaxed">
          From one-time builds to ongoing maintenance — clear pricing, no hidden fees.
        </p>
      </header>

      {/* ── 01 What I Build ── */}
      <section className="mb-16">
        <h3 className="text-xl font-semibold text-white-2 mb-6 flex items-center gap-3">
          <span className="text-orange-yellow-crayola">01.</span> What I Build
        </h3>
        <div className="flex flex-wrap gap-3">
          {SERVICE_CHIPS.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-eerie-black-1 border border-jet rounded-xl px-4 py-2.5 text-sm text-light-gray"
            >
              <span className="text-orange-yellow-crayola">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-jet to-transparent mb-16" />

      {/* ── 02 Project Tiers ── */}
      <section className="mb-16">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">02.</span> Custom Project Pricing
          </h3>
          <p className="text-light-gray text-sm">Fixed-scope builds. You own everything. One-time payment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl p-6 border ${
                tier.popular
                  ? "bg-eerie-black-1 border-orange-yellow-crayola/60 relative"
                  : "bg-eerie-black-1 border-jet"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-yellow-crayola text-smoky-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <p className="text-xs font-semibold uppercase tracking-widest text-light-gray-70 mb-4">
                {tier.name}
              </p>
              <div className="mb-1">
                <span className="text-3xl font-extrabold text-white-2 tracking-tight">{tier.price}</span>
              </div>
              <p className="text-xs text-light-gray-70 mb-6">one-time payment · {tier.note}</p>
              <ul className="flex-1 space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-light-gray">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-yellow-crayola flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/get-started?tier=${tier.name.toLowerCase()}`}
                className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tier.popular
                    ? "bg-orange-yellow-crayola text-smoky-black hover:bg-orange-yellow-crayola/90"
                    : "border border-jet text-light-gray-70 hover:bg-jet hover:text-white-2"
                }`}
              >
                Get Started →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-jet to-transparent mb-16" />

      {/* ── 03 Maintenance Plans ── */}
      <section>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">03.</span> Monthly Maintenance &amp; Support
          </h3>
          <p className="text-light-gray text-sm">
            Keep your site fast, secure, and up to date — without lifting a finger.
          </p>
        </div>

        <MaintenanceCards />
      </section>

    </div>
  );
}

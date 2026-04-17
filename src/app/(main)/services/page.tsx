import { Metadata } from "next";
import Link from "next/link";
import { Code2, Server, Globe, Network, Cpu, Search } from "lucide-react";
import { MaintenanceCards } from "@/components/marketing/maintenance-cards";

export const metadata: Metadata = {
  title:       "Services & Expertise | FestoUG",
  description: "Web development, server administration, network engineering, and ongoing technical support.",
};

export const dynamic = "force-dynamic";

const SERVICE_CHIPS = [
  { icon: <Code2   className="w-4 h-4" />, label: "Web Development"      },
  { icon: <Server  className="w-4 h-4" />, label: "Server Administration" },
  { icon: <Globe   className="w-4 h-4" />, label: "Web Server Management" },
  { icon: <Network className="w-4 h-4" />, label: "Network Engineering"   },
  { icon: <Cpu     className="w-4 h-4" />, label: "IT Infrastructure"     },
  { icon: <Search  className="w-4 h-4" />, label: "SEO & Marketing"       },
];

const PROJECT_TYPES = [
  {
    name: "Web Projects",
    num: "01",
    Icon: Globe,
    items: [
      "Custom websites & web apps",
      "CMS integration",
      "E-commerce & online stores",
      "SEO-ready builds",
      "Performance optimization",
    ],
    borderHover:  "hover:border-orange-yellow-crayola/50",
    shadowHover:  "hover:shadow-[0_8px_32px_rgba(202,165,93,0.14)]",
    iconBg:       "bg-orange-yellow-crayola/10",
    iconColor:    "text-orange-yellow-crayola",
    accentBar:    "bg-orange-yellow-crayola",
    dot:          "bg-orange-yellow-crayola",
    btnHover:     "group-hover:border-orange-yellow-crayola/40 group-hover:text-orange-yellow-crayola",
  },
  {
    name: "Infrastructure & Servers",
    num: "02",
    Icon: Server,
    items: [
      "Server setup, hardening & deployment",
      "Nginx / Apache / cPanel setup",
      "SSL certificates & renewals",
      "Automated backups & monitoring",
      "CI/CD pipelines",
    ],
    borderHover:  "hover:border-red-400/50",
    shadowHover:  "hover:shadow-[0_8px_32px_rgba(248,113,113,0.14)]",
    iconBg:       "bg-red-400/10",
    iconColor:    "text-red-400",
    accentBar:    "bg-red-400",
    dot:          "bg-red-400",
    btnHover:     "group-hover:border-red-400/40 group-hover:text-red-400",
  },
  {
    name: "Networking",
    num: "03",
    Icon: Network,
    items: [
      "Network design & configuration",
      "Firewall & VPN setup",
      "LAN / WAN troubleshooting",
      "IP addressing & subnetting",
      "DNS management",
    ],
    borderHover:  "hover:border-cyan-400/50",
    shadowHover:  "hover:shadow-[0_8px_32px_rgba(34,211,238,0.14)]",
    iconBg:       "bg-cyan-400/10",
    iconColor:    "text-cyan-400",
    accentBar:    "bg-cyan-400",
    dot:          "bg-cyan-400",
    btnHover:     "group-hover:border-cyan-400/40 group-hover:text-cyan-400",
  },
];

export default async function ServicesPage() {
  return (
    <div className="animate-in fade-in duration-500">

      {/* Page Header */}
      <header className="mb-16 xl:max-w-[60%]">
        <h2 className="text-white-2 text-3xl md:text-5xl font-semibold mb-6 pb-5 capitalize relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-orange-yellow-crayola before:rounded-sm">
          Services <span className="text-light-gray-70 font-light">&amp; Expertise</span>
        </h2>
        <p className="text-light-gray text-base md:text-lg leading-relaxed">
          I build websites, manage servers, and configure networks. Here is what I offer.
        </p>
      </header>

      {/* ── 01 What I Offer ── */}
      <section className="mb-16">
        <h3 className="text-xl font-semibold text-white-2 mb-6 flex items-center gap-3">
          <span className="text-orange-yellow-crayola">01.</span> What I Offer
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SERVICE_CHIPS.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-eerie-black-1 border border-jet rounded-xl px-4 py-3 text-sm text-light-gray hover:border-orange-yellow-crayola/40 hover:text-white-2 hover:bg-jet/50 transition-all duration-200 cursor-default"
            >
              <span className="text-orange-yellow-crayola">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-jet to-transparent mb-16" />

      {/* ── 02 What I Work On ── */}
      <section className="mb-16">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">02.</span> What I Work On
          </h3>
          <p className="text-light-gray text-sm">Tell me what you need and I will give you a tailored quote.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_TYPES.map((type) => (
            <div
              key={type.name}
              className={`group relative flex flex-col rounded-2xl p-6 bg-eerie-black-1 border border-jet overflow-hidden
                transition-all duration-300 hover:-translate-y-1.5
                ${type.borderHover} ${type.shadowHover}`}
            >
              {/* Top accent bar — revealed on hover */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${type.accentBar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Muted background number */}
              <span className="absolute top-4 right-4 text-6xl font-black text-white/[0.035] select-none leading-none tabular-nums">
                {type.num}
              </span>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${type.iconBg} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <type.Icon className={`w-5 h-5 ${type.iconColor}`} />
              </div>

              {/* Title */}
              <p className="text-sm font-bold text-white-2 mb-5 tracking-wide">{type.name}</p>

              {/* Items */}
              <ul className="flex-1 space-y-2.5 mb-6">
                {type.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-light-gray">
                    <span className={`w-1.5 h-1.5 rounded-full ${type.dot} flex-shrink-0 transition-transform duration-300 group-hover:scale-125`} />
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/get-started"
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border border-jet text-light-gray-70 text-sm font-semibold
                  transition-all duration-300 hover:bg-jet hover:text-white-2
                  ${type.btnHover}`}
              >
                <span>Get Started</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-jet to-transparent mb-16" />

      {/* ── 03 Ongoing Support ── */}
      <section>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">03.</span> Ongoing Support
          </h3>
          <p className="text-light-gray text-sm">
            Keep your site and systems running. I handle the technical side.
          </p>
        </div>

        <MaintenanceCards />
      </section>

    </div>
  );
}

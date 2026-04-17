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
    items: [
      "Custom websites & web apps",
      "CMS integration",
      "E-commerce & online stores",
      "SEO-ready builds",
      "Performance optimization",
    ],
  },
  {
    name: "Infrastructure & Servers",
    items: [
      "Server setup, hardening & deployment",
      "Nginx / Apache / cPanel setup",
      "SSL certificates & renewals",
      "Automated backups & monitoring",
      "CI/CD pipelines",
    ],
  },
  {
    name: "Networking",
    items: [
      "Network design & configuration",
      "Firewall & VPN setup",
      "LAN / WAN troubleshooting",
      "IP addressing & subnetting",
      "DNS management",
    ],
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
          From building websites to managing servers and networks — here&apos;s how I can help.
        </p>
      </header>

      {/* ── 01 What I Offer ── */}
      <section className="mb-16">
        <h3 className="text-xl font-semibold text-white-2 mb-6 flex items-center gap-3">
          <span className="text-orange-yellow-crayola">01.</span> What I Offer
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

      {/* ── 02 What I Work On ── */}
      <section className="mb-16">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white-2 mb-2 flex items-center gap-3">
            <span className="text-orange-yellow-crayola">02.</span> What I Work On
          </h3>
          <p className="text-light-gray text-sm">Tell me what you need — I&apos;ll give you a quote.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_TYPES.map((type) => (
            <div
              key={type.name}
              className="flex flex-col rounded-2xl p-6 bg-eerie-black-1 border border-jet"
            >
              <p className="text-sm font-semibold text-white-2 mb-4">{type.name}</p>
              <ul className="flex-1 space-y-2 mb-6">
                {type.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-light-gray">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-yellow-crayola flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/get-started"
                className="block text-center py-2.5 rounded-xl border border-jet text-light-gray-70 text-sm font-semibold hover:bg-jet hover:text-white-2 transition-colors"
              >
                Get Started →
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
            Keep your site and systems running — I handle the technical side.
          </p>
        </div>

        <MaintenanceCards />
      </section>

    </div>
  );
}

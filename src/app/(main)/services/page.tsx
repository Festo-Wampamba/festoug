import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircledIcon,
  CodeIcon,
  DesktopIcon,
  GearIcon,
  GlobeIcon,
  MagnifyingGlassIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { MaintenanceCards } from "@/components/marketing/maintenance-cards";
import { ServiceWorkflow } from "@/components/marketing/service-workflow";

export const metadata: Metadata = {
  title: "Services & Expertise | FestoUG",
  description: "Web development, server administration, network engineering, and ongoing technical support.",
};

export const dynamic = "force-dynamic";

type ServiceIcon = typeof CodeIcon;

const SERVICE_CHIPS = [
  { icon: <GlobeIcon className="h-4 w-4" aria-hidden />, label: "Web & applications" },
  { icon: <CodeIcon className="h-4 w-4" aria-hidden />, label: "Backend & APIs" },
  { icon: <DesktopIcon className="h-4 w-4" aria-hidden />, label: "Linux & web servers" },
  { icon: <Share1Icon className="h-4 w-4" aria-hidden />, label: "Networking" },
  { icon: <GearIcon className="h-4 w-4" aria-hidden />, label: "Infrastructure & deployment" },
  { icon: <MagnifyingGlassIcon className="h-4 w-4" aria-hidden />, label: "Technical SEO & performance" },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Scope",
    description: "Clarify the goal, current constraints, and the outcome that matters before recommending work.",
    icon: <MagnifyingGlassIcon className="h-5 w-5" aria-hidden />,
  },
  {
    number: "02",
    title: "Implement",
    description: "Build and configure the agreed solution, with progress updates and documented technical decisions.",
    icon: <CodeIcon className="h-5 w-5" aria-hidden />,
  },
  {
    number: "03",
    title: "Validate & hand over",
    description: "Test the result, review what changed, and leave you with practical next steps for running it well.",
    icon: <CheckCircledIcon className="h-5 w-5" aria-hidden />,
  },
];

const SERVICE_AREAS: Array<{
  name: string;
  summary: string;
  deliverables: string[];
  tools: string;
  Icon: ServiceIcon;
}> = [
  {
    name: "Web applications",
    summary: "Websites and web applications for presenting your business, supporting customer journeys, and managing online transactions.",
    deliverables: [
      "Responsive websites and web apps",
      "CMS and e-commerce integration",
      "SEO-ready builds",
    ],
    tools: "Next.js · React · TypeScript",
    Icon: GlobeIcon,
  },
  {
    name: "Backend & APIs",
    summary: "Structured application logic, integrations, and data models that connect your interface to the systems your business relies on.",
    deliverables: [
      "REST APIs and integrations",
      "PostgreSQL data models",
      "Authentication and payment flows",
    ],
    tools: "Node.js · PostgreSQL · Drizzle ORM",
    Icon: CodeIcon,
  },
  {
    name: "Linux & web servers",
    summary: "Server configuration, reliable web hosting, and practical backup and monitoring arrangements for your application.",
    deliverables: [
      "Linux server setup and hardening",
      "Nginx, Apache, or cPanel configuration",
      "SSL, backups, and uptime monitoring",
    ],
    tools: "Linux · Nginx · Apache · cPanel",
    Icon: DesktopIcon,
  },
  {
    name: "Networking",
    summary: "Network planning and configuration for communication between users, devices, and services, with clear addressing and access rules.",
    deliverables: [
      "Network design and configuration",
      "Firewall and VPN setup",
      "LAN/WAN, DNS, and IP troubleshooting",
    ],
    tools: "Firewalls · VPNs · DNS · IP addressing",
    Icon: Share1Icon,
  },
  {
    name: "IT infrastructure & deployment",
    summary: "Repeatable infrastructure and release paths that reduce manual work and make changes easier to review and recover.",
    deliverables: [
      "Cloud and infrastructure planning",
      "Docker and CI/CD workflows",
      "Release checks and operational documentation",
    ],
    tools: "Docker · Vercel · CI/CD",
    Icon: GearIcon,
  },
  {
    name: "Technical SEO & performance",
    summary: "Clearer page structure and faster experiences that help people find, understand, and use your site.",
    deliverables: [
      "SEO-ready page structure",
      "Performance profiling and optimisation",
      "Metadata and delivery review",
    ],
    tools: "Technical SEO · Web performance",
    Icon: MagnifyingGlassIcon,
  },
];

export default async function ServicesPage() {
  return (
    <div className="space-y-14 sm:space-y-20">
      <section className="engineering-hero service-reveal" aria-label="Services introduction">
        <div className="service-hero-grid">
          <header className="min-w-0">
            <p className="page-eyebrow mb-5">Independent software engineer · Kampala</p>
            <h2 className="mb-5 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              Services <span className="font-light text-muted-foreground">&amp; Expertise</span>
            </h2>
            <p className="max-w-[62ch] text-base leading-relaxed text-muted-foreground">
              I develop web applications, integrate backend systems, and configure the infrastructure they depend on. Each engagement is scoped around your business requirements, existing systems, and handover needs.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/get-started"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 motion-safe:active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Discuss your project
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
              >
                See selected work
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </header>
          <ServiceWorkflow />
        </div>
      </section>

      <section aria-labelledby="service-areas-heading" className="service-reveal">
        <div className="mb-6">
          <p className="page-eyebrow mb-2">01 · Focus areas</p>
          <h3 id="service-areas-heading" className="section-heading">What I can help with</h3>
        </div>
        <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICE_CHIPS.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground transition-[background-color,border-color] duration-200 hover:border-primary/40 hover:bg-card"
            >
              <span className="text-primary">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="work-heading" className="services-detail-section service-reveal">
        <div className="mb-8 max-w-[62ch]">
          <p className="page-eyebrow mb-2">02 · Services</p>
          <h3 id="work-heading" className="section-heading">Practical support for the whole stack</h3>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Choose a focused workstream or combine areas when the product, application, and infrastructure need to move together.
          </p>
        </div>

        <ul className="service-details-grid">
          {SERVICE_AREAS.map(({ name, summary, deliverables, tools, Icon }, index) => (
            <li
              key={name}
              className="service-reveal group flex flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground transition-[transform,border-color,background-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary motion-reduce:hover:translate-y-0"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-border transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-mono text-xs font-medium tracking-[0.16em] text-muted-foreground">0{index + 1}</span>
              </div>

              <h4 className="text-xl font-semibold tracking-tight">{name}</h4>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{summary}</p>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Deliverables</p>
              <ul className="mt-3 space-y-2">
                {deliverables.map((deliverable) => (
                  <li key={deliverable} className="flex items-start gap-2.5 text-base leading-relaxed text-card-foreground">
                    <CheckCircledIcon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{deliverable}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-card-foreground">Relevant tools:</span> {tools}
              </p>

              <Link
                href="/get-started"
                className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-lg text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
              >
                Discuss this area
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="process-heading" className="service-reveal">
        <div className="mb-6 max-w-[62ch]">
          <p className="page-eyebrow mb-2">03 · Working together</p>
          <h3 id="process-heading" className="section-heading">A clear path from need to handover</h3>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Every engagement starts with context and ends with a result you can understand, use, and maintain.
          </p>
        </div>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4">
          {PROCESS_STEPS.map((step) => (
            <li key={step.number} className="service-reveal rounded-2xl border border-border bg-card p-5 text-card-foreground transition-[transform,border-color,background-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary motion-reduce:hover:translate-y-0">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-border">
                  {step.icon}
                </span>
                <span className="font-mono text-xs font-medium tracking-[0.16em] text-muted-foreground">{step.number}</span>
              </div>
              <h4 className="text-lg font-semibold tracking-tight">{step.title}</h4>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="support-heading" className="service-reveal">
        <div className="mb-8 max-w-[62ch]">
          <p className="page-eyebrow mb-2">04 · Ongoing support</p>
          <h3 id="support-heading" className="section-heading">Ongoing maintenance & technical support</h3>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Support arrangements are scoped around your application, infrastructure, release schedule, and response requirements.
          </p>
        </div>

        <MaintenanceCards />
      </section>
    </div>
  );
}

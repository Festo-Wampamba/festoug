import { ArrowRightIcon, ArrowTopRightIcon } from "@radix-ui/react-icons";
import { ServiceCard } from "@/components/marketing/service-card";
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { ClientLogos } from "@/components/marketing/client-logos";
import { EngineeringIllustration } from "@/components/marketing/engineering-illustration";
import Link from "next/link";
import { getActiveServices, getActiveTestimonials, getFeaturedProjects } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [servicesData, testimonials, selectedProjects] = await Promise.all([
    getActiveServices(),
    getActiveTestimonials(),
    getFeaturedProjects(4),
  ]);
  const projects = selectedProjects.map(p => ({ id: p.id, title: p.title, slug: p.slug, category: p.category, image: p.image || "images/project-1.jpg", liveUrl: p.liveUrl }));

  return (
    <div className="space-y-12 sm:space-y-16">
      <section aria-labelledby="portfolio-intro" className="engineering-hero border-b border-border pb-10 sm:pb-12">
        <div className="engineering-hero-grid">
        <div className="min-w-0">
        <p className="page-eyebrow mb-5">Independent software engineer · Kampala</p>
        <h1 id="portfolio-intro" className="portfolio-headline max-w-[20ch] text-[2rem] font-semibold leading-[1.12] tracking-[-.045em] text-foreground sm:text-4xl 2xl:text-5xl">Software built around your business.</h1>
        <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">I’m Festo. I build web applications, backend systems, and the infrastructure that keeps them running. Clear thinking, practical solutions, and care in the details.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-5">
          <Link href="/get-started" className="inline-flex min-h-12 items-center justify-center gap-5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 active:scale-[.98] motion-reduce:active:scale-100">Discuss a project<ArrowTopRightIcon className="size-[18px]" aria-hidden /></Link>
          <Link href="/portfolio" className="inline-flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-primary underline-offset-4 hover:underline">Explore my work<ArrowRightIcon className="size-[18px]" aria-hidden /></Link>
        </div>
        <ul aria-label="Areas of expertise" className="mt-8 flex flex-wrap gap-2">{["Web applications", "Backend systems", "Infrastructure"].map(item => <li key={item} className="rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground">{item}</li>)}</ul>
        </div>
        <EngineeringIllustration />
        </div>
      </section>

      {projects.length > 0 && <section aria-labelledby="selected-work-heading"><div className="mb-6 flex flex-wrap items-baseline justify-between gap-3"><h2 id="selected-work-heading" className="section-heading">Selected work</h2><Link href="/portfolio" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline">All projects<ArrowRightIcon aria-hidden /></Link></div><PortfolioGrid projects={projects} hideCategoryFilter /></section>}

      {servicesData.length > 0 && <section aria-labelledby="services-heading"><div className="mb-6"><h2 id="services-heading" className="section-heading">How I can help</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">From the application your customers use to the systems behind it.</p></div><ul className="grid grid-cols-1 gap-4 md:grid-cols-2">{servicesData.map((service, index) => <li key={service.id}><ServiceCard title={service.title} icon={service.icon} description={service.description} index={index} /></li>)}</ul></section>}

      {testimonials.length > 0 && <section aria-labelledby="testimonials-heading"><h2 id="testimonials-heading" className="section-heading mb-4">Working together</h2><TestimonialCarousel testimonials={testimonials} /></section>}

      <section aria-labelledby="clients-heading"><h2 id="clients-heading" className="section-heading mb-6">Clients & collaborators</h2><ClientLogos /></section>

      <section className="rounded-xl bg-secondary p-6 text-secondary-foreground sm:p-8"><h2 className="text-xl font-semibold tracking-tight">Have a project in mind?</h2><p className="mt-2 max-w-[50ch] text-sm leading-relaxed">Tell me what you need to build, improve, or get working.</p><Link href="/contact" className="mt-4 inline-flex min-h-11 items-center gap-3 text-sm font-semibold underline underline-offset-4">Let’s talk<ArrowTopRightIcon aria-hidden /></Link></section>
    </div>
  );
}

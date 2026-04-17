import { ServiceCard } from "@/components/marketing/service-card";
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { ClientLogos } from "@/components/marketing/client-logos";
import Image from "next/image";
import Link from "next/link";
import { withRetry } from "@/lib/db";
import { services, testimonials as testimonialsTable, projects as projectsTable } from "@/lib/db/schema";
import { eq, asc, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  // Fetch services and testimonials from the database with retry
  const [servicesData, testimonials, featuredProjects] = await Promise.all([
    withRetry((db) =>
      db.query.services.findMany({
        where: eq(services.isActive, true),
        orderBy: [asc(services.sortOrder)],
      })
    ),
    withRetry((db) =>
      db.query.testimonials.findMany({
        where: eq(testimonialsTable.isActive, true),
        orderBy: [asc(testimonialsTable.sortOrder)],
      })
    ),
    withRetry((db) =>
      db
        .select()
        .from(projectsTable)
        .where(and(eq(projectsTable.isActive, true), eq(projectsTable.isFeatured, true)))
        .orderBy(asc(projectsTable.sortOrder))
        .limit(6)
    ),
  ]);

  const projects = featuredProjects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    image: p.image || "images/project-1.jpg",
  }));

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 relative pb-[15px]">
        <h2 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          About Me
        </h2>
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-gradient-to-r from-orange-yellow-crayola to-orange-400 rounded-[3px]" />
      </header>

      <section className="text-light-gray text-[15px] font-light leading-[1.6] space-y-4 mb-10">
        <p>
          I am a self-motivated and resourceful software developer with a proven
          ability to devise reliable solutions for complex software issues. With
          extensive experience in software development, Festo brings a deep
          understanding of technology along with a commitment to applying
          innovative software practices to enhance operational efficiency.
        </p>
        <p>
          My expertise encompasses a broad range of programming languages and
          development tools, enabling the delivery of exceptional results in
          diverse software projects. I have experience working with a variety of
          programming languages and frameworks, including JavaScript, React,
          Node.js, and Python.
        </p>
      </section>

      {/* Services */}
      <section className="mb-10">
        <h3 className="text-white-2 text-2xl font-semibold capitalize mb-6">
          What I'm Doing
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {servicesData.map((service, index) => (
            <li key={index}>
              <ServiceCard
                title={service.title}
                icon={service.icon}
                description={service.description}
                index={index}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white-2 text-2xl font-semibold capitalize">
              Featured Work
            </h3>
            <Link
              href="/portfolio"
              className="text-orange-yellow-crayola text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <PortfolioGrid projects={projects} hideCategoryFilter />
        </section>
      )}

      {/* Testimonials */}
      <section className="mb-10">
        <h3 className="text-white-2 text-2xl font-semibold capitalize mb-6">
          Testimonials
        </h3>
        <TestimonialCarousel testimonials={testimonials} />
      </section>

      {/* Clients */}
      <section className="mb-4">
        <h3 className="text-white-2 text-2xl font-semibold capitalize mb-6">
          Clients
        </h3>
        <ClientLogos />
      </section>
    </div>
  );
}

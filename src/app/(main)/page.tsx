import { ServiceCard } from "@/components/marketing/service-card";
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel";
import Image from "next/image";
import { withRetry } from "@/lib/db";
import { services, testimonials as testimonialsTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  // Fetch services and testimonials from the database with retry
  const [servicesData, testimonials] = await Promise.all([
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
  ]);

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
              />
            </li>
          ))}
        </ul>
      </section>

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
        <div className="overflow-hidden relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-eerie-black-2 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-eerie-black-2 to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee" style={{ width: "max-content" }}>
            {/* First set */}
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={`a-${num}`} className="mx-8 flex items-center shrink-0">
                <Image
                  src={`/images/logo-${num}-color.png`}
                  alt={`Client ${num}`}
                  width={120}
                  height={40}
                  className="filter grayscale opacity-50 hover:filter-none hover:opacity-100 transition-all duration-300 object-contain"
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={`b-${num}`} className="mx-8 flex items-center shrink-0" aria-hidden="true">
                <Image
                  src={`/images/logo-${num}-color.png`}
                  alt=""
                  width={120}
                  height={40}
                  className="filter grayscale opacity-50 hover:filter-none hover:opacity-100 transition-all duration-300 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

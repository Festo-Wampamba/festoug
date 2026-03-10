import { ServiceCard } from "@/components/marketing/service-card";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import Image from "next/image";
import fs from "fs";
import path from "path";

// Will be replaced by DB Queries in Phase 2
const servicesData = [
  {
    title: "Software Development",
    icon: "/images/icon-dev.svg",
    description: "Leveraging Python, Java, C++, JavaScript and PHP to deliver high quality software solutions.",
  },
  {
    title: "Data Modeling",
    icon: "/images/icon-dm.svg",
    description: "Expertise in database programming and management using industry leading tools and practices.",
  },
  {
    title: "Web Designing",
    icon: "/images/icon-design.svg",
    description: "Creating responsive and user-friendly web interfaces with Javascript, Tailwind CSS, React and NextJS.",
  },
  {
    title: "Database Management",
    icon: "/images/icon-db.svg",
    description: "Skilled in managing and optimizing databases for performance and reliability.",
  },
];

export default async function AboutPage() {
  // Read local JSON file for now, prior to Phase 2 DB migration
  const testimonialsPath = path.join(process.cwd(), "public", "testimonials.json");
  const testimonials = JSON.parse(fs.readFileSync(testimonialsPath, "utf-8"));

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
        <ul className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar px-4 -mx-4">
          {testimonials.map((testimonial: any, index: number) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              avatar={testimonial.avatar}
              testimonial={testimonial.testimonial}
            />
          ))}
        </ul>
      </section>

      {/* Clients */}
      <section className="mb-4">
        <h3 className="text-white-2 text-2xl font-semibold capitalize mb-6">
          Clients
        </h3>
        <ul className="flex justify-start items-center gap-[15px] overflow-x-auto pb-6 snap-x snap-mandatory px-4 -mx-4 hide-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <li key={num} className="min-w-[50%] sm:min-w-[25%] snap-start transition-transform duration-300 hover:scale-110 cursor-pointer">
              <Image
                src={`/images/logo-${num}-color.png`}
                alt="client logo"
                width={150}
                height={50}
                className="w-full filter grayscale opacity-50 transition-all duration-300 hover:filter-none hover:opacity-100 object-contain"
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

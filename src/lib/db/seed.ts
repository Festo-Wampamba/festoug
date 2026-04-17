/**
 * Seed: Migrate all legacy JSON data into PostgreSQL via Drizzle ORM.
 *
 * Run with:  pnpm db:seed
 */

// Must be first — loads DATABASE_URL from .env.local before any DB import
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";

import {
  blogPosts,
  projects,
  testimonials,
  services,
} from "./schema";
import { createSlug } from "../utils";

// ── Raw JSON data (replaces public/*.json files) ─────────────────────────────
const rawBlogs = [
  { title: "Top Tech Conferences in 2024", category: "Technology", date: "May 27, 2024", image: "/images/blog-2.jpg", description: "Discover the most influential tech conferences of 2024 that are set to shape the future of technology and innovation.", link: "https://search.brave.com/search?q=top+tech+conferences+2024" },
  { title: "Tech Digest #100: Latest Innovations", category: "Technology", date: "May 27, 2024", image: "/images/blog-3.jpg", description: "Stay updated with the 100th edition of Tech Digest, featuring the latest innovations and breakthroughs in technology.", link: "https://www.techdigest.tv/" },
  { title: "Weekly UI Interactions: Trends and Tips", category: "Design", date: "May 27, 2024", image: "/images/blog-4.jpg", description: "Explore the latest trends in UI interactions with practical tips to enhance user experience on your digital platforms.", link: "https://solguruz.com/blog/ui-ux-design-trends/" },
  { title: "The Art of Digital Workspace Organization", category: "Business", date: "May 27, 2024", image: "/images/blog-5.jpg", description: "Master the art of organizing your digital workspace for maximum productivity and efficiency.", link: "https://thepostworkspaces.com/digital-organization-tips/" },
  { title: "Tech Digest #99: Emerging Trends", category: "Technology", date: "May 27, 2024", image: "/images/blog-9.jpg", description: "Dive into the 99th edition of Tech Digest, focusing on emerging trends that are set to transform the tech industry.", link: "https://scholar.google.com/scholar?q=Tech+Digest" },
  { title: "Elon Musk's Vision for the Future", category: "Technology", date: "May 27, 2024", image: "/images/blog-7.jpg", description: "Explore Elon Musk's ambitious plans for the future, including advancements in space travel, electric vehicles, and more.", link: "https://qz.com/elon-musk-ai-future-1851497548" },
  { title: "Tony Stark: Fiction Meets Reality in Tech", category: "Technology", date: "May 27, 2024", image: "/images/blog-1.jpg", description: "How the fictional character Tony Stark has inspired real-world technological advancements and innovation.", link: "https://www.mic.com/articles/119848/meet-the-real-life-tony-stark" },
  { title: "The Future of AI: Trends and Predictions", category: "Technology", date: "May 27, 2024", image: "/images/blog-6.jpg", description: "A deep dive into the future of artificial intelligence, exploring current trends and future predictions.", link: "https://www.entrepreneur.com/science-technology/8-ai-trends-and-predictions-for-the-next-decade/455115" },
  { title: "Quantum Computing: The Next Tech Revolution", category: "Technology", date: "May 27, 2024", image: "/images/blog-8.jpg", description: "Understanding the basics of quantum computing and its potential to revolutionize technology.", link: "https://www.ibm.com/topics/quantum-computing" },
];

const rawProjects = [
  { id: 1, title: "Festotech", category: "Web development", image: "images/project-1.jpg" },
  { id: 2, title: "U-learn", category: "Software development", image: "images/project-2.jpg" },
  { id: 3, title: "E-commerce", category: "Applications", image: "images/project-3.jpg" },
  { id: 4, title: "Nextevent ug", category: "Web development", image: "images/project-4.jpg" },
  { id: 5, title: "LMS", category: "Software development", image: "images/project-5.jpg" },
  { id: 6, title: "Form builder", category: "Web development", image: "images/project-6.jpg" },
  { id: 7, title: "Mentorship platform", category: "Software development", image: "images/project-7.jpg" },
  { id: 8, title: "Task Manager", category: "Applications", image: "images/project-8.jpg" },
  { id: 9, title: "Parking system", category: "Web development", image: "images/project-9.jpg" },
];

const rawTestimonials = [
  { name: "Danie T", avatar: "/images/avatar-1.png", role: "CTO, TechVentures", rating: 5, testimonial: "Festo was hired to develop our software solution. We were extremely impressed with his expertise in Python and JavaScript, delivering a top-notch product that exceeded our expectations." },
  { name: "Bakeine Grace", avatar: "/images/avatar-2.png", role: "Data Lead, AnalyticsCo", rating: 4, testimonial: "Festo provided exceptional data modeling services for our project. His proficiency in database programming ensured our data structures were optimized and efficient." },
  { name: "Jenny Eden", avatar: "/images/avatar-3.png", role: "Product Manager, WebFlow", rating: 5, testimonial: "Festo was hired to design our website. His skills with React and NextJS resulted in a highly responsive and user-friendly interface that our users love." },
  { name: "Edrine K", avatar: "/images/avatar-4.png", role: "Ops Director, DataSafe", rating: 4, testimonial: "Festo managed our database with great expertise. His attention to detail and knowledge in database management significantly improved our system's performance and reliability." },
];

const rawServices = [
  { title: "Full-Stack Web Development", icon: "/images/icon-dev.svg", description: "Building modern websites and web applications using Next.js, React, TypeScript, and PostgreSQL from front to back." },
  { title: "Server Administration", icon: "/images/icon-dm.svg", description: "Setting up, securing, and managing Linux servers, Nginx and Apache web servers, and cloud infrastructure for production workloads." },
  { title: "Network Engineering", icon: "/images/icon-design.svg", description: "Designing and configuring enterprise networks including firewalls, VPN setup, DNS management, and LAN/WAN connectivity." },
  { title: "IT Infrastructure", icon: "/images/icon-db.svg", description: "Planning and maintaining scalable IT systems with automated backups, uptime monitoring, CI/CD pipelines, and SSL certificate management." },
];

// ── Seed runner ───────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱  Seeding database…");

  // Services
  console.log("  → Services");
  await db
    .insert(services)
    .values(
      rawServices.map((s, i) => ({
        title: s.title,
        icon: s.icon,
        description: s.description,
        sortOrder: i,
      }))
    )
    .onConflictDoNothing();

  // Testimonials
  console.log("  → Testimonials");
  await db
    .insert(testimonials)
    .values(
      rawTestimonials.map((t, i) => ({
        name: t.name,
        avatar: t.avatar,
        role: t.role,
        rating: t.rating,
        testimonial: t.testimonial,
        sortOrder: i,
      }))
    )
    .onConflictDoNothing();

  // Blog posts (imported as external-link posts, not published natively)
  console.log("  → Blog posts");
  await db
    .insert(blogPosts)
    .values(
      rawBlogs.map((b) => ({
        title: b.title,
        slug: createSlug(b.title),
        excerpt: b.description,
        coverImage: b.image,
        category: b.category,
        externalLink: b.link,
        isPublished: true,
        publishedAt: new Date(b.date),
      }))
    )
    .onConflictDoNothing();

  // Projects
  console.log("  → Projects");
  await db
    .insert(projects)
    .values(
      rawProjects.map((p, i) => ({
        title: p.title,
        slug: createSlug(p.title),
        category: p.category,
        image: p.image,
        sortOrder: i,
      }))
    )
    .onConflictDoNothing();

  console.log("✅  Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

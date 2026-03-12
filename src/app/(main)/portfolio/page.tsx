import { withRetry } from "@/lib/db";
import { projects as projectsTable } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio",
  description: "Explore projects built by Festo Wampamba — web apps, data solutions, and more.",
};

export default async function PortfolioPage() {
  const dbProjects = await withRetry((db) =>
    db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.isActive, true))
      .orderBy(asc(projectsTable.sortOrder))
  );

  const projects = dbProjects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    image: p.image || "images/project-1.jpg",
  }));

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-4 relative pb-[15px]">
        <h2 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          Portfolio
        </h2>
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-gradient-to-r from-orange-yellow-crayola to-orange-400 rounded-[3px]" />
      </header>

      <PortfolioGrid projects={projects} />
    </div>
  );
}

import { withRetry } from "@/lib/db";
import { projects as projectsTable } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { GithubRepos } from "@/components/marketing/github-repos";
import { getGitHubRepos } from "@/lib/github";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio",
  description: "Explore projects built by Festo Wampamba — web apps, data solutions, and more.",
};

export default async function PortfolioPage() {
  const [dbProjects, repos] = await Promise.all([
    withRetry((db) =>
      db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.isActive, true))
        .orderBy(asc(projectsTable.sortOrder))
    ),
    getGitHubRepos(6),
  ]);

  const projects = dbProjects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    image: p.image || "images/project-1.jpg",
    liveUrl: p.liveUrl,
  }));

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-4 relative pb-[15px]">
        <h2 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          Portfolio
        </h2>
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-primary rounded-[3px]" />
      </header>

      <PortfolioGrid projects={projects} />

      {repos.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white-2 text-2xl font-semibold capitalize">
              Open Source on GitHub
            </h3>
            <a
              href="https://github.com/Festo-Wampamba"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-yellow-crayola text-sm font-medium hover:underline underline-offset-4"
            >
              View GitHub
            </a>
          </div>
          <GithubRepos repos={repos} />
        </section>
      )}
    </div>
  );
}

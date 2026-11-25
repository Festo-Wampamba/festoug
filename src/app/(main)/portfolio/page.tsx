import { getActiveProjects } from "@/lib/content";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { GithubRepos } from "@/components/marketing/github-repos";
import { getGitHubRepos } from "@/lib/github";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Work",
  description: "Explore projects built by Festo Wampamba — web apps, data solutions, and more.",
};

export default async function PortfolioPage() {
  const [dbProjects, repos] = await Promise.all([
    getActiveProjects(),
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
    <div>
      <header className="mb-4 relative pb-[15px]">
        <h1 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          Work
        </h1>
        <div className="absolute bottom-0 left-0 w-10 h-1 bg-gold rounded-full" />
      </header>
      <p className="mb-6 max-w-[60ch] text-muted-foreground">Websites, applications and systems I have designed and built, for clients and for my own products.</p>

      <h2 className="sr-only">Projects</h2>
      <PortfolioGrid projects={projects} />

      {repos.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white-2 text-2xl font-semibold capitalize">
              Open Source on GitHub
            </h2>
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

import { ExternalLinkIcon, StarFilledIcon } from "@radix-ui/react-icons";
import type { GitHubRepo } from "@/lib/github";

// GitHub's conventional language colors — categorical data, not UI accents
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#663399",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
};

function formatPushedAt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function GithubRepos({ repos }: { repos: GitHubRepo[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-5">
      {repos.map((repo, index) => (
        <li
          key={repo.id}
          style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
        >
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm motion-reduce:hover:translate-y-0"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="break-all font-head text-base font-bold leading-snug text-card-foreground transition-colors group-hover:text-primary">
                {repo.name}
              </h4>
              <ExternalLinkIcon
                className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-[color,opacity] group-hover:text-primary group-hover:opacity-100"
                aria-hidden
              />
            </div>

            <p className="mb-4 line-clamp-2 flex-1 text-sm font-light leading-relaxed text-muted-foreground">
              {repo.description || "No description provided."}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
              {repo.language && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-border"
                    style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || "#8b8b8b" }}
                    aria-hidden
                  />
                  {repo.language}
                </span>
              )}
              {repo.stargazers_count > 0 && (
                <span className="inline-flex items-center gap-1">
                  <StarFilledIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {repo.stargazers_count}
                </span>
              )}
              <span className="ml-auto">Updated {formatPushedAt(repo.pushed_at)}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

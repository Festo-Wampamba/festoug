import { unstable_cache } from "next/cache";

const GITHUB_USER = "Festo-Wampamba";

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

async function fetchRepos(limit: number): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=100`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) {
      console.error(`GitHub repos fetch failed: ${res.status}`);
      return [];
    }
    const repos: GitHubRepo[] = await res.json();
    return repos
      .filter((r) => !r.fork && !r.archived)
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          +new Date(b.pushed_at) - +new Date(a.pushed_at)
      )
      .slice(0, limit);
  } catch (error) {
    // The section is optional on the page; a GitHub outage must not break Portfolio
    console.error("GitHub repos fetch failed:", error);
    return [];
  }
}

// unstable_cache (not fetch revalidate) because the portfolio page is
// force-dynamic, which overrides per-fetch cache options; this keeps us
// far under GitHub's unauthenticated 60 req/hr rate limit
export const getGitHubRepos = unstable_cache(fetchRepos, ["github-repos"], {
  revalidate: 3600,
});

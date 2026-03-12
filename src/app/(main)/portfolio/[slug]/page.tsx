import { withRetry } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Github, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await withRetry((db) =>
    db.query.projects.findFirst({ where: eq(projects.slug, slug) })
  );
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | Portfolio`,
    description: project.description?.slice(0, 160) || `${project.title} — ${project.category}`,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await withRetry((db) =>
    db.query.projects.findFirst({ where: eq(projects.slug, slug) })
  );

  if (!project || !project.isActive) notFound();

  return (
    <div className="animate-in fade-in duration-500">
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Portfolio
      </Link>

      {/* Hero image */}
      {project.image && (
        <div className="relative rounded-2xl overflow-hidden mb-8 border border-jet shadow-1">
          <Image
            src={`/${project.image}`}
            alt={project.title}
            width={1200}
            height={675}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-white-2 text-2xl md:text-3xl font-bold capitalize">
              {project.title}
            </h1>
            {project.isFeatured && (
              <span className="flex items-center gap-1 bg-orange-yellow-crayola/10 text-orange-yellow-crayola text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-yellow-crayola/20">
                <Star className="w-3 h-3 fill-orange-yellow-crayola" /> Featured
              </span>
            )}
          </div>
          <span className="bg-jet/60 text-light-gray text-sm font-medium px-3 py-1 rounded-full">
            {project.category}
          </span>
        </div>

        {/* Action links */}
        <div className="flex items-center gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-orange-yellow-crayola text-smoky-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-yellow-crayola/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Live Demo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-jet text-light-gray px-4 py-2.5 rounded-xl text-sm font-semibold hover:text-white-2 transition-colors border border-jet"
            >
              <Github className="w-4 h-4" /> Source Code
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6 md:p-8">
          <h2 className="text-white-2 text-lg font-semibold mb-4">About This Project</h2>
          <div className="text-light-gray text-[15px] leading-relaxed whitespace-pre-line">
            {project.description}
          </div>
        </div>
      )}
    </div>
  );
}

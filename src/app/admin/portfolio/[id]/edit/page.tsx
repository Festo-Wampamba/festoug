import { withRetry } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PortfolioForm } from "@/components/admin/portfolio-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Admin | Edit Project" };

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await withRetry((db) =>
    db.query.projects.findFirst({
      where: eq(projects.id, id),
    })
  );

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Edit: {project.title}</h2>
      </div>
      <PortfolioForm
        project={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          category: project.category,
          image: project.image,
          description: project.description,
          liveUrl: project.liveUrl,
          repoUrl: project.repoUrl,
          isFeatured: project.isFeatured,
          sortOrder: project.sortOrder,
          isActive: project.isActive,
        }}
      />
    </div>
  );
}

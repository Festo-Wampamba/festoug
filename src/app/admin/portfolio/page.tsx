import { withRetry } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Pencil, ExternalLink, ChevronLeft, Star } from "lucide-react";

export const metadata = { title: "Admin | Portfolio" };

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const allProjects = await withRetry((db) =>
    db.select().from(projects).orderBy(asc(projects.sortOrder))
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h2 className="text-white-2 text-xl font-bold">Portfolio Projects</h2>
          <Link
            href="/admin/portfolio/new"
            className="flex items-center gap-2 bg-orange-yellow-crayola text-smoky-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-yellow-crayola/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Project
          </Link>
        </div>
      </div>

      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
        {allProjects.length === 0 ? (
          <p className="text-light-gray-70 text-sm p-8 text-center">
            No projects yet. Click &quot;Add Project&quot; to create your first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-jet text-light-gray-70 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Featured</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-jet/50 hover:bg-jet/20 transition-colors group relative"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white-2 font-medium">
                          <Link
                            href={`/admin/portfolio/${project.id}/edit`}
                            className="before:absolute before:inset-0"
                          >
                            {project.title}
                          </Link>
                        </p>
                        <p className="text-light-gray-70 text-xs">{project.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-jet/60 text-light-gray text-xs font-medium px-2.5 py-1 rounded-full">
                        {project.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-light-gray-70">{project.sortOrder}</td>
                    <td className="px-6 py-4">
                      {project.isFeatured && (
                        <Star className="w-4 h-4 text-orange-yellow-crayola fill-orange-yellow-crayola" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`w-2.5 h-2.5 rounded-full inline-block ${
                          project.isActive ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative z-10">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-eerie-black-1 text-light-gray hover:text-orange-yellow-crayola transition-colors"
                            title="View Live"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          href={`/admin/portfolio/${project.id}/edit`}
                          className="p-2 rounded-lg hover:bg-eerie-black-1 text-light-gray hover:text-orange-yellow-crayola transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

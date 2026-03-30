"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, X } from "lucide-react";

function ProjectCard({ project }: { project: Project }) {
  return (
    <>
      <figure className="relative rounded-[16px] overflow-hidden mb-[15px] bg-bg-gradient-onyx shadow-1 group-hover:shadow-[0_0_0_1px_rgba(56,189,248,0.3)] transition-all">
        <div className="absolute inset-0 bg-transparent group-hover:bg-[rgba(0,0,0,0.5)] z-10 transition-colors duration-300 flex justify-center items-center">
          <div className="w-[45px] h-[45px] rounded-[12px] bg-jet text-orange-yellow-crayola flex justify-center items-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
            <Eye className="w-5 h-5" />
          </div>
        </div>
        <Image
          src={`/${project.image}`}
          alt={project.title}
          width={800}
          height={600}
          className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </figure>
      <h3 className="text-white-2 text-[15px] font-medium capitalize mb-[5px] group-hover:text-orange-yellow-crayola transition-colors">
        {project.title}
      </h3>
      <p className="text-light-gray font-light text-[14px]">{project.category}</p>
    </>
  );
}

interface Project {
  id: number | string;
  title: string;
  category: string;
  image: string;
  slug?: string;
}

interface PortfolioGridProps {
  projects: Project[];
  limit?: number;
  hideCategoryFilter?: boolean;
}

export function PortfolioGrid({ projects, limit, hideCategoryFilter }: PortfolioGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const triggerRef = useRef<HTMLLIElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  let filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  if (limit) {
    filteredProjects = filteredProjects.slice(0, limit);
  }

  // Focus close button when modal opens
  useEffect(() => {
    if (selectedProject && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [selectedProject]);

  // Escape key closes modal; return focus to trigger
  useEffect(() => {
    if (!selectedProject) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectedProject]);

  const openLightbox = (project: Project, el: HTMLLIElement) => {
    triggerRef.current = el;
    setSelectedProject(project);
  };

  return (
    <>
      {!hideCategoryFilter && (
        <ul className="flex flex-wrap justify-start items-center gap-4 sm:gap-6 mb-8 mt-2">
          {categories.map((category) => (
            <li key={category}>
              <button
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`text-[15px] font-medium transition-colors duration-300 ${
                  selectedCategory === category
                    ? "text-orange-yellow-crayola"
                    : "text-light-gray hover:text-light-gray-70"
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[30px] mb-8">
        {filteredProjects.map((project) => (
          <li
            key={project.id}
            className={`group relative animate-in fade-in zoom-in-95 duration-500 ${!project.slug ? "cursor-pointer" : ""}`}
            onClick={
              project.slug
                ? undefined
                : (e) => openLightbox(project, e.currentTarget as HTMLLIElement)
            }
          >
            {project.slug ? (
              <Link href={`/portfolio/${project.slug}`} className="block">
                <ProjectCard project={project} />
              </Link>
            ) : (
              <ProjectCard project={project} />
            )}
          </li>
        ))}
      </ul>

      {/* Lightbox Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-[rgba(0,0,0,0.8)] p-4 animate-in fade-in duration-300"
          onClick={() => { setSelectedProject(null); triggerRef.current?.focus(); }}
          role="dialog"
          aria-modal="true"
          aria-label={selectedProject.title}
        >
          <div
            className="relative bg-eerie-black-2 p-4 rounded-[20px] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-jet shadow-2 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              className="absolute top-4 right-4 z-10 bg-jet text-white-2 p-2 rounded-lg hover:text-orange-yellow-crayola transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => { setSelectedProject(null); triggerRef.current?.focus(); }}
              aria-label="Close lightbox"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={`/${selectedProject.image}`}
              alt={selectedProject.title}
              width={1200}
              height={900}
              className="w-full h-auto rounded-[12px] object-cover mb-4"
            />
            <h3 className="text-white-2 text-2xl font-semibold capitalize mb-2">{selectedProject.title}</h3>
            <p className="text-light-gray">{selectedProject.category}</p>
          </div>
        </div>
      )}
    </>
  );
}

import fs from "fs";
import path from "path";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";

export default async function PortfolioPage() {
  const projectsPath = path.join(process.cwd(), "public", "projects.json");
  const projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));

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

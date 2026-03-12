import { PortfolioForm } from "@/components/admin/portfolio-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Admin | New Project" };

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Create New Project</h2>
      </div>
      <PortfolioForm />
    </div>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check server-side (proxy.ts already handles the redirect,
  // but this is the authoritative DAL-level guard)
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 xl:py-12 animate-in fade-in duration-500 min-h-screen">
      {/* Admin Banner */}
      <header className="mb-8 flex items-center gap-3">
        <div className="bg-orange-yellow-crayola/10 border border-orange-yellow-crayola/20 p-2.5 rounded-xl">
          <Shield className="w-6 h-6 text-orange-yellow-crayola" />
        </div>
        <div>
          <h1 className="text-white-2 text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-light-gray-70 text-xs">
            Welcome, {session.user.name} · {session.user.role}
          </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <AdminNav />

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

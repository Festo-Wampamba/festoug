import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Shield } from "lucide-react";
import { ToastProvider } from "@/components/ui/toast-provider";

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
    <ToastProvider>
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 xl:py-12 animate-in fade-in duration-500 min-h-screen">
        {/* Admin Banner */}
        <header className="mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <div className="bg-orange-yellow-crayola/10 border border-orange-yellow-crayola/20 p-2 sm:p-2.5 rounded-xl shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-orange-yellow-crayola" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white-2 text-lg sm:text-xl md:text-2xl font-bold truncate">Admin Dashboard</h1>
            <p className="text-light-gray-70 text-[10px] sm:text-xs truncate">
              Welcome, {session.user.name} · {session.user.role}
            </p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          <AdminNav />

          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

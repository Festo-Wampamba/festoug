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
      <div className="mx-auto min-h-dvh max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 xl:py-10">
        <header className="mb-6 flex items-center gap-3 sm:mb-8">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">Admin</h1>
            <p className="truncate text-sm text-muted-foreground">Signed in as {session.user.name}</p>
          </div>
        </header>

        <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          <AdminNav />

          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

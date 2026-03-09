import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Re-verify server-side alongside the optimistic check in proxy.ts
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-white-2 text-3xl font-semibold mb-2">
            Customer Dashboard
          </h2>
          <p className="text-light-gray">
            Manage your purchases, downloads, and personal profile.
          </p>
        </div>
        
        <div className="hidden sm:flex items-center gap-3 bg-eerie-black-1 px-4 py-2 rounded-xl border border-jet">
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || "User"} 
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-yellow-crayola text-smoky-black flex items-center justify-center font-bold text-lg">
              {session.user.name?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-white-2 font-medium text-sm">{session.user.name}</span>
            <span className="text-orange-yellow-crayola text-xs">{session.user.role}</span>
          </div>
        </div>
      </header>

      <DashboardNav />

      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  );
}

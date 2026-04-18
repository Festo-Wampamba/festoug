import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { withRetry } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { EmailVerifyBanner } from "@/components/dashboard/email-verify-banner";
import Link from "next/link";
import { UserCircle } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const user = session.user;

  // emailVerified is not in the JWT — must query DB
  const [dbUser] = await withRetry((db) =>
    db
      .select({ emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
  );

  const isEmailVerified = !!dbUser?.emailVerified;

  return (
    <div className="animate-in fade-in duration-500">
      {!isEmailVerified && <EmailVerifyBanner email={user.email ?? ""} />}

      {/* Dashboard Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 xl:pr-[360px]">
          <div>
            <p className="text-light-gray-70 text-sm mb-1 uppercase tracking-widest font-medium">Customer Portal</p>
            <h2 className="text-white-2 text-2xl md:text-3xl font-semibold">
              Welcome back, <span className="text-orange-yellow-crayola">{user.name?.split(" ")[0]}</span> 👋
            </h2>
            <p className="text-light-gray text-sm mt-1">
              Manage your purchases, downloads, and personal profile.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 bg-eerie-black-1 border border-jet rounded-2xl px-4 py-3 hover:border-orange-yellow-crayola/40 hover:shadow-[0_0_15px_rgba(255,181,63,0.1)] transition-all group shrink-0"
              title="View & edit your profile"
            >
              {user.image ? (
                <img src={user.image} alt={user.name || "User"} className="w-11 h-11 rounded-full border-2 border-orange-yellow-crayola/30 group-hover:border-orange-yellow-crayola/60 transition-colors" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-orange-yellow-crayola/10 text-orange-yellow-crayola border-2 border-orange-yellow-crayola/30 group-hover:border-orange-yellow-crayola/60 transition-colors flex items-center justify-center font-bold text-lg">
                  {user.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex flex-col leading-tight">
                <span className="text-white-2 font-medium text-sm">{user.name}</span>
                <span className="text-orange-yellow-crayola text-xs">{user.role} · Edit Profile</span>
              </div>
              <UserCircle className="w-4 h-4 text-light-gray-70 group-hover:text-orange-yellow-crayola transition-colors ml-1" />
            </Link>
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

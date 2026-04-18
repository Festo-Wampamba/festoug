import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Lock, AlertTriangle } from "lucide-react";
import { DeleteAccountButton } from "@/components/dashboard/delete-account-button";
import { SettingsNameForm } from "@/components/dashboard/settings-name-form";
import { SettingsAvatarSection } from "@/components/dashboard/settings-avatar-section";
import { SettingsPasswordForm } from "@/components/dashboard/settings-password-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await withRetry((db) =>
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    })
  );

  if (!user) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-3xl">
      <h3 className="text-2xl font-semibold text-white-2 mb-6">Profile Settings</h3>

      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 p-6 md:p-8 space-y-8">
        {/* Avatar */}
        <SettingsAvatarSection
          initialImage={user.image ?? null}
          initialName={user.name ?? ""}
        />

        {/* Name */}
        <SettingsNameForm initialName={user.name ?? ""} />

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-light-gray mb-2">
            Email Address
          </label>
          <input
            type="email"
            readOnly
            disabled
            value={user.email ?? ""}
            title="Email address (read-only)"
            placeholder="your@email.com"
            className="w-full bg-eerie-black-2 border border-jet text-light-gray-70 rounded-xl px-4 py-3 cursor-not-allowed opacity-70 max-w-md"
          />
          <p className="text-xs text-orange-yellow-crayola mt-2">
            Email changes must be verified. Contact support to change your email.
          </p>
        </div>

        {/* Password */}
        <div>
          <h4 className="text-white-2 font-medium flex items-center gap-2 mb-4 pb-2 border-b border-jet">
            <Lock className="w-4 h-4" /> Security
          </h4>
          <SettingsPasswordForm hasPassword={!!user.passwordHash} />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-eerie-black-1 border border-red-500/20 rounded-2xl shadow-1 p-6 md:p-8 mt-6">
        <h4 className="text-red-400 font-semibold flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h4>
        <p className="text-light-gray-70 text-sm mb-5">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}

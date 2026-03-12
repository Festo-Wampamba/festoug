import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UserCircle, Mail, Lock } from "lucide-react";

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

      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 p-6 md:p-8">
        <form className="space-y-8">
          
          {/* Avatar Area */}
          <div className="flex items-center gap-6 pb-6 border-b border-jet">
            <div className="w-20 h-20 rounded-full bg-jet flex justify-center items-center overflow-hidden border border-jet">
              {user.image ? (
                <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-orange-yellow-crayola">
                  {user.name?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div>
              <button 
                type="button"
                className="bg-jet text-white-2 px-4 py-2 rounded-xl font-medium text-sm hover:bg-orange-yellow-crayola hover:text-smoky-black transition-colors"
              >
                Change Avatar
              </button>
              <p className="text-light-gray-70 text-xs mt-2">JPG, GIF or PNG. 1MB max.</p>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-light-gray flex items-center gap-2 mb-2">
                <UserCircle className="w-4 h-4" /> Full Name
              </label>
              <input 
                type="text" 
                defaultValue={user.name || ""}
                className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
                placeholder="Festo Wampamba"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-gray flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input 
                type="email"
                readOnly
                disabled
                defaultValue={user.email || ""}
                className="w-full bg-eerie-black-2 border border-jet text-light-gray-70 rounded-xl px-4 py-3 cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-orange-yellow-crayola mt-2">Email changes must be verified.</p>
            </div>
          </div>

          {/* Password Reset */}
          <div>
            <h4 className="text-white-2 font-medium flex items-center gap-2 mb-4 pb-2 border-b border-jet">
              <Lock className="w-4 h-4" /> Security
            </h4>
            
            <div className="grid grid-cols-1 gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-light-gray mb-2">New Password</label>
                <input 
                  type="password" 
                  className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button 
              type="button"
              className="bg-orange-yellow-crayola text-smoky-black px-8 py-3 rounded-xl font-bold hover:bg-orange-yellow-crayola/90 transition-colors shadow-md"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

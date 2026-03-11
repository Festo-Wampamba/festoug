import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LicensesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userLicenses = await withRetry((db) =>
    db.query.licenses.findMany({
      where: eq(licenses.userId, session.user.id),
      with: { product: true, order: true },
      orderBy: [desc(licenses.createdAt)],
    })
  );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <h3 className="text-2xl font-semibold text-white-2 mb-6">License Keys</h3>

      {userLicenses.length === 0 ? (
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-10 text-center text-light-gray">
          <p className="text-lg">You do not have any active product licenses.</p>
        </div>
      ) : (
        <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-light-gray text-sm whitespace-nowrap">
              <thead className="bg-eerie-black-2/50 text-light-gray-70 border-b border-jet">
                <tr>
                  <th className="px-6 py-4 font-medium rounded-tl-xl">Product</th>
                  <th className="px-6 py-4 font-medium">License Key</th>
                  <th className="px-6 py-4 font-medium">Issued Date</th>
                  <th className="px-6 py-4 font-medium rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jet">
                {userLicenses.map((license) => (
                  <tr key={license.id} className="hover:bg-eerie-black-2 transition-colors">
                    <td className="px-6 py-4 font-medium text-white-2">
                      {license.product?.name || "Unknown Product"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <code className="bg-eerie-black-2 px-3 py-1.5 rounded-lg border border-jet text-orange-yellow-crayola font-mono">
                          {license.licenseKey}
                        </code>
                        <button 
                          className="text-light-gray-70 hover:text-orange-yellow-crayola transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(license.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {license.isActive ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="w-4 h-4" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertCircle className="w-4 h-4" /> Revoked/Expired
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { auth } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { orders, licenses, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ShoppingBag, KeyRound, MonitorSmartphone, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch stats concurrently with retry for Neon cold starts
  const [userOrders, userLicenses] = await Promise.all([
    withRetry((db) =>
      db.query.orders.findMany({
        where: eq(orders.userId, session.user.id),
        with: { product: true },
        limit: 5,
        orderBy: [desc(orders.createdAt)],
      })
    ),
    withRetry((db) =>
      db.query.licenses.findMany({
        where: eq(licenses.userId, session.user.id),
      })
    ),
  ]);

  const activeLicensesCount = userLicenses.filter(l => l.isActive).length;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Account Status Warning */}
      {session.user.accountStatus === "SUSPENDED" && (
        <div className="flex items-start gap-3 p-4 bg-orange-400/10 border border-orange-400/20 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-orange-400 font-semibold text-sm">Account Suspended</h4>
            <p className="text-orange-300/80 text-sm mt-1">
              Your account has been temporarily suspended. You can view your data but some actions may be restricted.
              If you believe this is an error, please contact <a href="mailto:festotechug@gmail.com" className="underline hover:text-orange-200">support</a>.
            </p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6 shadow-1 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-yellow-crayola/10 text-orange-yellow-crayola flex justify-center items-center shrink-0">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-light-gray-70 text-sm font-medium mb-1">Total Purchases</p>
            <h3 className="text-white-2 text-2xl font-bold">{userOrders.length}</h3>
          </div>
        </div>

        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6 shadow-1 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-yellow-crayola/10 text-orange-yellow-crayola flex justify-center items-center shrink-0">
            <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <p className="text-light-gray-70 text-sm font-medium mb-1">Active Licenses</p>
            <h3 className="text-white-2 text-2xl font-bold">{activeLicensesCount}</h3>
          </div>
        </div>

        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-6 shadow-1 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-yellow-crayola/10 text-orange-yellow-crayola flex justify-center items-center shrink-0">
            <MonitorSmartphone className="w-7 h-7" />
          </div>
          <div>
            <p className="text-light-gray-70 text-sm font-medium mb-1">Service Projects</p>
            <h3 className="text-white-2 text-2xl font-bold">0</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
        <div className="p-6 border-b border-jet flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white-2">Recent Purchases</h3>
          <Link href="/dashboard/purchases" className="text-orange-yellow-crayola text-sm hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {userOrders.length === 0 ? (
          <div className="p-8 text-center text-light-gray">
            <p className="mb-4">You haven't made any purchases yet.</p>
            <Link 
              href="/store"
              className="inline-flex items-center justify-center bg-jet text-orange-yellow-crayola px-6 py-2.5 rounded-xl font-medium hover:bg-jet/80 transition-colors"
            >
              Browse Digital Store
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-light-gray text-sm whitespace-nowrap">
              <thead className="bg-eerie-black-2/50 text-light-gray-70 border-b border-jet">
                <tr>
                  <th className="px-6 py-4 font-medium rounded-tl-xl">Product</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jet">
                {userOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-eerie-black-2 transition-colors">
                    <td className="px-6 py-4 font-medium text-white-2">{order.product?.name || "Unknown Product"}</td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-orange-yellow-crayola">${order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "COMPLETED" 
                          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                          : "bg-orange-400/10 text-orange-400 border border-orange-400/20"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

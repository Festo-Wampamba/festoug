import { db } from "@/lib/db";
import { orders, licenses } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Admin | Orders" };

export default async function AdminOrdersPage() {
  const allOrders = await db.query.orders.findMany({
    with: { user: true, product: true, licenses: true },
    orderBy: (o, { desc: d }) => [d(o.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Orders & Licenses</h2>
      </div>

      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
        {allOrders.length === 0 ? (
          <p className="text-light-gray-70 text-sm p-8 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-jet text-light-gray-70 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">License</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order) => (
                  <tr key={order.id} className="border-b border-jet/50 hover:bg-jet/20 transition-colors">
                    <td className="px-6 py-4 text-light-gray-70 text-xs font-mono">
                      {order.externalOrderId || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-white-2 font-medium">
                      {order.user?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4 text-light-gray">
                      {order.product?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-white-2 font-semibold">
                      ${order.amount} {order.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        order.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-400"
                          : order.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : order.status === "REFUNDED"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.licenses && order.licenses.length > 0 ? (
                        <span className="text-xs font-mono text-orange-yellow-crayola bg-orange-yellow-crayola/10 px-2 py-1 rounded-lg">
                          {order.licenses[0].licenseKey.slice(0, 12)}…
                        </span>
                      ) : (
                        <span className="text-light-gray-70 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-light-gray-70 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
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

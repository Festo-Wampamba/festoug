import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, Ban, CheckCircle2, ShieldAlert } from "lucide-react";
import { CustomerActions } from "@/components/admin/toggle-customer";

export const metadata = { title: "Admin | Customers" };

export default async function AdminCustomersPage() {
  const allCustomers = await db.query.users.findMany({
    where: eq(users.role, "CUSTOMER"),
    with: { orders: true },
    orderBy: [desc(users.createdAt)],
  });

  function statusBadge(status: string) {
    switch (status) {
      case "BANNED":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 w-fit">
            <Ban className="w-3.5 h-3.5" /> Permanently Banned
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" /> Suspended (Read-Only)
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Manage Customers</h2>
        <p className="text-light-gray-70 text-xs mt-1">
          Restore, temporarily suspend (read-only), or permanently ban users who violate terms.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-light-gray-70">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400" /> Active — Full access
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400" /> Suspended — Read-only, no editing
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Banned — No access, email blacklisted
        </div>
      </div>

      <div className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
        {allCustomers.length === 0 ? (
          <p className="text-light-gray-70 text-sm p-8 text-center">
            No customers found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-jet text-light-gray-70 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Orders</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={`border-b border-jet/50 hover:bg-jet/20 transition-colors ${
                      customer.accountStatus === "BANNED"
                        ? "opacity-50"
                        : customer.accountStatus === "SUSPENDED"
                        ? "opacity-75"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white-2 font-medium">
                        {customer.name || "Unknown"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-light-gray">
                      {customer.accountStatus === "BANNED" ? (
                        <span className="line-through text-red-400/60">{customer.email}</span>
                      ) : (
                        customer.email
                      )}
                    </td>
                    <td className="px-6 py-4 text-light-gray-70">
                      {customer.orders?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge(customer.accountStatus)}
                    </td>
                    <td className="px-6 py-4 text-light-gray-70 text-xs">
                      {new Date(customer.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                      <CustomerActions
                        customerId={customer.id}
                        accountStatus={customer.accountStatus}
                        customerName={customer.name || customer.email}
                      />
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

import { db } from "@/lib/db";
import { products, orders, licenses, users, blogPosts } from "@/lib/db/schema";
import { count, sum, eq } from "drizzle-orm";
import { Package, ShoppingBag, Key, Users, DollarSign, PenSquare } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard | Overview" };

export default async function AdminOverviewPage() {
  // Fetch aggregate stats in parallel
  const [
    [productCount],
    [orderCount],
    [licenseCount],
    [customerCount],
    [blogCount],
    [revenueResult],
  ] = await Promise.all([
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(licenses),
    db.select({ value: count() }).from(users).where(eq(users.role, "CUSTOMER")),
    db.select({ value: count() }).from(blogPosts),
    db.select({ value: sum(orders.amount) }).from(orders).where(eq(orders.status, "COMPLETED")),
  ]);

  const totalRevenue = parseFloat(revenueResult?.value || "0");

  const stats = [
    { label: "Total Revenue",  value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-400", href: "/admin/orders" },
    { label: "Products",       value: productCount.value,  icon: Package,     color: "text-orange-yellow-crayola", href: "/admin/products" },
    { label: "Orders",         value: orderCount.value,    icon: ShoppingBag, color: "text-blue-400", href: "/admin/orders" },
    { label: "Blog Posts",     value: blogCount.value,     icon: PenSquare,   color: "text-yellow-400", href: "/admin/blog" },
    { label: "Active Licenses",value: licenseCount.value, icon: Key,         color: "text-purple-400", href: "/admin/orders" },
    { label: "Customers",      value: customerCount.value, icon: Users,       color: "text-pink-400", href: "/admin/customers" },
  ];

  // Recent orders
  const recentOrders = await db.query.orders.findMany({
    with: { user: true, product: true },
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    limit: 8,
  });

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-eerie-black-1 border border-jet rounded-2xl p-5 shadow-1 transition-all hover:bg-jet/30 hover:shadow-2 hover:border-jet/80 block"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-light-gray-70 text-xs font-medium uppercase tracking-wider group-hover:text-light-gray transition-colors">
                {stat.label}
              </span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-white-2 text-2xl font-bold">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders Table */}
      <section className="bg-eerie-black-1 border border-jet rounded-2xl shadow-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-jet">
          <h3 className="text-white-2 font-semibold">Recent Orders</h3>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-light-gray-70 text-sm p-6 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-jet text-light-gray-70 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-jet/50 hover:bg-jet/20 transition-colors">
                    <td className="px-6 py-4 text-white-2 font-medium">
                      {order.user?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4 text-light-gray">
                      {order.product?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-white-2 font-semibold">
                      ${order.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        order.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-400"
                          : order.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {order.status}
                      </span>
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
      </section>
    </div>
  );
}

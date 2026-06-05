import { withRetry } from "@/lib/db";
import { products, orders, licenses, users, blogPosts, reviews } from "@/lib/db/schema";
import { count, sum, eq } from "drizzle-orm";
import { Package, ShoppingBag, Key, Users, DollarSign, PenSquare, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin Dashboard | Overview" };

export default async function AdminOverviewPage() {
  // Fetch aggregate stats in parallel with retry for Neon cold starts
  const [
    [productCount],
    [orderCount],
    [licenseCount],
    [customerCount],
    [blogCount],
    [pendingReviewCount],
    [revenueResult],
  ] = await Promise.all([
    withRetry((db) => db.select({ value: count() }).from(products)),
    withRetry((db) => db.select({ value: count() }).from(orders)),
    withRetry((db) => db.select({ value: count() }).from(licenses)),
    withRetry((db) => db.select({ value: count() }).from(users).where(eq(users.role, "CUSTOMER"))),
    withRetry((db) => db.select({ value: count() }).from(blogPosts)),
    withRetry((db) => db.select({ value: count() }).from(reviews).where(eq(reviews.status, "PENDING"))),
    withRetry((db) => db.select({ value: sum(orders.amount) }).from(orders).where(eq(orders.status, "COMPLETED"))),
  ]);

  const totalRevenue = parseFloat(revenueResult?.value || "0");

  // Flowstep violetDark accent sets — purple / green / violet / amber rotation
  const A = {
    purple: { text: "text-orange-yellow-crayola", bg: "bg-orange-yellow-crayola/12", ring: "ring-orange-yellow-crayola/25", hover: "hover:border-orange-yellow-crayola/40 hover:shadow-[0_10px_40px_-8px_rgba(127,34,254,0.30)]" },
    green:  { text: "text-accent-2", bg: "bg-accent-2/12", ring: "ring-accent-2/25", hover: "hover:border-accent-2/40 hover:shadow-[0_10px_40px_-8px_rgba(16,185,129,0.28)]" },
    violet: { text: "text-accent-3", bg: "bg-accent-3/12", ring: "ring-accent-3/25", hover: "hover:border-accent-3/40 hover:shadow-[0_10px_40px_-8px_rgba(168,85,247,0.28)]" },
    amber:  { text: "text-accent-4", bg: "bg-accent-4/12", ring: "ring-accent-4/25", hover: "hover:border-accent-4/40 hover:shadow-[0_10px_40px_-8px_rgba(245,158,11,0.28)]" },
  };

  const stats = [
    { label: "Total Revenue",   value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, accent: A.green,  href: "/admin/orders" },
    { label: "Products",        value: productCount.value,       icon: Package,     accent: A.purple, href: "/admin/products" },
    { label: "Orders",          value: orderCount.value,         icon: ShoppingBag, accent: A.violet, href: "/admin/orders" },
    { label: "Blog Posts",      value: blogCount.value,          icon: PenSquare,   accent: A.amber,  href: "/admin/blog" },
    { label: "Active Licenses", value: licenseCount.value,       icon: Key,         accent: A.purple, href: "/admin/orders" },
    { label: "Pending Reviews", value: pendingReviewCount.value, icon: Star,        accent: A.amber,  href: "/admin/reviews" },
    { label: "Customers",       value: customerCount.value,      icon: Users,       accent: A.violet, href: "/admin/customers" },
  ];

  // Recent orders
  const recentOrders = await withRetry((db) =>
    db.query.orders.findMany({
      with: { user: true, product: true },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: 8,
    })
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page heading */}
      <div>
        <h2 className="text-white-2 text-2xl sm:text-3xl font-bold font-head tracking-tight">Overview</h2>
        <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-orange-yellow-crayola to-accent-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group relative overflow-hidden block bg-eerie-black-1 border border-jet rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-1
              transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
              hover:-translate-y-1 motion-reduce:hover:translate-y-0 ${stat.accent.hover}`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-light-gray-70 text-[10px] sm:text-xs font-medium uppercase tracking-wider group-hover:text-light-gray transition-colors">
                {stat.label}
              </span>
              <span className={`grid place-items-center w-9 h-9 rounded-xl shrink-0 icon-pop ring-1 ${stat.accent.bg} ${stat.accent.ring} ${stat.accent.text}
                transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0`}>
                <stat.icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
              </span>
            </div>
            <p className="text-white-2 text-xl sm:text-2xl font-bold font-head tracking-tight truncate">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders Table */}
      <section className="bg-eerie-black-1 border border-jet rounded-xl sm:rounded-2xl shadow-1 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-jet flex items-center gap-3">
          <div className="h-5 w-1 rounded-full bg-gradient-to-b from-orange-yellow-crayola to-accent-2" />
          <h3 className="text-white-2 text-sm sm:text-base font-semibold font-head">Recent Orders</h3>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-light-gray-70 text-xs sm:text-sm p-4 sm:p-6 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-jet text-light-gray-70 text-[10px] sm:text-xs uppercase tracking-wider">
                  <th className="px-3 sm:px-6 py-2 sm:py-3">Customer</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3">Product</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3">Amount</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-jet/50 hover:bg-jet/20 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-white-2 font-medium">
                      {order.user?.name || "Guest"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-light-gray">
                      {order.product?.name || "—"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-white-2 font-semibold">
                      ${order.amount}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                        order.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-400"
                          : order.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-light-gray-70 text-[10px] sm:text-xs">
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

import { withRetry } from "@/lib/db";
import { products, orders, licenses, users, blogPosts, reviews, projectInquiries } from "@/lib/db/schema";
import { count, sum, eq } from "drizzle-orm";
import { ArrowRight, CheckCircle2, ChevronDown, FileText, Inbox, Key, Package, ShoppingBag, Star, Users } from "lucide-react";
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
    [newInquiryCount],
  ] = await Promise.all([
    withRetry((db) => db.select({ value: count() }).from(products)),
    withRetry((db) => db.select({ value: count() }).from(orders)),
    withRetry((db) => db.select({ value: count() }).from(licenses)),
    withRetry((db) => db.select({ value: count() }).from(users).where(eq(users.role, "CUSTOMER"))),
    withRetry((db) => db.select({ value: count() }).from(blogPosts)),
    withRetry((db) => db.select({ value: count() }).from(reviews).where(eq(reviews.status, "PENDING"))),
    withRetry((db) => db.select({ value: sum(orders.amount) }).from(orders).where(eq(orders.status, "COMPLETED"))),
    withRetry((db) => db.select({ value: count() }).from(projectInquiries).where(eq(projectInquiries.status, "NEW"))),
  ]);

  const totalRevenue = parseFloat(revenueResult?.value || "0");

  // 1 — What needs a decision from the admin right now.
  const attention = [
    { count: newInquiryCount.value, one: "new inquiry to answer", many: "new inquiries to answer", href: "/admin/inquiries", icon: Inbox },
    { count: pendingReviewCount.value, one: "review awaiting moderation", many: "reviews awaiting moderation", href: "/admin/reviews", icon: Star },
  ].filter((item) => item.count > 0);

  // 2 — How the store is doing.
  const sales = [
    { label: "Orders", value: orderCount.value, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Active licenses", value: licenseCount.value, icon: Key, href: "/admin/orders" },
    { label: "Customers", value: customerCount.value, icon: Users, href: "/admin/customers" },
  ];

  // 4 — Inventory counts: reference, not action. Folded away.
  const catalogue = [
    { label: "Products", value: productCount.value, icon: Package, href: "/admin/products" },
    { label: "Blog posts", value: blogCount.value, icon: FileText, href: "/admin/blog" },
  ];

  const recentOrders = await withRetry((db) =>
    db.query.orders.findMany({
      with: { user: true, product: true },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: 8,
    })
  );

  const tile =
    "glass group flex min-h-[7.5rem] flex-col justify-between rounded-2xl border p-5 transition-[border-color,transform] duration-200 ease-[var(--ease-out)] hover:border-primary/40 active:scale-[0.99]";
  const sectionLabel = "mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Overview</h2>
        <div className="mt-2 h-1 w-10 rounded-full bg-gold" />
      </div>

      {/* 1 — Needs attention */}
      <section aria-labelledby="attention-heading">
        <h3 id="attention-heading" className={sectionLabel}>Needs attention</h3>
        {attention.length === 0 ? (
          <p className="glass flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm text-muted-foreground">
            <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
            Nothing is waiting on you.
          </p>
        ) : (
          <ul className="glass divide-y divide-border/70 rounded-2xl border">
            {attention.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group flex min-h-14 items-center gap-3 px-5 py-3 text-sm transition-colors duration-150 hover:bg-secondary/50 first:rounded-t-2xl last:rounded-b-2xl">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-ink" aria-hidden>
                    <item.icon className="size-[18px]" />
                  </span>
                  <span className="flex-1 text-foreground">
                    <span className="font-semibold tabular-nums">{item.count}</span> {item.count === 1 ? item.one : item.many}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2 — Sales */}
      <section aria-labelledby="sales-heading">
        <h3 id="sales-heading" className={sectionLabel}>Sales</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <Link
            href="/admin/orders"
            className="flex min-h-[7.5rem] flex-col justify-between rounded-2xl bg-primary p-5 text-primary-foreground shadow-[0_18px_40px_-26px_rgb(8_37_29/0.6)] transition-transform duration-200 ease-[var(--ease-out)] active:scale-[0.99] sm:col-span-2 xl:col-span-1"
          >
            <span className="text-sm font-medium opacity-80">Total revenue</span>
            <span className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </Link>
          {sales.map((stat) => (
            <Link key={stat.label} href={stat.href} className={tile}>
              <span className="flex items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
                {stat.label}
                <stat.icon className="size-[18px] shrink-0 text-primary" strokeWidth={1.9} aria-hidden />
              </span>
              <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">{stat.value}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3 — Recent orders */}
      <section aria-labelledby="orders-heading" className="glass overflow-hidden rounded-2xl border">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <h3 id="orders-heading" className="text-base font-semibold text-foreground">Recent orders</h3>
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
            All orders <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Orders appear here as soon as a customer checks out.</p>
          </div>
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
                  <tr key={order.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-white-2 font-medium">
                      {order.user?.name || "Guest"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-light-gray">
                      {order.product?.name || "—"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-white-2 font-semibold tabular-nums">
                      ${order.amount}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                        order.status === "COMPLETED"
                          ? "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300"
                          : order.status === "PENDING"
                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                          : "bg-red-500/10 text-red-800 dark:text-red-300"
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

      {/* 4 — Catalogue & content (reference) */}
      <details className="disclosure glass rounded-2xl border">
        <summary className="flex min-h-14 items-center justify-between gap-3 rounded-2xl px-5 py-3">
          <span className="text-base font-semibold text-foreground">Catalogue and content</span>
          <ChevronDown className="disclosure-chevron size-5 shrink-0 text-muted-foreground" aria-hidden />
        </summary>
        <ul className="divide-y divide-border/70 border-t border-border/70">
          {catalogue.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="flex min-h-12 items-center gap-3 px-5 py-2 text-sm transition-colors duration-150 hover:bg-secondary/50 last:rounded-b-2xl">
                <item.icon className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="flex-1 text-foreground">{item.label}</span>
                <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

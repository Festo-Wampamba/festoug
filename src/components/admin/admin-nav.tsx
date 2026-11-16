"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  ArrowLeft,
  Users,
  Star,
  FolderKanban,
  MessageSquareQuote,
  RefreshCw,
  Inbox,
  type LucideIcon,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon };

// Grouped by what the admin is doing, in the order the work usually happens:
// answer leads → fulfil sales → publish content.
const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  { label: null, items: [{ label: "Overview", href: "/admin", icon: LayoutDashboard }] },
  { label: "Leads", items: [{ label: "Inquiries", href: "/admin/inquiries", icon: Inbox }] },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Store sync", href: "/admin/ls-sync", icon: RefreshCw },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: FileText },
      { label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-60 lg:self-start">
      <nav aria-label="Admin" className="glass rounded-2xl border p-3">
        {NAV_GROUPS.map((group, index) => (
          <div key={group.label ?? "top"} className={index > 0 ? "mt-4" : undefined}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {group.label}
              </p>
            )}
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150 ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <item.icon className="size-4 shrink-0" strokeWidth={1.9} aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <Link
          href="/"
          className="mt-4 flex min-h-11 items-center gap-3 rounded-xl border-t border-border px-3 pt-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden /> Back to site
        </Link>
      </nav>
    </aside>
  );
}

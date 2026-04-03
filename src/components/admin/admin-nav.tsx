"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  PenSquare,
  ArrowLeft,
  Users,
  Star,
  FolderKanban,
  MessageSquareQuote,
  RefreshCw,
  Shield,
} from "lucide-react";

const navItems = [
  { label: "Overview",      short: "Overview",  href: "/admin",               icon: LayoutDashboard },
  { label: "Products",      short: "Products",  href: "/admin/products",      icon: Package },
  { label: "Orders",        short: "Orders",    href: "/admin/orders",        icon: ShoppingBag },
  { label: "Reviews",       short: "Reviews",   href: "/admin/reviews",       icon: Star },
  { label: "Customers",     short: "Customers", href: "/admin/customers",     icon: Users },
  { label: "Portfolio",     short: "Portfolio", href: "/admin/portfolio",     icon: FolderKanban },
  { label: "Testimonials",  short: "Testim.",   href: "/admin/testimonials",  icon: MessageSquareQuote },
  { label: "Blog Posts",    short: "Blog",      href: "/admin/blog",          icon: FileText },
  { label: "Subscriptions", short: "Subs",      href: "/admin/subscriptions", icon: Shield },
  { label: "New Post",      short: "New Post",  href: "/admin/blog/new",      icon: PenSquare },
  { label: "LS Sync",       short: "LS Sync",   href: "/admin/ls-sync",       icon: RefreshCw },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-[220px] shrink-0">
      {/* Back to site */}
      <Link
        href="/"
        className="flex items-center gap-2 text-light-gray-70 hover:text-orange-yellow-crayola text-xs sm:text-sm mb-4 sm:mb-5 lg:mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Back to Site
      </Link>

      {/* Mobile/Tablet: 3-column icon grid */}
      <nav className="lg:hidden grid grid-cols-3 gap-1.5 sm:gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-center transition-colors ${
                isActive
                  ? "bg-orange-yellow-crayola/10 text-orange-yellow-crayola border border-orange-yellow-crayola/20"
                  : "bg-jet/30 text-light-gray hover:bg-jet/60 hover:text-white-2 border border-transparent"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-medium leading-tight">{item.short}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sidebar list */}
      <nav className="hidden lg:flex lg:flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-yellow-crayola/10 text-orange-yellow-crayola border border-orange-yellow-crayola/20"
                  : "text-light-gray hover:bg-jet/60 hover:text-white-2"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

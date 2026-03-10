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
} from "lucide-react";

const navItems = [
  { label: "Overview",  href: "/admin",          icon: LayoutDashboard },
  { label: "Products",  href: "/admin/products",  icon: Package },
  { label: "Orders",    href: "/admin/orders",    icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Blog Posts", href: "/admin/blog",     icon: FileText },
  { label: "New Post",  href: "/admin/blog/new",  icon: PenSquare },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-[220px] shrink-0">
      {/* Back to site */}
      <Link
        href="/"
        className="flex items-center gap-2 text-light-gray-70 hover:text-orange-yellow-crayola text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Site
      </Link>

      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
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

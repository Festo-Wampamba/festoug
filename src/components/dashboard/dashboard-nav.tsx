"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, KeyRound, Settings, Star, Shield } from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Purchases", href: "/dashboard/purchases", icon: ShoppingBag },
    { name: "My Reviews", href: "/dashboard/reviews", icon: Star },
    { name: "License Keys", href: "/dashboard/licenses", icon: KeyRound },
    { name: "Subscription", href: "/dashboard/subscription", icon: Shield },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-jet no-scrollbar">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors duration-300 ${
              isActive
                ? "bg-orange-yellow-crayola/10 text-orange-yellow-crayola border border-orange-yellow-crayola/20"
                : "text-light-gray hover:text-white-2 hover:bg-jet"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

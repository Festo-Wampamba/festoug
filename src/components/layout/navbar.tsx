"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { label: "About", href: "/" },
    { label: "Resume", href: "/resume" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Store", href: "/store" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[hsla(240,1%,17%,0.75)] backdrop-blur-[10px] border border-jet rounded-t-[20px] shadow-2 z-50 xl:absolute xl:bottom-auto xl:top-0 xl:right-0 xl:w-max xl:rounded-tr-[20px] xl:rounded-bl-[20px] xl:rounded-tl-none xl:rounded-br-none xl:border-r-0 xl:border-t-0">
      <ul className="flex flex-wrap justify-center items-center px-[10px] xl:px-[30px] xl:py-[5px]">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-[13px] font-medium p-[20px_10px] xl:p-[20px_20px] transition-colors block ${
                  isActive ? "text-orange-yellow-crayola" : "text-light-gray hover:text-light-gray-70"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

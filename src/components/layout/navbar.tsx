"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { LayoutDashboard, LogOut, User, Settings, Shield } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  const links = [
    { label: "About", href: "/" },
    { label: "Resume", href: "/resume" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Services", href: "/services" },
    { label: "Store", href: "/store" },
    { label: "Contact", href: "/contact" },
  ];

  // Calculate dropdown position when opening
  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isXl = window.innerWidth >= 1280;
      const dropdownHeight = 200; // approximate dropdown height

      if (isXl) {
        // Desktop: navbar at top, dropdown goes below
        setDropdownPos({
          top: rect.bottom + 8,
          right: Math.max(8, window.innerWidth - rect.right),
        });
      } else {
        // Mobile: navbar at bottom, dropdown goes above
        setDropdownPos({
          top: rect.top - dropdownHeight - 8,
          right: Math.max(8, window.innerWidth - rect.right),
        });
      }
    }
  }, [dropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const dropdownMenu = dropdownOpen && dropdownPos && typeof window !== "undefined" ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-52 bg-eerie-black-2 border border-jet rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]"
      style={{ top: dropdownPos.top, right: dropdownPos.right }}
    >
      <div className="px-4 py-3 border-b border-jet">
        <p className="text-white-2 text-sm font-semibold truncate">{session?.user?.name}</p>
        <p className="text-light-gray-70 text-xs truncate">{session?.user?.email}</p>
      </div>
      <ul className="py-2">
        {session?.user?.role === "ADMIN" ? (
          <li>
            <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-light-gray text-sm hover:bg-jet hover:text-white-2 transition-colors">
              <Shield className="w-4 h-4 text-orange-yellow-crayola" /> Admin Panel
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-light-gray text-sm hover:bg-jet hover:text-white-2 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-orange-yellow-crayola" /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-light-gray text-sm hover:bg-jet hover:text-white-2 transition-colors">
                <Settings className="w-4 h-4 text-orange-yellow-crayola" /> Profile Settings
              </Link>
            </li>
          </>
        )}
        <li className="border-t border-jet mt-1 pt-1">
          <button
            type="button"
            onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
            className="flex items-center gap-3 px-4 py-2.5 text-red-400 text-sm hover:bg-jet transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </li>
      </ul>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-[hsla(240,1%,17%,0.75)] backdrop-blur-[10px] border border-jet rounded-t-[20px] shadow-2 z-50 xl:absolute xl:bottom-auto xl:top-0 xl:right-0 xl:left-auto xl:w-max xl:rounded-tr-[20px] xl:rounded-bl-[20px] xl:rounded-tl-none xl:rounded-br-none xl:border-r-0 xl:border-t-0">
        <ul className="flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-start xl:justify-center items-center px-[15px] py-[5px] xl:px-[20px] gap-1 max-w-full">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  className={`text-[13px] font-medium p-[10px_10px] xl:p-[15px_15px] transition-colors block ${
                    isActive ? "text-orange-yellow-crayola" : "text-light-gray hover:text-light-gray-70"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}

          {/* User Account Controls */}
          <li className="flex items-center pl-2 ml-1 border-l border-jet/60 shrink-0 pr-[15px] xl:pr-0">
            {status === "loading" ? null : session?.user ? (
              /* Logged-in: avatar dropdown */
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 py-[8px] px-3 rounded-xl hover:bg-jet/60 transition-colors group"
                  title="Your account"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full border-2 border-orange-yellow-crayola/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-yellow-crayola text-smoky-black flex items-center justify-center font-bold text-sm border-2 border-orange-yellow-crayola/60">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-white-2 text-xs font-medium">{session.user.name?.split(" ")[0]}</span>
                    <span className="text-orange-yellow-crayola text-[10px] uppercase tracking-wide">{session.user.role}</span>
                  </div>
                </button>
              </div>
            ) : (
              /* Not logged in: Sign In + Sign Up buttons */
              <div className="flex items-center gap-1 py-[5px]">
                <Link href="/auth/signin" className="text-[13px] font-medium px-3 py-1.5 rounded-lg text-light-gray hover:text-white-2 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-orange-yellow-crayola text-smoky-black hover:bg-orange-yellow-crayola/90 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </li>
        </ul>
      </nav>
      {dropdownMenu}
    </>
  );
}

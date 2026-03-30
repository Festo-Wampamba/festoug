"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard, LogOut, Settings, Shield,
  Home, FileText, Layers, BookOpen, Wrench, ShoppingBag, Mail, LogIn,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { label: "About",     href: "/",          Icon: Home },
  { label: "Resume",    href: "/resume",     Icon: FileText },
  { label: "Portfolio", href: "/portfolio",  Icon: Layers },
  { label: "Blog",      href: "/blog",       Icon: BookOpen },
  { label: "Services",  href: "/services",   Icon: Wrench },
  { label: "Store",     href: "/store",      Icon: ShoppingBag },
  { label: "Contact",   href: "/contact",    Icon: Mail },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const desktopButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  // ── Scroll transparency ──────────────────────────────────────────────────────
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isNavFocused, setIsNavFocused] = useState(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80;
      setIsAtBottom(atBottom);
      setIsScrolling(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setIsScrolling(false), 1400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // Reveal on touch/click for 3 seconds then fade back if still scrolling
  const handleNavTouch = () => {
    setIsNavFocused(true);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => setIsNavFocused(false), 3000);
  };

  const navOpaque = !isScrolling || isAtBottom || isNavFocused;

  // ── Dropdown positioning ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const isXl = window.innerWidth >= 1280;
    const btn = isXl ? desktopButtonRef.current : mobileButtonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    if (isXl) {
      setDropdownPos({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
    } else {
      setDropdownPos({ top: rect.top - 216, right: Math.max(8, window.innerWidth - rect.right) });
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(t) &&
        mobileButtonRef.current && !mobileButtonRef.current.contains(t) &&
        desktopButtonRef.current && !desktopButtonRef.current.contains(t)
      ) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  // ── Shared user avatar ───────────────────────────────────────────────────────
  const UserAvatar = ({ size = "sm" }: { size?: "sm" | "md" }) => {
    const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
    return session?.user?.image ? (
      <img src={session.user.image} alt={session.user.name || ""} className={`${dim} rounded-full border border-orange-yellow-crayola/50`} />
    ) : (
      <div className={`${dim} rounded-full bg-orange-yellow-crayola text-smoky-black flex items-center justify-center font-bold`}>
        {session?.user?.name?.charAt(0) || "U"}
      </div>
    );
  };

  // ── Dropdown portal ──────────────────────────────────────────────────────────
  const dropdownMenu =
    dropdownOpen && dropdownPos && typeof window !== "undefined"
      ? createPortal(
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
        )
      : null;

  return (
    <>
      {/* ── Mobile + Tablet (< xl): Floating Pill ─────────────────────────────── */}
      <nav
        className={`xl:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-in-out max-w-[calc(100vw-2rem)] ${
          navOpaque ? "opacity-100 translate-y-0" : "opacity-[0.18] translate-y-1 hover:opacity-100 hover:translate-y-0"
        }`}
        onMouseEnter={() => setIsNavFocused(true)}
        onMouseLeave={() => setIsNavFocused(false)}
        onTouchStart={handleNavTouch}
      >
        <div className="flex items-center gap-0 sm:gap-0.5 md:gap-1
          px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2.5
          bg-eerie-black-2/90 backdrop-blur-2xl
          border border-white/[0.07]
          rounded-full
          shadow-[0_8px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]">

          {/* Nav icon links */}
          {links.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`relative flex items-center justify-center
                  w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10
                  rounded-full
                  transition-all duration-200 shrink-0
                  ${isActive
                    ? "bg-orange-yellow-crayola/15 text-orange-yellow-crayola"
                    : "text-light-gray-70 hover:text-white-2 hover:bg-white/5"
                  }`}
              >
                <link.Icon
                  className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px] md:w-[18px] md:h-[18px]"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {/* Active dot indicator — visible on all mobile/tablet sizes */}
                {isActive && (
                  <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-yellow-crayola" />
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-3.5 sm:h-4 md:h-5 bg-white/[0.09] mx-0.5 sm:mx-1 shrink-0" />

          {/* Theme toggle */}
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 shrink-0">
            <ThemeToggle />
          </div>

          {/* User account */}
          {status !== "loading" && (
            session?.user ? (
              <button
                ref={mobileButtonRef}
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full hover:bg-white/5 transition-colors shrink-0"
                aria-label="Account menu"
              >
                <UserAvatar size="sm" />
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full text-light-gray-70 hover:text-white-2 hover:bg-white/5 transition-colors shrink-0"
                title="Sign in"
                aria-label="Sign in"
              >
                <LogIn className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]" strokeWidth={1.8} />
              </Link>
            )
          )}
        </div>
      </nav>

      {/* ── Desktop (xl+): Glassmorphism top-right nav ───────────────────────── */}
      <nav className="hidden xl:block absolute top-0 right-0 z-50
        bg-white/[0.04] backdrop-blur-2xl
        border border-white/[0.08]
        rounded-tr-[20px] rounded-bl-[24px]
        shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)]">
        <ul className="flex flex-nowrap items-center px-4 py-1.5 gap-0.5">
          {links.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-orange-yellow-crayola bg-orange-yellow-crayola/10"
                      : "text-light-gray hover:text-white-2 hover:bg-white/[0.06]"
                  }`}
                >
                  <link.Icon
                    className="w-[14px] h-[14px] shrink-0"
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li className="flex items-center pl-2 ml-1 border-l border-white/[0.08] shrink-0 gap-1">
            <ThemeToggle />
            {status === "loading" ? null : session?.user ? (
              <button
                ref={desktopButtonRef}
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 py-[7px] px-3 rounded-xl hover:bg-white/[0.06] transition-colors"
                title="Your account"
              >
                <UserAvatar size="md" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-white-2 text-xs font-medium">{session.user.name?.split(" ")[0]}</span>
                  <span className="text-orange-yellow-crayola text-[10px] uppercase tracking-wide">{session.user.role}</span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-1 py-[5px]">
                <Link href="/auth/signin" className="text-[13px] font-medium px-3 py-1.5 rounded-lg text-light-gray hover:text-white-2 transition-colors">Sign In</Link>
                <Link href="/auth/signup" className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-orange-yellow-crayola text-smoky-black hover:bg-orange-yellow-crayola/90 transition-colors">Sign Up</Link>
              </div>
            )}
          </li>
        </ul>
      </nav>

      {dropdownMenu}
    </>
  );
}

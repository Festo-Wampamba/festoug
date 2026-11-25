"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, MotionConfig, domMax, m, type Transition } from "motion/react";
import {
  BackpackIcon, ChatBubbleIcon, ChevronDownIcon, Cross2Icon, DashboardIcon, EnterIcon,
  ExitIcon, FileTextIcon, GearIcon, HamburgerMenuIcon, HomeIcon,
  LayersIcon, LockClosedIcon, ReaderIcon,
} from "@radix-ui/react-icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Portfolio first: the header carries the work. Blog and Store are secondary,
// reachable from the menu's "More" group and the footer.
const links = [
  { label: "Home", href: "/", Icon: HomeIcon },
  { label: "Work", href: "/portfolio", Icon: LayersIcon },
  { label: "Services", href: "/services", Icon: GearIcon },
  { label: "Resume", href: "/resume", Icon: FileTextIcon },
  { label: "Contact", href: "/contact", Icon: ChatBubbleIcon },
];

const moreLinks = [
  { label: "Blog", href: "/blog", Icon: ReaderIcon },
  { label: "Store", href: "/store", Icon: BackpackIcon },
];

// The selected tab glides to its new place with a touch of bounce (an occasional,
// deliberate action); the hover pill is critically damped so it never wobbles.
const SELECT_SPRING: Transition = { type: "spring", bounce: 0.18, duration: 0.45 };
const HOVER_SPRING: Transition = { type: "spring", bounce: 0, duration: 0.3 };
// Menus "materialize": blur, scale and fade together, from the button that opened them.
const MATERIALIZE = {
  initial: { opacity: 0, scale: 0.96, y: -6, filter: "blur(6px)" },
  animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.97, y: -4, filter: "blur(4px)" },
  transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const },
};

const GLASS_BUTTON = "liquid-glass liquid-press flex items-center justify-center rounded-full text-foreground";

type AvatarUser = { name?: string | null; image?: string | null };
function UserAvatar({ user }: { user: AvatarUser }) {
  return user.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.image} alt="" className="size-7 rounded-full object-cover" />
  ) : <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{user.name?.charAt(0) || "U"}</span>;
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [previousPath, setPreviousPath] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  if (pathname !== previousPath) {
    setPreviousPath(pathname);
    setMenuOpen(false);
    setAccountOpen(false);
    setMoreOpen(false);
  }

  useEffect(() => {
    if (!accountOpen && !menuOpen && !moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!headerRef.current?.contains(target)) setMenuOpen(false);
      if (!accountRef.current?.contains(target)) setAccountOpen(false);
      if (!moreRef.current?.contains(target)) setMoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (moreOpen) { setMoreOpen(false); moreButtonRef.current?.focus(); }
      else if (accountOpen) { setAccountOpen(false); accountButtonRef.current?.focus(); }
      else { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen, menuOpen, moreOpen]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  const moreActive = moreLinks.some(({ href }) => isActive(href));

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <header ref={headerRef} className="glass-chrome sticky top-0 z-40">
          <div className="site-header-inner flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-3">
            <Link href="/" aria-label="Festo Wampamba home" className="max-w-full shrink-0 text-lg font-semibold tracking-tight text-foreground">
              Festo Wampamba<span className="mt-0.5 block text-xs font-normal tracking-normal text-muted-foreground">Software engineer</span>
            </Link>

            <nav aria-label="Main navigation" className="hidden lg:block">
              <ul className="liquid-glass flex items-center gap-0.5 rounded-full p-1" onMouseLeave={() => setHovered(null)}>
                {links.map(({ label, href }) => {
                  const active = isActive(href);
                  return (
                    <li key={href} className="relative">
                      <AnimatePresence>
                        {hovered === href && !active && (
                          <m.span
                            layoutId="nav-hover"
                            aria-hidden
                            className="liquid-hover absolute inset-0 rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            transition={HOVER_SPRING}
                          />
                        )}
                      </AnimatePresence>
                      {active && (
                        <m.span layoutId="nav-active" aria-hidden className="liquid-pill absolute inset-0 rounded-full" transition={SELECT_SPRING} />
                      )}
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        onMouseEnter={() => setHovered(href)}
                        onFocus={() => setHovered(href)}
                        onBlur={() => setHovered(null)}
                        className={`relative inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors duration-200 ${
                          active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
                <li ref={moreRef} className="relative">
                  <AnimatePresence>
                    {hovered === "more" && !moreActive && (
                      <m.span
                        layoutId="nav-hover"
                        aria-hidden
                        className="liquid-hover absolute inset-0 rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        transition={HOVER_SPRING}
                      />
                    )}
                  </AnimatePresence>
                  {moreActive && (
                    <m.span layoutId="nav-active" aria-hidden className="liquid-pill absolute inset-0 rounded-full" transition={SELECT_SPRING} />
                  )}
                  <button
                    ref={moreButtonRef}
                    type="button"
                    aria-expanded={moreOpen}
                    aria-controls="more-navigation"
                    onClick={() => { setAccountOpen(false); setMoreOpen(open => !open); }}
                    onMouseEnter={() => setHovered("more")}
                    onFocus={() => setHovered("more")}
                    onBlur={() => setHovered(null)}
                    className={`relative inline-flex min-h-11 items-center gap-1 rounded-full pl-4 pr-3 text-sm font-medium transition-colors duration-200 ${
                      moreActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    More
                    <ChevronDownIcon aria-hidden className={`size-4 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {moreOpen && (
                      <m.ul id="more-navigation" {...MATERIALIZE} style={{ transformOrigin: "top right" }} className="liquid-menu absolute right-0 top-full mt-2 w-48 rounded-2xl p-2 text-popover-foreground">
                        {moreLinks.map(({ label, href, Icon }) => (
                          <li key={href}>
                            <Link href={href} aria-current={isActive(href) ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm hover:bg-secondary ${isActive(href) ? "font-semibold text-primary" : ""}`}>
                              <Icon aria-hidden />{label}
                            </Link>
                          </li>
                        ))}
                      </m.ul>
                    )}
                  </AnimatePresence>
                </li>
              </ul>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              {isPending ? <div aria-hidden className="size-11" /> : session?.user ? (
                <div ref={accountRef} className="relative">
                  <button ref={accountButtonRef} type="button" aria-label="Account menu" aria-expanded={accountOpen} aria-controls="account-panel" onClick={() => { setMenuOpen(false); setAccountOpen(open => !open); }} className={`${GLASS_BUTTON} min-h-11 gap-2 px-2 text-sm md:pr-4`}>
                    <UserAvatar user={session.user} /><span className="hidden max-w-24 truncate md:inline">{session.user.name?.split(" ")[0] || "Account"}</span>
                  </button>
                  <AnimatePresence>
                    {accountOpen && (
                      <m.div id="account-panel" {...MATERIALIZE} style={{ transformOrigin: "top right" }} className="liquid-menu absolute right-0 top-full mt-2 w-60 rounded-2xl p-2 text-popover-foreground">
                        <div className="mb-1 border-b border-border px-3 py-3"><p className="truncate text-sm font-semibold">{session.user.name}</p><p className="truncate text-xs text-muted-foreground">{session.user.email}</p></div>
                        {session.user.role === "ADMIN" ? <Link href="/admin" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm hover:bg-secondary"><LockClosedIcon aria-hidden />Admin panel</Link> : <><Link href="/dashboard" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm hover:bg-secondary"><DashboardIcon aria-hidden />Dashboard</Link><Link href="/dashboard/settings" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm hover:bg-secondary"><GearIcon aria-hidden />Profile settings</Link></>}
                        {/* eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload clears the cached session after sign-out */}
                        <button type="button" onClick={() => { setAccountOpen(false); signOut().finally(() => { window.location.href = "/"; }); }} className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl border-t border-border px-3 text-left text-sm text-destructive hover:bg-destructive/10"><ExitIcon aria-hidden />Sign out</button>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : <Link href="/auth/signin" aria-label="Sign in" title="Sign in" className={`${GLASS_BUTTON} size-11`}><EnterIcon className="size-[18px]" aria-hidden /></Link>}
              <button ref={menuButtonRef} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { setAccountOpen(false); setMenuOpen(open => !open); }} className={`${GLASS_BUTTON} size-11 lg:hidden`}>{menuOpen ? <Cross2Icon className="size-5" aria-hidden /> : <HamburgerMenuIcon className="size-5" aria-hidden />}</button>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <m.nav id="mobile-navigation" aria-label="Mobile navigation" {...MATERIALIZE} style={{ transformOrigin: "top right" }} className="pb-5 pt-1 lg:hidden">
                <ul className="grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 sm:grid-cols-3">
                  {links.map(({ label, href, Icon }) => {
                    const active = isActive(href);
                    return (
                      <li key={href}>
                        <Link href={href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`liquid-press flex min-h-12 items-center gap-3 rounded-full px-4 text-sm font-medium ${active ? "liquid-pill text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><Icon className="size-[18px]" aria-hidden />{label}</Link>
                      </li>
                    );
                  })}
                  <li aria-hidden className="col-span-full mt-2 border-t border-border px-4 pt-3 text-xs font-medium uppercase tracking-[.08em] text-muted-foreground">More</li>
                  {moreLinks.map(({ label, href, Icon }) => {
                    const active = isActive(href);
                    return (
                      <li key={href}>
                        <Link href={href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`liquid-press flex min-h-12 items-center gap-3 rounded-full px-4 text-sm font-medium ${active ? "liquid-pill text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><Icon className="size-[18px]" aria-hidden />{label}</Link>
                      </li>
                    );
                  })}
                  {!session?.user && !isPending && <><li><Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="liquid-press flex min-h-12 items-center rounded-full px-4 text-sm font-medium text-primary hover:bg-secondary">Create account</Link></li></>}
                </ul>
              </m.nav>
            )}
          </AnimatePresence>
        </header>
      </MotionConfig>
    </LazyMotion>
  );
}

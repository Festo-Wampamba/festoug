"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import {
  BackpackIcon, ChatBubbleIcon, Cross2Icon, DashboardIcon, EnterIcon,
  ExitIcon, FileTextIcon, GearIcon, HamburgerMenuIcon, HomeIcon,
  LayersIcon, LockClosedIcon, ReaderIcon,
} from "@radix-ui/react-icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { label: "About", href: "/", Icon: HomeIcon },
  { label: "Resume", href: "/resume", Icon: FileTextIcon },
  { label: "Portfolio", href: "/portfolio", Icon: LayersIcon },
  { label: "Blog", href: "/blog", Icon: ReaderIcon },
  { label: "Services", href: "/services", Icon: GearIcon },
  { label: "Store", href: "/store", Icon: BackpackIcon },
  { label: "Contact", href: "/contact", Icon: ChatBubbleIcon },
];

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
  const [previousPath, setPreviousPath] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  if (pathname !== previousPath) {
    setPreviousPath(pathname);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  useEffect(() => {
    if (!accountOpen && !menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!headerRef.current?.contains(target)) setMenuOpen(false);
      if (!accountRef.current?.contains(target)) setAccountOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (accountOpen) { setAccountOpen(false); accountButtonRef.current?.focus(); }
      else { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen, menuOpen]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex min-h-[88px] flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" aria-label="Festo Wampamba home" className="max-w-full shrink-0 text-lg font-semibold tracking-tight text-foreground">
          Festo Wampamba<span className="mt-0.5 block text-xs font-normal tracking-normal text-muted-foreground">Software engineer</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden 2xl:block">
          <ul className="flex items-center gap-1">
            {links.map(({ label, href }) => (
              <li key={href}><Link href={href} aria-current={isActive(href) ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${isActive(href) ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>{label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {isPending ? <div aria-label="Loading account" className="hidden h-11 w-20 animate-pulse rounded-xl bg-muted sm:block" /> : session?.user ? (
            <div ref={accountRef} className="relative">
              <button ref={accountButtonRef} type="button" aria-label="Account menu" aria-expanded={accountOpen} aria-controls="account-panel" onClick={() => { setMenuOpen(false); setAccountOpen(open => !open); }} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-2.5 text-sm text-foreground transition-colors hover:bg-secondary">
                <UserAvatar user={session.user} /><span className="hidden max-w-24 truncate md:inline">{session.user.name?.split(" ")[0] || "Account"}</span>
              </button>
              {accountOpen && (
                <div id="account-panel" className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg">
                  <div className="mb-1 border-b border-border px-3 py-3"><p className="truncate text-sm font-semibold">{session.user.name}</p><p className="truncate text-xs text-muted-foreground">{session.user.email}</p></div>
                  {session.user.role === "ADMIN" ? <Link href="/admin" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-secondary"><LockClosedIcon aria-hidden />Admin panel</Link> : <><Link href="/dashboard" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-secondary"><DashboardIcon aria-hidden />Dashboard</Link><Link href="/dashboard/settings" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-secondary"><GearIcon aria-hidden />Profile settings</Link></>}
                  <button type="button" onClick={() => { setAccountOpen(false); signOut().finally(() => { window.location.href = "/"; }); }} className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg border-t border-border px-3 text-left text-sm text-destructive hover:bg-destructive/10"><ExitIcon aria-hidden />Sign out</button>
                </div>
              )}
            </div>
          ) : <><Link href="/auth/signin" aria-label="Sign in" className="hidden min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:inline-flex"><EnterIcon aria-hidden />Sign in</Link><Link href="/auth/signup" className="hidden min-h-11 items-center rounded-xl px-3 text-sm font-medium text-primary underline-offset-4 hover:underline md:inline-flex">Sign up</Link></>}
          <button ref={menuButtonRef} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { setAccountOpen(false); setMenuOpen(open => !open); }} className="flex size-11 items-center justify-center rounded-xl border border-border text-foreground hover:bg-secondary 2xl:hidden">{menuOpen ? <Cross2Icon className="size-5" aria-hidden /> : <HamburgerMenuIcon className="size-5" aria-hidden />}</button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-border pb-5 pt-3 2xl:hidden">
          <ul className="grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 sm:grid-cols-3">
            {links.map(({ label, href, Icon }) => <li key={href}><Link href={href} onClick={() => setMenuOpen(false)} aria-current={isActive(href) ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${isActive(href) ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><Icon className="size-[18px]" aria-hidden />{label}</Link></li>)}
            {!session?.user && !isPending && <><li><Link href="/auth/signin" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-primary hover:bg-secondary"><EnterIcon className="size-[18px]" aria-hidden />Sign in</Link></li><li><Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center rounded-xl px-4 text-sm font-medium text-primary hover:bg-secondary">Create account</Link></li></>}
          </ul>
        </nav>
      )}
    </header>
  );
}

import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { ToastProvider } from "@/components/ui/toast-provider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="portfolio-shell">
        <Navbar />
        <div className="portfolio-body grid grid-cols-1 items-start gap-6 py-6 sm:py-8 xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-8 2xl:grid-cols-[18rem_minmax(0,1fr)]">
          <Sidebar />
          <main id="main-content" tabIndex={-1} className="portfolio-content relative min-w-0 rounded-2xl border border-border bg-card p-5 outline-none sm:p-8 2xl:p-10">
            {children}
          </main>
        </div>
        <footer className="site-footer flex flex-col items-center gap-3 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:gap-6 sm:py-6">
          <p className="flex flex-col items-center justify-center gap-x-2 gap-y-1 text-center sm:flex-row sm:flex-wrap sm:justify-start sm:text-left">
            <span>© {new Date().getFullYear()} Festo Wampamba</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span>Kampala, Uganda</span>
          </p>
          <nav aria-label="Footer navigation" className="flex shrink-0 items-center justify-center gap-6">
            <a href="https://github.com/Festo-Wampamba" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-primary">GitHub</a>
            <Link href="/contact" className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-primary">Get in touch</Link>
          </nav>
        </footer>
      </div>
    </ToastProvider>
  );
}

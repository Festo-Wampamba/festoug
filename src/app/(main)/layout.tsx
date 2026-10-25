import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { ToastProvider } from "@/components/ui/toast-provider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="portfolio-shell px-4 sm:px-6 lg:px-8">
        <Navbar />
        <div className="grid grid-cols-1 items-start gap-6 py-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-10">
          <Sidebar />
          <main id="main-content" tabIndex={-1} className="relative min-w-0 rounded-2xl border border-border bg-card p-5 outline-none sm:p-8 lg:p-10">
            {children}
          </main>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border pb-28 pt-6 text-xs text-muted-foreground sm:pb-8">
          <p>© {new Date().getFullYear()} Festo Wampamba · Kampala, Uganda</p>
          <div className="flex items-center gap-6"><a href="https://github.com/Festo-Wampamba" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-primary">GitHub</a><Link href="/contact" className="inline-flex min-h-11 items-center hover:text-primary">Get in touch</Link></div>
        </footer>
      </div>
    </ToastProvider>
  );
}

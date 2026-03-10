import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-4 py-[15px] sm:py-[60px] mb-[75px] xl:mb-0 flex flex-col xl:flex-row gap-6 justify-center">
      <Sidebar />
      
      <div className="flex-1 min-w-0 relative">
        <Navbar />
        
        <main className="bg-eerie-black-2 rounded-[20px] p-[15px] sm:p-[30px] shadow-1 relative z-10 border border-jet">
          {children}
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Festo Wampamba | Software Engineer & Digital Store",
  description: "Portfolio and digital storefront of Festo Wampamba, a Staff-Level Full-Stack Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} antialiased min-h-screen selection:bg-orange-yellow-crayola selection:text-smoky-black`}>
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 py-[15px] sm:py-[60px] mb-[75px] xl:mb-0 flex flex-col xl:flex-row gap-6 justify-center">
          <Sidebar />
          
          <div className="flex-1 min-w-0 relative">
            <Navbar />
            
            <main className="bg-eerie-black-2 rounded-[20px] p-[15px] sm:p-[30px] shadow-1 relative z-10 border border-jet">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

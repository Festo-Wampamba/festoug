import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/layout/providers";
import { AiAssistant } from "@/components/chat/ai-assistant";
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
      <body className={`${poppins.variable} antialiased min-h-screen selection:bg-orange-yellow-crayola selection:text-smoky-black bg-smoky-black text-light-gray`}>
        <Providers>
          {children}
          <AiAssistant />
        </Providers>
      </body>
    </html>
  );
}

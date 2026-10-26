import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { AiAssistant } from "@/components/chat/ai-assistant";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Festo Wampamba | Software Engineer & Digital Store",
    template: "%s | Festo Wampamba",
  },
  description:
    "Portfolio and digital storefront of Festo Wampamba — Full-Stack Software Engineer specializing in Python, JavaScript, React, Next.js, and data solutions.",
  keywords: [
    "Festo Wampamba",
    "software engineer",
    "full-stack developer",
    "React",
    "Next.js",
    "Python",
    "Uganda",
    "web development",
    "portfolio",
  ],
  authors: [{ name: "Festo Wampamba" }],
  creator: "Festo Wampamba",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://festoug.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FestoUG",
    title: "Festo Wampamba | Software Engineer & Digital Store",
    description:
      "Portfolio and digital storefront of Festo Wampamba — Full-Stack Software Engineer.",
    images: [{ url: "/images/festo03.png", width: 1254, height: 1254, alt: "Festo Wampamba" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Festo Wampamba | Software Engineer & Digital Store",
    description:
      "Portfolio and digital storefront of Festo Wampamba — Full-Stack Software Engineer.",
    images: ["/images/festo03.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}>
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        <Providers>
          {children}
          <AiAssistant />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

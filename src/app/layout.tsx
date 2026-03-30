import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/layout/providers";
import { AiAssistant } from "@/components/chat/ai-assistant";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
    images: [{ url: "/images/festo-profile.png", width: 1200, height: 630, alt: "Festo Wampamba" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Festo Wampamba | Software Engineer & Digital Store",
    description:
      "Portfolio and digital storefront of Festo Wampamba — Full-Stack Software Engineer.",
    images: ["/images/festo-profile.png"],
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased min-h-screen selection:bg-orange-yellow-crayola selection:text-smoky-black bg-smoky-black text-light-gray`}>
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        <Providers>
          {children}
          <AiAssistant />
        </Providers>
      </body>
    </html>
  );
}

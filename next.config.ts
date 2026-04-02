import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling server-only packages that require native Node.js modules.
  // isomorphic-dompurify and jsdom use DOM APIs not available in the bundled server runtime.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom", "dompurify"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

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
  // Baseline security headers applied to every response.
  // CSP is intentionally limited to clickjacking / injection-surface controls
  // (frame-ancestors, object-src, base-uri) so it does not break the inline
  // theme-bootstrap script or third-party analytics. Tighten script-src with a
  // nonce later if a stricter policy is required.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "festoug.com" }],
        destination: "https://www.festoug.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

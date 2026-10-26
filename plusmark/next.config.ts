import path from "node:path";
import type { NextConfig } from "next";

// Pin the project root: a stray package-lock.json in the user's home folder otherwise
// makes Next.js infer the wrong workspace root.
const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  turbopack: { root },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // The deployed Cloudflare image optimizer intermittently fails with HTTP/2 ping errors.
    // Product and marketing assets already use Cloudinary/static caching, so serve the source
    // URL directly instead of routing every image through `/_next/image`.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/drt0rpkn2/image/upload/**",
      },
    ],
    localPatterns: [
      // Product photos carry a content-hash `?v=` cache-buster (see scripts/import-photos.mts).
      { pathname: "/images/products/**" },
      // A+ banners carry the same kind of `?v=` hash (see data/aplus-versions.ts).
      { pathname: "/images/aplus/**" },
      { pathname: "/images/**", search: "" },
    ],
  },
  async redirects() {
    // Canonical host is the apex (see data/company.ts); www is not in DNS, so this only keeps a
    // future www record from splitting the site across two duplicate hosts. It lives here rather
    // than in proxy.ts because Next 16 runs proxies on the Node.js runtime, and OpenNext cannot
    // bundle that for Cloudflare (optional-peer @opentelemetry/api, hoisted by firebase-admin,
    // reaches the output incomplete). A config redirect also costs no Worker CPU per request.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.plusmarkboards.com" }],
        destination: "https://plusmarkboards.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    const document = [{ key: "Cache-Control", value: "no-store, max-age=0" }];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // HTML/RSC responses must not outlive the deployment that produced their hashed JS
      // references. Static assets are overridden below with their long-lived policy.
      { source: "/:path*", headers: document },
      // These assets are content-hashed or immutable Cloudinary-style exports. Keep repeat
      // visits out of the Worker; the import scripts add `?v=` when a local photo is replaced.
      { source: "/_next/static/:path*", headers: immutable },
      { source: "/images/:path*", headers: immutable },
      { source: "/models/:path*", headers: immutable },
      { source: "/draco/:path*", headers: immutable },
    ];
  },
};

export default nextConfig;

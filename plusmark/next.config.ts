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
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    localPatterns: [
      // Product photos carry a content-hash `?v=` cache-buster (see scripts/import-photos.mts).
      { pathname: "/images/products/**" },
      // A+ banners carry the same kind of `?v=` hash (see data/aplus-versions.ts).
      { pathname: "/images/aplus/**" },
      { pathname: "/images/**", search: "" },
    ],
  },
  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/models/:path*", headers: immutable },
      { source: "/draco/:path*", headers: immutable },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

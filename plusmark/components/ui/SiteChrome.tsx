"use client";

import { usePathname } from "next/navigation";

/**
 * Renders public-site chrome (navbar, footer, floating buttons) everywhere except the admin
 * panel and any extra paths listed in `hideOn` (e.g. the design D home, which has its own nav).
 */
export function SiteChrome({ children, hideOn = [] }: { children: React.ReactNode; hideOn?: string[] }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  if (hideOn.includes(pathname)) return null;
  return <>{children}</>;
}

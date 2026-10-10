"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Video, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/clients", label: "Clients", icon: Users },
];

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        mobile
          ? "flex items-center gap-1.5 overflow-x-auto px-4 py-2 bg-white"
          : "flex items-center gap-1"
      )}
    >
      {navLinks.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group relative flex items-center gap-2 rounded-lg font-medium transition-all text-xs sm:text-sm",
              mobile ? "px-3 py-1.5 whitespace-nowrap" : "px-3.5 py-1.5",
              isActive
                ? "bg-fog text-graphite font-semibold shadow-2xs"
                : "text-steel hover:bg-mist hover:text-graphite"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? "text-brand" : "text-steel/70 group-hover:text-graphite"
              )}
            />
            <span>{label}</span>
            {isActive && !mobile && (
              <span className="absolute -bottom-[15px] left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-brand" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

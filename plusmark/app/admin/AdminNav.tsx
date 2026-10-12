"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutDashboard, Package, Video, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Dashboard", desc: "Website overview", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", desc: "Inbox & leads", icon: Inbox },
  { href: "/admin/products", label: "Products", desc: "Catalog & photos", icon: Package },
  { href: "/admin/videos", label: "Videos", desc: "Film reel & product videos", icon: Video },
  { href: "/admin/clients", label: "Clients", desc: "Logos on the home page", icon: Users },
];

function isActive(pathname: string, href: string) {
  // Dashboard is only active on /admin itself, not on every admin page.
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Vertical nav for the desktop sidebar, or a horizontal scroller for phones. */
export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav aria-label="Admin" className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const on = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                on ? "bg-graphite text-white" : "text-steel hover:bg-mist hover:text-graphite",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Admin" className="space-y-1">
      {navLinks.map(({ href, label, desc, icon: Icon }) => {
        const on = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
              on ? "bg-graphite text-white shadow-sm" : "text-graphite hover:bg-mist",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition",
                on ? "bg-white/10 text-white" : "bg-mist text-steel ring-1 ring-fog group-hover:bg-white group-hover:text-graphite",
              )}
            >
              <Icon aria-hidden className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{label}</span>
              <span className={cn("block truncate text-xs", on ? "text-white/60" : "text-steel")}>{desc}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

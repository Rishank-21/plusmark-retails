import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { isAdmin } from "@/lib/admin-auth";
import { logout } from "./actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Plusmark Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const authed = await isAdmin();
  return (
    <div className="min-h-dvh bg-mist">
      {/* Full-Width Executive Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-line bg-white shadow-2xs">
        <div className="flex h-16 w-full items-center justify-between gap-6 px-4 sm:px-8 lg:px-12">
          {/* Brand & Section Indicator */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href={authed ? "/admin" : "/admin/login"}
              className="flex items-center gap-3.5 group focus:outline-none"
            >
              <Logo className="h-7 sm:h-8" />
              <div className="hidden items-center gap-2 sm:flex border-l border-line pl-3.5">
                <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-graphite">
                  Admin Portal
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {authed && (
              <div className="hidden md:flex items-center">
                <AdminNav />
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-graphite hover:bg-mist transition-all shadow-2xs"
            >
              <span>View Website</span>
              <ArrowUpRight className="size-3.5 text-steel" aria-hidden />
            </Link>
            {authed && (
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center gap-2 rounded-lg border border-red-200 bg-red-50/40 px-3 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <LogOut aria-hidden className="size-3.5" />
                  <span>Log out</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Mobile Subnav */}
        {authed && (
          <div className="border-t border-line md:hidden">
            <AdminNav mobile />
          </div>
        )}
      </header>

      {/* Main Content Area - Expansive Full Width */}
      <main className="w-full px-4 sm:px-8 lg:px-12 py-8 md:py-10">
        {children}
      </main>
    </div>
  );
}

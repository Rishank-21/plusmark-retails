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

  // Logged out: just the login card on a calm background.
  if (!authed) {
    return (
      <div className="flex min-h-dvh flex-col bg-mist">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/admin/login" aria-label="Plusmark admin" className="shrink-0">
            <Logo className="h-8 w-auto max-w-none shrink-0" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-medium text-steel hover:text-graphite">
            Back to website <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:pt-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-mist lg:grid lg:grid-cols-[20rem_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-[4.5rem] items-center gap-3 border-b border-line px-6">
          <Link href="/admin" aria-label="Admin home" className="shrink-0">
            {/* Fixed height and no shrinking, so the wordmark never gets squeezed. */}
            <Logo className="h-8 w-auto max-w-none shrink-0" />
          </Link>
          <span className="rounded-md bg-mist px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-steel ring-1 ring-fog">
            Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel">Manage</p>
          <AdminNav />
        </div>
        <div className="space-y-2 border-t border-line p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-graphite transition hover:bg-mist"
          >
            View website
            <ArrowUpRight aria-hidden className="size-4 text-steel" />
            <span className="sr-only">(opens in a new tab)</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 cursor-pointer"
            >
              Log out
              <LogOut aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Phone / tablet top bar */}
        <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/admin" aria-label="Admin home" className="shrink-0">
              <Logo className="h-7 w-auto max-w-none shrink-0" />
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" target="_blank" className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-graphite">
                Website
              </Link>
              <form action={logout}>
                <button type="submit" aria-label="Log out" className="rounded-lg border border-red-200 p-1.5 text-red-600 cursor-pointer">
                  <LogOut aria-hidden className="size-4" />
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-line">
            <AdminNav mobile />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

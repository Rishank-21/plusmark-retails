import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { isAdmin } from "@/lib/admin-auth";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Plusmark Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const authed = await isAdmin();
  return (
    <div className="min-h-dvh bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <Link href={authed ? "/admin" : "/admin/login"} className="flex items-center gap-3">
            <Logo className="h-7 sm:h-7" />
            <span className="hidden border-l border-line pl-3 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel sm:inline">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-3 py-2 text-sm text-steel hover:text-graphite">
              View site
            </Link>
            {authed && (
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-2 px-3 text-sm font-medium text-graphite ring-1 ring-line transition-colors hover:ring-graphite"
                >
                  <LogOut aria-hidden className="size-4" /> Log out
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 md:py-10">{children}</div>
    </div>
  );
}

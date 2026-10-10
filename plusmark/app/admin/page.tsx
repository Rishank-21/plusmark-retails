import Link from "next/link";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Users,
  Video,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart2,
  ArrowUpRight,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { ENQUIRY_STATUSES, enquiryStats, isEnquiryStatus, listEnquiries } from "@/lib/db";
import { firebaseAdminConfigured } from "@/lib/firebase-admin";
import { cn } from "@/lib/utils";
import { EnquiryCard } from "./EnquiryCard";
import { dayLabel, requestNow, statusLabel } from "./ui";

export const metadata = { title: "Admin Dashboard — Plusmark" };

const PAGE_SIZE = 25;

export default async function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();

  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(sp.q).trim().slice(0, 100);
  const statusParam = one(sp.status);
  const status = isEnquiryStatus(statusParam) ? statusParam : undefined;
  const page = Math.max(1, Number.parseInt(one(sp.page), 10) || 1);

  let stats: Awaited<ReturnType<typeof enquiryStats>>;
  let list: Awaited<ReturnType<typeof listEnquiries>>;
  try {
    [stats, list] = await Promise.all([
      enquiryStats(),
      listEnquiries({ q, status, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    ]);
  } catch (err) {
    console.error("[admin] failed to load enquiries", err);
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900"
      >
        <p className="font-semibold text-base mb-1">
          ⚠️ Could not load enquiries from database.
        </p>
        <p className="text-xs text-red-700">
          {firebaseAdminConfigured()
            ? "Check server logs, service account permissions, and database connectivity."
            : "Firebase Admin credentials are not set in the environment."}
        </p>
      </div>
    );
  }
  const { rows, total } = list;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (patch: { q?: string; status?: string; page?: number }) => {
    const p = new URLSearchParams();
    const merged: { q?: string; status?: string; page?: number } = { q: q || undefined, status, ...patch };
    if (merged.q) p.set("q", merged.q);
    if (merged.status) p.set("status", merged.status);
    if (merged.page && merged.page > 1) p.set("page", String(merged.page));
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  const exportHref = `/admin/export${(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    const s = p.toString();
    return s ? `?${s}` : "";
  })()}`;

  const pct = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-line pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-steel">
          Overview of customer enquiries, product catalog, videos, and institutional client logos.
        </p>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          {
            href: "/admin/products",
            label: "Product Catalog",
            desc: "Manage sizes, specs & A+",
            icon: Package,
          },
          {
            href: "/admin/videos",
            label: "Product Videos",
            desc: "Upload & showroom reel",
            icon: Video,
          },
          {
            href: "/admin/clients",
            label: "Client Brands",
            desc: "Homepage institutional logos",
            icon: Users,
          },
          {
            href: exportHref,
            label: "Export CSV",
            desc: "Download enquiries data",
            icon: Download,
          },
        ].map(({ href: cardHref, label, desc, icon: Icon }) => (
          <Link
            key={label}
            href={cardHref}
            className="group relative flex flex-col justify-between rounded-xl border border-line bg-white p-4 transition-all hover:border-slate-300 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-9 items-center justify-center rounded-lg bg-fog text-graphite transition-colors group-hover:bg-mist">
                <Icon className="size-4 text-graphite" />
              </div>
              <ArrowUpRight className="size-4 text-steel/40 transition-colors group-hover:text-graphite" />
            </div>
            <div className="mt-4">
              <p className="font-semibold text-sm text-graphite group-hover:text-brand transition-colors">
                {label}
              </p>
              <p className="text-xs text-steel mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Overview Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {[
          {
            label: "Total Enquiries",
            value: stats.total,
            sub: "All time received",
            icon: BarChart2,
            filter: undefined,
          },
          {
            label: "New Unread",
            value: stats.new,
            sub: stats.new ? "Needs response" : "All caught up ✓",
            icon: AlertCircle,
            filter: "new" as const,
            highlight: stats.new > 0,
          },
          {
            label: "Contacted",
            value: stats.contacted,
            sub: `${pct(stats.contacted)}% of total`,
            icon: Clock,
            filter: "contacted" as const,
          },
          {
            label: "Closed",
            value: stats.closed,
            sub: `${pct(stats.closed)}% completed`,
            icon: CheckCircle,
            filter: "closed" as const,
          },
          {
            label: "Past 7 Days",
            value: stats.last7,
            sub: "Recent volume",
            icon: TrendingUp,
            filter: undefined,
          },
        ].map((c) => {
          const active = status === c.filter;
          return (
            <Link
              key={c.label}
              href={href({ status: c.filter, page: undefined })}
              className={cn(
                "rounded-xl border p-4 transition-all hover:shadow-xs",
                active
                  ? "border-brand bg-accent-soft/40 ring-1 ring-brand/30"
                  : "border-line bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-steel">{c.label}</span>
                <c.icon className={cn("size-3.5", active ? "text-brand" : "text-steel/50")} />
              </div>
              <p className={cn("mt-2 font-display text-2xl font-bold tracking-tight", c.highlight ? "text-red-600" : "text-graphite")}>
                {c.value}
              </p>
              <p className="mt-0.5 text-[11px] text-steel/80">{c.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Enquiries Inbox Section */}
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        {/* Search & Filter Header */}
        <div className="border-b border-line bg-fog/20 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Inbox className="size-4 text-graphite" />
              <h2 className="font-semibold text-sm sm:text-base text-graphite">Enquiry Inbox</h2>
              <span className="rounded-full bg-fog px-2 py-0.5 font-mono text-[11px] text-steel">
                {total}
              </span>
            </div>
            {status && (
              <span className="text-xs font-medium text-brand">
                Filtered: {statusLabel[status]}
              </span>
            )}
          </div>

          <form method="get" action="/admin" role="search">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  aria-hidden
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-steel/60 pointer-events-none"
                />
                <label htmlFor="admin-q" className="sr-only">
                  Search enquiries
                </label>
                <input
                  id="admin-q"
                  name="q"
                  defaultValue={q}
                  placeholder="Search name, phone, email, product..."
                  className="w-full rounded-lg border border-line bg-white pl-10 pr-3.5 py-2 text-xs text-graphite placeholder:text-steel/50 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                />
              </div>

              <select
                id="admin-status"
                name="status"
                defaultValue={status ?? ""}
                className="rounded-lg border border-line bg-white px-3.5 py-2 text-xs text-graphite focus:border-brand focus:ring-1 focus:ring-brand outline-none transition cursor-pointer sm:w-44"
              >
                <option value="">All statuses</option>
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-lg bg-graphite px-4 py-2 text-xs font-semibold text-white hover:bg-black transition cursor-pointer"
              >
                Apply Filter
              </button>

              {(q || status) && (
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-steel hover:bg-fog hover:text-graphite transition"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* List of Enquiries */}
        <div>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Inbox className="size-10 text-steel/40 mb-3" />
              <p className="font-semibold text-sm text-graphite">
                {q || status ? "No enquiries match your search filter." : "No enquiries yet."}
              </p>
              <p className="text-xs text-steel mt-1">
                Submissions from the website quote form will appear here.
              </p>
            </div>
          ) : (
            <div>
              <div className="border-b border-line bg-fog/10 px-5 py-2 text-[11px] text-steel flex justify-between">
                <span>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + rows.length} of {total}
                </span>
                <span>Page {page} of {pages}</span>
              </div>

              {groups(rows, requestNow()).map((g) => (
                <section key={g.key} aria-labelledby={`day-${g.key}`}>
                  <h3
                    id={`day-${g.key}`}
                    className="flex items-center gap-2 border-b border-line bg-fog/30 px-5 py-2 text-[11px] font-mono uppercase tracking-wider text-steel"
                  >
                    <span>{g.label}</span>
                    <span className="flex-1 h-px bg-line" />
                    <span className="font-sans normal-case tracking-normal">
                      {g.rows.length} {g.rows.length === 1 ? "enquiry" : "enquiries"}
                    </span>
                  </h3>
                  <ul className="divide-y divide-line">
                    {g.rows.map((r) => (
                      <li key={r.id}>
                        <EnquiryCard r={r} now={requestNow()} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line bg-fog/20 px-5 py-3 text-xs text-steel">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={href({ page: page - 1 })}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 font-medium text-graphite hover:bg-fog transition"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Previous</span>
                </Link>
              )}
              {page < pages && (
                <Link
                  href={href({ page: page + 1 })}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 font-medium text-graphite hover:bg-fog transition"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function groups(rows: Awaited<ReturnType<typeof listEnquiries>>["rows"], now: number) {
  const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
  const dk = (ms: number) => dayKeyFmt.format(new Date(ms));
  const result: { key: string; label: string; rows: typeof rows }[] = [];
  for (const r of rows) {
    const key = dk(Date.parse(r.createdAt));
    const last = result.at(-1);
    if (last?.key === key) last.rows.push(r);
    else result.push({ key, label: dayLabel(r.createdAt, now), rows: [r] });
  }
  return result;
}

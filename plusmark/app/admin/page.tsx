import Link from "next/link";
import { Download, Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { ENQUIRY_STATUSES, enquiryStats, isEnquiryStatus, listEnquiries } from "@/lib/db";
import { firebaseAdminConfigured } from "@/lib/firebase-admin";
import { cn } from "@/lib/utils";
import { EnquiryCard } from "./EnquiryCard";
import { dayKey, dayLabel, requestNow, statusLabel } from "./ui";

export const metadata = { title: "Enquiries" };

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
      <div role="alert" className="bg-[#fdf0f0] p-6 text-sm leading-relaxed text-[#a3222a] ring-1 ring-[#f3cccc]">
        <p className="font-semibold">Could not load enquiries from Firebase.</p>
        <p className="mt-1">
          {firebaseAdminConfigured()
            ? "Check the server logs, the service-account permissions and the database URL."
            : "Firebase Admin credentials are not set. Add FIREBASE_SERVICE_ACCOUNT (or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY) to the server environment and restart."}
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
  const cards = [
    { label: "Total enquiries", value: stats.total, hint: "All time", filter: undefined, bar: "bg-graphite" },
    { label: "New", value: stats.new, hint: stats.new ? "Waiting for a reply" : "All caught up", filter: "new" as const, bar: "bg-accent" },
    { label: "Contacted", value: stats.contacted, hint: `${pct(stats.contacted)}% of total`, filter: "contacted" as const, bar: "bg-[#d99a00]" },
    { label: "Closed", value: stats.closed, hint: `${pct(stats.closed)}% of total`, filter: "closed" as const, bar: "bg-verdant" },
  ];

  // Group the current page by the day the enquiry arrived (IST), newest first.
  const now = requestNow();
  const groups: { key: string; label: string; rows: typeof rows }[] = [];
  for (const r of rows) {
    const key = dayKey(Date.parse(r.createdAt));
    const last = groups.at(-1);
    if (last?.key === key) last.rows.push(r);
    else groups.push({ key, label: dayLabel(r.createdAt, now), rows: [r] });
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Enquiries</h1>
          <p className="mt-1 text-sm text-steel">
            {stats.last7} received in the last 7 days
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex h-10 items-center gap-2 bg-graphite px-4 text-sm font-semibold text-white transition-colors hover:bg-ink"
        >
          <Download aria-hidden className="size-4" /> Export CSV
        </a>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-px bg-line ring-1 ring-line lg:grid-cols-4">
        {cards.map((c) => {
          const active = status === c.filter;
          return (
            <li key={c.label}>
              <Link
                href={href({ status: c.filter, page: undefined })}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "relative block h-full bg-white p-5 transition-colors hover:bg-fog/40",
                  active && "bg-fog/60 ring-2 ring-inset ring-graphite",
                )}
              >
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", c.bar)} />
                <span className="block font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel">{c.label}</span>
                <span className="mt-2 block font-display text-3xl font-semibold">{c.value}</span>
                <span className="mt-1 block text-xs text-steel">{c.hint}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <form method="get" action="/admin" role="search" className="mt-8 flex flex-wrap gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-alu-dark" />
          <label htmlFor="admin-q" className="sr-only">
            Search enquiries
          </label>
          <input
            id="admin-q"
            name="q"
            defaultValue={q}
            placeholder="Search name, company, phone, email, product or message"
            className="h-10 w-full bg-white pl-9 pr-3 text-sm ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-graphite"
          />
        </div>
        <label htmlFor="admin-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="admin-status"
          name="status"
          defaultValue={status ?? ""}
          className="h-10 bg-white px-3 text-sm ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-graphite"
        >
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 px-4 text-sm font-semibold ring-1 ring-graphite transition-colors hover:bg-graphite hover:text-white">
          Apply
        </button>
        {(q || status) && (
          <Link href="/admin" className="flex h-10 items-center px-2 text-sm text-steel hover:text-graphite">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center bg-white px-6 py-20 text-center ring-1 ring-line">
          <Inbox aria-hidden className="size-8 text-alu-dark" />
          <p className="mt-4 font-semibold">{q || status ? "No enquiries match these filters." : "No enquiries yet."}</p>
          <p className="mt-1 text-sm text-steel">New submissions from the website enquiry form will appear here.</p>
        </div>
      ) : (
        <div className="mt-6">
          <p className="sr-only" aria-live="polite">
            Showing {rows.length} of {total} enquiries{status ? ` with status ${statusLabel[status]}` : ""}
            {q ? ` matching “${q}”` : ""}, page {page} of {pages}
          </p>
          <p aria-hidden className="mb-4 text-sm text-steel">
            Showing <span className="font-semibold text-graphite">{(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + rows.length}</span> of{" "}
            <span className="font-semibold text-graphite">{total}</span>
            {status && <> · {statusLabel[status]}</>}
            {q && <> · matching “{q}”</>}
          </p>

          {groups.map((g) => (
            <section key={g.key} aria-labelledby={`day-${g.key}`} className="mt-6 first:mt-0">
              <h2
                id={`day-${g.key}`}
                className="mb-3 flex items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel"
              >
                {g.label}
                <span className="h-px flex-1 bg-line" aria-hidden />
                <span className="normal-case tracking-normal">
                  {g.rows.length} {g.rows.length === 1 ? "enquiry" : "enquiries"}
                </span>
              </h2>
              <ul className="flex flex-col gap-3">
                {g.rows.map((r) => (
                  <li key={r.id}>
                    <EnquiryCard r={r} now={now} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          <p className="text-steel">
            Page {page} of {pages} · {total} enquiries
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={href({ page: page - 1 })} className="inline-flex h-9 items-center gap-1 bg-white px-3 ring-1 ring-line hover:ring-graphite">
                <ChevronLeft aria-hidden className="size-4" /> Previous
              </Link>
            ) : null}
            {page < pages ? (
              <Link href={href({ page: page + 1 })} className="inline-flex h-9 items-center gap-1 bg-white px-3 ring-1 ring-line hover:ring-graphite">
                Next <ChevronRight aria-hidden className="size-4" />
              </Link>
            ) : null}
          </div>
        </nav>
      )}
    </>
  );
}

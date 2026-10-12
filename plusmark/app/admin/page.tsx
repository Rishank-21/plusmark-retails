import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  ImageOff,
  Inbox,
  Package,
  Plus,
  TrendingUp,
  Video,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { listEnquiries, type EnquiryRecord } from "@/lib/db";
import { firebaseAdminConfigured } from "@/lib/firebase-admin";
import { getCatalog } from "@/lib/catalog";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";
import { getVideos } from "./videos/actions";
import { getClients } from "./clients/actions";
import { PageTitle } from "./PageTitle";
import { StatusBadge, dayKey, requestNow, statusLabel, timeAgo } from "./ui";

export const metadata = { title: "Dashboard" };

const DAY = 24 * 60 * 60 * 1000;
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

export default async function AdminDashboard() {
  await requireAdmin();
  const now = requestNow();

  // Each source is loaded on its own, so one failing (e.g. the database) doesn't blank the page.
  const [enquiriesRes, catalog, videos, clients] = await Promise.all([
    listEnquiries({ limit: 5000 }).then(
      (r) => r.rows,
      (err) => {
        console.error("[admin] dashboard could not load enquiries", err);
        return null;
      },
    ),
    getCatalog(),
    getVideos(),
    getClients(),
  ]);
  const enquiries: EnquiryRecord[] = enquiriesRes ?? [];

  const count = (s: EnquiryRecord["status"]) => enquiries.filter((e) => e.status === s).length;
  const newCount = count("new");
  const since = (days: number) => enquiries.filter((e) => Date.parse(e.createdAt) >= now - days * DAY).length;
  const last7 = since(7);
  const prev7 = since(14) - last7;
  const trend = prev7 ? Math.round(((last7 - prev7) / prev7) * 100) : null;

  // Last 14 days, oldest first.
  const days = Array.from({ length: 14 }, (_, i) => {
    const ms = now - (13 - i) * DAY;
    const key = dayKey(ms);
    return { key, label: dayFmt.format(new Date(ms)), n: enquiries.filter((e) => dayKey(Date.parse(e.createdAt)) === key).length };
  });
  const peak = Math.max(1, ...days.map((d) => d.n));

  const topProducts = Object.entries(
    enquiries.reduce<Record<string, number>>((acc, e) => {
      const name = e.product || "General enquiry";
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topMax = Math.max(1, ...topProducts.map(([, n]) => n));

  const recent = enquiries.slice(0, 6);
  const noPhoto = catalog.filter((p) => !p.image).length;
  const featured = catalog.filter((p) => p.featured).length;
  const clientsNoLogo = clients.filter((c) => !c.logo?.src).length;
  const videosLinked = videos.filter((v) => v.productSlugs?.length).length;

  return (
    <div className="space-y-8">
      <PageTitle title="Dashboard" text="An overview of the website: new leads, the product catalog and the content on the home page.">
        <Link
          href="/"
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium text-graphite shadow-xs transition hover:bg-mist"
        >
          View website <ArrowUpRight aria-hidden className="size-4" />
          <span className="sr-only">(opens in a new tab)</span>
        </Link>
      </PageTitle>

      {enquiriesRes === null && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          {firebaseAdminConfigured()
            ? "Enquiries could not be loaded from the database. Check the server logs."
            : "Firebase Admin credentials are not set, so enquiries can't be shown."}
        </p>
      )}

      {/* Key numbers */}
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi
          href="/admin/enquiries?status=new"
          icon={AlertCircle}
          label="New enquiries"
          value={newCount}
          note={newCount ? "Waiting for a reply" : "All caught up"}
          tone={newCount ? "alert" : "ok"}
        />
        <Kpi
          href="/admin/enquiries"
          icon={TrendingUp}
          label="Last 7 days"
          value={last7}
          note={trend === null ? `${enquiries.length} in total` : `${trend >= 0 ? "+" : ""}${trend}% vs previous week`}
        />
        <Kpi href="/admin/products" icon={Package} label="Products live" value={catalog.length} note={`${categories.length} categories`} />
        <Kpi href="/admin/videos" icon={Video} label="Videos" value={videos.length} note={`${videosLinked} on product pages`} />
        <Kpi href="/admin/clients" icon={Building2} label="Client logos" value={clients.length} note={clientsNoLogo ? `${clientsNoLogo} without a logo` : "All have logos"} />
      </ul>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Activity chart */}
        <Card title="Enquiries, last 14 days" action={<CardLink href="/admin/enquiries">Open inbox</CardLink>}>
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label={`Enquiries per day over the last 14 days: ${days.map((d) => `${d.label} ${d.n}`).join(", ")}`}>
            {days.map((d, i) => (
              <div key={d.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[0.65rem] font-semibold text-graphite opacity-0 transition group-hover:opacity-100">{d.n}</span>
                <span
                  className={cn("w-full rounded-t-md transition-colors", d.n ? "bg-brand/80 group-hover:bg-brand" : "bg-fog")}
                  style={{ height: `${Math.max(4, (d.n / peak) * 100)}%` }}
                />
                <span className={cn("text-[0.6rem] text-steel", i % 2 === 1 && "hidden sm:block")}>{d.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>

          {/* Status split */}
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-fog">
              {(["new", "contacted", "closed"] as const).map((s) => {
                const n = count(s);
                return n ? <span key={s} className={statusBar[s]} style={{ width: `${(n / Math.max(1, enquiries.length)) * 100}%` }} /> : null;
              })}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {(["new", "contacted", "closed"] as const).map((s) => (
                <li key={s}>
                  <Link href={`/admin/enquiries?status=${s}`} className="inline-flex items-center gap-2 text-steel hover:text-graphite">
                    <span aria-hidden className={cn("size-2.5 rounded-full", statusBar[s])} />
                    {statusLabel[s]} <span className="font-semibold text-graphite">{count(s)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Recent */}
        <Card title="Latest enquiries" action={<CardLink href="/admin/enquiries">See all</CardLink>}>
          {recent.length ? (
            <ul className="-mx-2 divide-y divide-line">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-mist">
                    <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                      {initials(e.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-graphite">{e.name || "Unnamed"}</span>
                      <span className="block truncate text-xs text-steel">{e.product || "General enquiry"}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={e.status} />
                      <span className="text-[0.68rem] text-steel">{timeAgo(e.createdAt, now)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={Inbox} text="No enquiries yet. Submissions from the website form will show here." />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Demand */}
        <Card title="Most enquired products" action={<CardLink href="/admin/enquiries">Inbox</CardLink>}>
          {topProducts.length ? (
            <ol className="space-y-3.5">
              {topProducts.map(([name, n], i) => (
                <li key={name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="font-mono text-[0.68rem] text-steel">{String(i + 1).padStart(2, "0")}</span>
                      <span className="truncate font-medium text-graphite">{name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-steel">
                      {n} {n === 1 ? "enquiry" : "enquiries"}
                    </span>
                  </div>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-fog">
                    <span className="block h-full rounded-full bg-flame" style={{ width: `${(n / topMax) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <Empty icon={Package} text="Once enquiries come in, the products people ask about most will be listed here." />
          )}
        </Card>

        {/* Content health */}
        <Card title="Website content">
          <ul className="divide-y divide-line">
            <Health
              href="/admin/products"
              icon={Package}
              label="Products in the catalog"
              value={`${catalog.length}`}
              detail={`${featured} featured on the home page`}
            />
            <Health
              href="/admin/products"
              icon={ImageOff}
              label="Products without a photo"
              value={`${noPhoto}`}
              detail={noPhoto ? "Add photos so they show properly" : "Every product has a photo"}
              ok={!noPhoto}
            />
            <Health href="/admin/videos" icon={Video} label="Videos in the film reel" value={`${videos.length}`} detail={`${videosLinked} also shown on product pages`} />
            <Health
              href="/admin/clients"
              icon={Building2}
              label="Client logos"
              value={`${clients.length}`}
              detail={clientsNoLogo ? `${clientsNoLogo} shown by name only` : "All have logos"}
              ok={!clientsNoLogo}
            />
          </ul>
        </Card>
      </div>

      {/* Quick actions */}
      <section aria-labelledby="quick-title">
        <h2 id="quick-title" className="mb-3 text-sm font-semibold text-graphite">
          Quick actions
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/products?new=1", label: "Add a product", icon: Package },
            { href: "/admin/videos?new=1", label: "Add a video", icon: Video },
            { href: "/admin/clients?new=1", label: "Add a client logo", icon: Building2 },
            { href: "/admin/enquiries?status=new", label: "Reply to new enquiries", icon: Inbox },
          ].map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-steel/30 hover:shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-xl bg-mist text-graphite ring-1 ring-fog transition group-hover:bg-graphite group-hover:text-white">
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="flex-1 text-sm font-semibold text-graphite">{label}</span>
                <Plus aria-hidden className="size-4 text-steel transition group-hover:text-graphite" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const statusBar = { new: "bg-accent", contacted: "bg-[#d99a00]", closed: "bg-verdant" } as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

function Kpi({
  href,
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  note: string;
  tone?: "alert" | "ok";
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "group flex h-full flex-col rounded-2xl border bg-white p-4 transition hover:shadow-sm",
          tone === "alert" ? "border-accent/40 ring-1 ring-accent/15" : "border-line hover:border-steel/30",
        )}
      >
        <span className="flex items-center justify-between">
          <span className="text-xs font-medium text-steel">{label}</span>
          <Icon aria-hidden className={cn("size-4", tone === "alert" ? "text-accent" : "text-steel/60")} />
        </span>
        <span className="mt-2 font-display text-3xl font-bold tracking-tight text-graphite">{value}</span>
        <span className={cn("mt-1 inline-flex items-center gap-1 text-[0.72rem]", tone === "ok" ? "text-verdant" : "text-steel")}>
          {tone === "ok" && <CheckCircle2 aria-hidden className="size-3" />}
          {tone === "alert" && <Clock aria-hidden className="size-3" />}
          {note}
        </span>
      </Link>
    </li>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-graphite">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-graphite">
      {children}
      <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function Health({
  href,
  icon: Icon,
  label,
  value,
  detail,
  ok,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  ok?: boolean;
}) {
  return (
    <li>
      <Link href={href} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-mist">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mist text-steel ring-1 ring-fog">
          <Icon aria-hidden className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-graphite">{label}</span>
          <span className={cn("block text-xs", ok === false ? "text-[#a3222a]" : ok ? "text-verdant" : "text-steel")}>{detail}</span>
        </span>
        <span className="font-display text-xl font-bold text-graphite">{value}</span>
      </Link>
    </li>
  );
}

function Empty({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="size-7 text-steel/40" />
      <p className="mt-2 max-w-xs text-sm text-steel">{text}</p>
    </div>
  );
}

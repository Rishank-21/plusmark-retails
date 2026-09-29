import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Mail, MessageCircle, Package, Phone } from "lucide-react";
import type { EnquiryRecord } from "@/lib/db";
import { cn } from "@/lib/utils";
import { StatusSelect } from "./StatusSelect";
import { Fact, StatusBadge, findProduct, formatDate, formatTime, phoneDigits, productPhoto, timeAgo } from "./ui";

const statusEdge = {
  new: "border-l-accent",
  contacted: "border-l-[#d99a00]",
  closed: "border-l-verdant",
} as const;

/** One enquiry in the admin inbox: who, what they want, and one-click ways to reply. */
export function EnquiryCard({ r, now }: { r: EnquiryRecord; now: number }) {
  const product = findProduct(r.product);
  const photo = product ? productPhoto(product, r.size) : undefined;
  const detail = `/admin/enquiries/${r.id}`;
  const wa = `https://wa.me/${phoneDigits(r.phone)}`;

  return (
    <article
      aria-labelledby={`enq-${r.id}`}
      className={cn(
        "grid gap-4 border-l-4 bg-white p-4 ring-1 ring-line sm:grid-cols-[4.5rem_1fr] md:p-5 lg:grid-cols-[4.5rem_1fr_15rem]",
        statusEdge[r.status],
        r.status === "new" && "bg-accent-soft/20",
      )}
    >
      {/* Product thumbnail */}
      <div className="relative hidden size-[4.5rem] shrink-0 overflow-hidden bg-mist ring-1 ring-fog sm:block">
        {photo ? (
          <Image src={photo} alt="" fill sizes="72px" className="object-contain mix-blend-multiply" />
        ) : (
          <Package aria-hidden className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-alu-dark" />
        )}
      </div>

      {/* Who + what */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 id={`enq-${r.id}`} className="text-base font-semibold">
            <Link href={detail} className="hover:text-accent">
              {r.name || "Unnamed"}
            </Link>
          </h3>
          <StatusBadge status={r.status} />
          <span className="text-xs text-steel" title={formatDate(r.createdAt)}>
            {formatTime(r.createdAt)} · {timeAgo(r.createdAt, now)}
          </span>
        </div>
        {r.company && <p className="mt-0.5 text-sm text-steel">{r.company}</p>}

        <p className="mt-3 text-sm">
          <span className="text-steel">Product: </span>
          <span className="font-medium">{r.product || "Not specified"}</span>
        </p>
        {(r.size || r.quantity || r.requirement) && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Fact label="Size" value={r.size} />
            <Fact label="Qty" value={r.quantity} />
            <Fact label="Need" value={r.requirement} />
          </div>
        )}

        {r.message && (
          <blockquote className="mt-3 border-l-2 border-fog pl-3 text-sm leading-relaxed text-steel">
            <p className="line-clamp-2 break-words">{r.message}</p>
          </blockquote>
        )}
      </div>

      {/* Contact + actions */}
      <div className="flex flex-col gap-3 border-t border-fog pt-4 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <dl className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <dt>
              <Phone aria-hidden className="size-3.5 text-alu-dark" />
              <span className="sr-only">Phone</span>
            </dt>
            <dd>
              <a href={`tel:${r.phone}`} className="font-medium hover:text-accent">
                {r.phone || "—"}
              </a>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>
              <Mail aria-hidden className="size-3.5 text-alu-dark" />
              <span className="sr-only">Email</span>
            </dt>
            <dd className="min-w-0">
              <a href={`mailto:${r.email}`} className="block truncate text-steel hover:text-accent">
                {r.email || "—"}
              </a>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          {r.phone && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold text-verdant ring-1 ring-line hover:ring-verdant"
            >
              <MessageCircle aria-hidden className="size-4" /> WhatsApp
              <span className="sr-only">{r.name} (opens in a new tab)</span>
            </a>
          )}
          <StatusSelect id={r.id} value={r.status} label={`Change status for enquiry from ${r.name}`} />
        </div>

        <Link href={detail} className="inline-flex items-center gap-1 text-sm font-medium text-steel hover:text-graphite">
          Open details <ChevronRight aria-hidden className="size-4" />
          <span className="sr-only">for {r.name}</span>
        </Link>
      </div>
    </article>
  );
}

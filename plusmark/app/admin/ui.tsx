import type { EnquiryStatus } from "@/lib/db-shared";
import type { Product } from "@/data/types";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";

export const statusLabel: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

const statusStyle: Record<EnquiryStatus, string> = {
  new: "bg-accent-soft text-accent",
  contacted: "bg-[#fff4db] text-[#8a5a00]",
  closed: "bg-verdant-soft text-verdant",
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em]", statusStyle[status])}>
      {statusLabel[status]}
    </span>
  );
}

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));

/** Calendar day (YYYY-MM-DD) in IST, used to group enquiries by the day they arrived. */
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
export const dayKey = (ms: number) => dayKeyFmt.format(new Date(ms));

const dayLabelFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** "Today", "Yesterday" or e.g. "Mon, 21 Sep 2026". */
export function dayLabel(iso: string, now: number) {
  const k = dayKey(Date.parse(iso));
  if (k === dayKey(now)) return "Today";
  if (k === dayKey(now - 24 * 60 * 60 * 1000)) return "Yesterday";
  return dayLabelFmt.format(new Date(iso));
}

const timeFmt = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" });
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

/** Request time for server-rendered admin pages (each render is a fresh request). */
export const requestNow = () => Date.now();

/** "5 min ago", "3 h ago", "2 days ago"; older than 30 days falls back to the full date. */
export function timeAgo(iso: string, now: number) {
  const min = Math.floor((now - Date.parse(iso)) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return d === 1 ? "yesterday" : `${d} days ago`;
  return formatDate(iso);
}

/** The catalog product an enquiry refers to (enquiries store the product name). */
export const findProduct = (name: string) => (name ? products.find((p) => p.name === name) : undefined);

/** Photo for the enquired size when the product has one, otherwise the main product photo. */
export function productPhoto(product: Product, size: string) {
  return product.sizeOptions.find((s) => s.label === size)?.image ?? product.image;
}

/** Small labelled value, e.g. SIZE  2 × 4 ft. Renders nothing when empty. */
export function Fact({ label, value, className }: { label: string; value: string; className?: string }) {
  if (!value) return null;
  return (
    <span className={cn("inline-flex items-center gap-2 bg-mist px-2.5 py-1 text-xs ring-1 ring-fog", className)}>
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-steel">{label}</span>
      <span className="font-semibold text-graphite">{value}</span>
    </span>
  );
}

/** Digits-only phone for tel:/wa.me links; assumes India (+91) for bare 10-digit numbers. */
export function phoneDigits(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  if (d.length === 11 && d.startsWith("0")) return `91${d.slice(1)}`;
  return d;
}

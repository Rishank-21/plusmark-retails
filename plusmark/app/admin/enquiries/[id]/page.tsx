import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MessageCircle } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getEnquiry, isEnquiryId } from "@/lib/db";
import { StatusSelect } from "../../StatusSelect";
import { DeleteButton } from "../../DeleteButton";
import { Fact, StatusBadge, findProduct, formatDate, phoneDigits, productPhoto, requestNow, timeAgo } from "../../ui";

export const metadata = { title: "Enquiry" };

export default async function EnquiryDetailPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!isEnquiryId(id)) notFound();
  const e = await getEnquiry(id);
  if (!e) notFound();

  const now = requestNow();
  const product = findProduct(e.product);
  const photo = product ? productPhoto(product, e.size) : undefined;

  const wa = `https://wa.me/${phoneDigits(e.phone)}?text=${encodeURIComponent(
    `Hello ${e.name}, thank you for your enquiry${e.product ? ` about ${e.product}` : ""} on the Plusmark website.`,
  )}`;
  const mail = `mailto:${e.email}?subject=${encodeURIComponent(`Re: Your Plusmark enquiry${e.product ? ` — ${e.product}` : ""}`)}`;

  const fields: [string, string][] = [
    ["Name", e.name],
    ["Company / Institution", e.company],
    ["Phone", e.phone],
    ["Email", e.email],
    ["Product", e.product],
    ["Size", e.size],
    ["Quantity", e.quantity],
    ["Requirement", e.requirement],
  ];

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-steel hover:text-graphite">
        <ArrowLeft aria-hidden className="size-4" /> All enquiries
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold">{e.name}</h1>
            <StatusBadge status={e.status} />
          </div>
          <p className="mt-1 text-sm text-steel">
            Received {formatDate(e.createdAt)} · {timeAgo(e.createdAt, now)}
            {e.company && <> · {e.company}</>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusSelect id={e.id} value={e.status} />
          <DeleteButton id={e.id} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="enq-details" className="bg-white p-6 ring-1 ring-line md:p-8">
          <h2 id="enq-details" className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
            Details
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-alu-dark">{label}</dt>
                <dd className="mt-1 break-words font-medium">{value || <span className="font-normal text-alu-dark">—</span>}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 border-t border-fog pt-6">
            <h3 className="text-xs text-alu-dark">Message</h3>
            <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">
              {e.message || <span className="text-alu-dark">No message.</span>}
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-6">
        {e.product && (
          <section aria-labelledby="enq-product" className="bg-white p-6 ring-1 ring-line md:p-8">
            <h2 id="enq-product" className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
              Enquired product
            </h2>
            {photo && (
              <div className="relative mt-5 aspect-[4/3] overflow-hidden bg-mist ring-1 ring-fog">
                <Image src={photo} alt={product?.imageAlt ?? e.product} fill sizes="(min-width: 1024px) 380px, 100vw" className="object-contain mix-blend-multiply" />
              </div>
            )}
            <p className="mt-4 font-semibold">
              {product ? (
                <Link href={`/products/${product.slug}`} target="_blank" className="hover:text-accent">
                  {e.product}
                  <span className="sr-only"> (opens product page in a new tab)</span>
                </Link>
              ) : (
                e.product
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Fact label="Size" value={e.size} />
              <Fact label="Qty" value={e.quantity} />
              <Fact label="Need" value={e.requirement} />
            </div>
          </section>
        )}
        <section aria-labelledby="enq-reply" className="h-fit bg-white p-6 ring-1 ring-line md:p-8">
          <h2 id="enq-reply" className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
            Reply
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            <a href={`tel:${e.phone}`} className="inline-flex h-11 items-center gap-2 bg-graphite px-4 text-sm font-semibold text-white hover:bg-ink">
              <Phone aria-hidden className="size-4" /> Call {e.phone}
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 px-4 text-sm font-semibold text-verdant ring-1 ring-line hover:ring-verdant"
            >
              <MessageCircle aria-hidden className="size-4" /> WhatsApp
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a href={mail} className="inline-flex h-11 items-center gap-2 px-4 text-sm font-semibold ring-1 ring-line hover:ring-graphite">
              <Mail aria-hidden className="size-4" /> Email {e.email}
            </a>
          </div>
          <p className="mt-6 text-xs text-steel">Tip: set the status to “Contacted” once you have replied.</p>
        </section>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { contactChannels, whatsappHref } from "@/data/company";
import { pad2 } from "@/lib/utils";

/**
 * "Request Enquiry" section that closes product, category and information pages. Laid out like a
 * catalogue sheet, in the same language as the spec tables: what to send, the link to the
 * enquiry form, and the direct channels (phone, WhatsApp, factory).
 */
export function EnquiryBand({
  title = "Planning a classroom, office or institutional fit-out?",
  text = "Share the products, quantities and sizes you need. The Plusmark team will get back to you with the right options.",
  product,
  productName,
}: {
  title?: string;
  text?: string;
  /** Product slug: pre-selects the product in the contact form. */
  product?: string;
  /** Product name, shown in the checklist and the WhatsApp message. */
  productName?: string;
}) {
  const href = `/contact${product ? `?product=${product}` : ""}#enquiry`;
  const message = productName
    ? `Hello Plusmark, I would like a quote for the ${productName}.`
    : "Hello Plusmark, I would like to know more about your products.";
  const checklist = [
    { label: "Product", hint: productName ?? "The board, stand or bench you need, or just its series." },
    { label: "Quantity", hint: "How many pieces, for one site or several." },
    { label: "Size", hint: "A standard size from the range, or your own dimensions." },
    { label: "Delivery city", hint: "Plusmark supplies across India." },
  ];
  const label = "font-mono text-[0.62rem] uppercase tracking-[0.16em] text-alu-dark";

  return (
    <section aria-labelledby="enquiry-band-title" className="border-t border-fog bg-paper">
      <div className="container-x grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal className="flex flex-col">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-alu-dark" />
            Request Enquiry
          </p>
          <h2
            id="enquiry-band-title"
            className="mt-5 max-w-xl font-display text-[clamp(1.85rem,3.3vw,2.75rem)] font-semibold leading-[1.06] text-graphite"
          >
            {title}
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-steel md:text-[1.0625rem]">{text}</p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={href}>Request Enquiry</ButtonLink>
              {/* Product pages only: a refundable demo kit paid online (app/products/[slug]/demo-kit). */}
              {product && (
                <ButtonLink href={`/products/${product}/demo-kit`} variant="secondary">
                  Get a Demo Kit
                </ButtonLink>
              )}
            </div>
            <a
              href={whatsappHref(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 text-sm font-semibold text-graphite"
            >
              <WhatsAppIcon className="size-[1.125rem] text-[#1f9d55] transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="link-underline">Chat on WhatsApp</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          {product && (
            <p className="mt-4 text-sm text-steel">
              Demo kit: ₹600 deposit, refunded once your order is confirmed.
            </p>
          )}

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-fog pt-6 text-sm sm:grid-cols-3 lg:mt-auto lg:pt-7">
            {contactChannels.phone && (
              <div>
                <dt className={label}>Call</dt>
                <dd className="mt-1.5 font-medium text-graphite">
                  <a href={`tel:${contactChannels.phone}`} className="link-underline">
                    {contactChannels.phoneLabel}
                  </a>
                </dd>
              </div>
            )}
            {contactChannels.email && (
              <div className="min-w-0">
                <dt className={label}>Email</dt>
                <dd className="mt-1.5 truncate font-medium text-graphite">
                  <a href={`mailto:${contactChannels.email}`} className="link-underline">
                    {contactChannels.email}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className={label}>Factory</dt>
              <dd className="mt-1.5 font-medium text-graphite">
                <Link href="/contact#location" className="link-underline">
                  Narolgam, Ahmedabad
                </Link>
              </dd>
            </div>
            <div>
              <dt className={label}>Supply</dt>
              <dd className="mt-1.5 font-medium text-graphite">Pan India · GEM approved</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="rounded-[var(--card-radius,0px)] bg-mist px-6 pb-3 pt-6 ring-1 ring-fog sm:px-8 sm:pt-8">
            <h3 className="eyebrow">What to include</h3>
            <ol className="mt-3 divide-y divide-line">
              {checklist.map((c, i) => (
                <li key={c.label} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-4">
                  <span aria-hidden className="pt-[0.2rem] font-mono text-[0.68rem] text-alu-dark">
                    {pad2(i + 1)}
                  </span>
                  <div>
                    <p className="font-medium text-graphite">{c.label}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-steel">{c.hint}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

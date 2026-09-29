import Link from "next/link";
import { MessageCircle, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { allFaqs, faqGroups } from "@/data/faq";
import { contactChannels, whatsappHref } from "@/data/company";
import { buildMetadata } from "@/lib/seo";
import { faqSchema } from "@/lib/structured-data";

export const metadata = buildMetadata({
  title: "FAQ — White Boards, Chalk Boards, Notice Boards & Ordering",
  description:
    "Answers to common questions about Plusmark boards: series differences, HPL vs melamine, magnetic vs ceramic, sizes, customisation, Pan India supply, GEM Portal approval and warranty.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(allFaqs)} />
      <PageHeader
        crumbs={[{ name: "FAQ", path: "/faq" }]}
        eyebrow="Help Centre"
        title={
          <>
            Questions, <span className="text-gradient">answered.</span>
          </>
        }
        intro="Everything schools, institutions, offices and dealers usually ask before ordering — from choosing the right board series to supply, customisation and warranty."
      />

      <section aria-label="Frequently asked questions" className="bg-white py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="FAQ topics">
              <p className="eyebrow mb-4">Topics</p>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {faqGroups.map((g) => (
                  <li key={g.id}>
                    <a
                      href={`#${g.id}`}
                      className="flex items-center justify-between gap-3 rounded-full px-4 py-2 text-sm font-medium text-steel ring-1 ring-fog transition-colors hover:bg-mist hover:text-graphite lg:rounded-xl lg:ring-0"
                    >
                      {g.title}
                      <span className="font-mono text-[0.65rem] text-alu-dark">{String(g.items.length).padStart(2, "0")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="card-premium mt-8 hidden !transform-none p-6 lg:block">
              <p className="font-display text-lg font-semibold">Still have a question?</p>
              <p className="mt-2 text-sm leading-relaxed text-steel">Our team replies quickly on WhatsApp and phone.</p>
              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={whatsappHref("Hi Plusmark, I have a question about your boards.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1f7a5a] text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <MessageCircle aria-hidden className="size-4" /> WhatsApp us
                </a>
                <a
                  href={`tel:${contactChannels.phone}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-graphite ring-1 ring-line transition hover:bg-mist"
                >
                  <PhoneCall aria-hidden className="size-4" /> {contactChannels.phoneLabel}
                </a>
              </div>
            </div>
          </aside>

          <div className="space-y-16">
            {faqGroups.map((g, gi) => (
              <Reveal as="section" key={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-28" id={g.id}>
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="font-mono text-xs text-alu-dark">{String(gi + 1).padStart(2, "0")}</span>
                  <h2 id={`${g.id}-title`} className="font-display text-2xl font-semibold md:text-3xl">
                    {g.title}
                  </h2>
                </div>
                <FaqAccordion items={g.items} openFirst={gi === 0} />
              </Reveal>
            ))}
            <p className="text-sm text-steel">
              Not sure which board fits your space? Read the{" "}
              <Link href="/buying-guide" className="font-semibold text-accent underline-offset-4 hover:underline">
                Buying Guide
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}

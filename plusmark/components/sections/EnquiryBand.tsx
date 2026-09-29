import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";

export function EnquiryBand({
  title = "Planning a classroom, office or institutional fit-out?",
  text = "Share the products, quantities and sizes you need. The Plusmark team will get back to you with the right options.",
  product,
}: {
  title?: string;
  text?: string;
  product?: string;
}) {
  return (
    <section className="bg-white px-3 py-10 md:px-6 md:py-14" aria-labelledby="enquiry-band-title">
      <div className="noise relative mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-deep via-graphite to-ink text-white shadow-[var(--shadow-lift)] md:rounded-[2.5rem]">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full bg-flame/25 blur-[110px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-[26rem] rounded-full bg-accent/30 blur-[110px]" />
        <div aria-hidden className="grid-lines absolute inset-0 opacity-[0.12] invert [mask-image:radial-gradient(70%_80%_at_50%_50%,black,transparent)]" />
        <div className="container-x relative grid items-end gap-10 py-16 md:grid-cols-[1fr_auto] md:py-20">
          <Reveal>
            <p className="chip chip-dark mb-6">
              <span aria-hidden className="chip-dot" />
              Request Enquiry
            </p>
            <h2 id="enquiry-band-title" className="max-w-2xl font-display text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08]">
              {title}
            </h2>
            <p className="mt-5 max-w-xl text-alu">{text}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ButtonLink href={`/contact${product ? `?product=${product}` : ""}#enquiry`} variant="light" magnetic>
              Request Enquiry
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

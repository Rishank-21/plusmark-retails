import { BadgeCheck, MapPinned, Factory, Building2 } from "lucide-react";
import { company } from "@/data/company";
import { Reveal } from "@/components/animations/Reveal";

const pillars = [
  { icon: MapPinned, title: "Pan India Supply", text: "Plusmark operates across India and supplies products nationwide." },
  { icon: Factory, title: "Made in India", text: "An Indian manufacturing brand specializing in educational and institutional products." },
  { icon: BadgeCheck, title: "GEM Portal Approved", text: "Authorized for school and government supplies." },
  { icon: Building2, title: "Institutional Supply", text: "Trusted by schools, institutions and government organizations across India." },
];

export function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="noise relative overflow-hidden bg-gradient-to-br from-brand-deep via-graphite to-ink py-24 text-white md:py-32">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-[0.12] invert [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -left-32 top-10 size-[30rem] rounded-full bg-accent/25 blur-[120px]" />
      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <Reveal>
            <p className="chip chip-dark mb-6">
              <span aria-hidden className="chip-dot" /> Pan India Presence &amp; Government Trust
            </p>
            <h2 id="trust-title" className="font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.04]">
              Best Quality. <span className="text-gradient-light">Best Rate.</span>
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-alu">{company.panIndia}</p>
          </Reveal>
          <ul className="grid gap-3 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.07} className="card-dark group p-7 transition-colors duration-500 hover:bg-white/[0.07]">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
                  <p.icon aria-hidden className="size-5 text-alu transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:text-flame" />
                </span>
                <h3 className="mt-6 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-alu">{p.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

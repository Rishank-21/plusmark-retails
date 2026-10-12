import { BadgeCheck, CalendarCheck, Factory, MapPinned } from "lucide-react";
import { company } from "@/data/company";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";

/** Facts are catalog statements, not metrics. */
const facts = [
  { icon: CalendarCheck, k: "Established", v: String(company.established), note: "Over a decade of manufacturing" },
  { icon: Factory, k: "Origin", v: "Made in India", note: "Own factory in Ahmedabad" },
  { icon: MapPinned, k: "Reach", v: "Pan India", note: "Supplied nationwide" },
  { icon: BadgeCheck, k: "Supply", v: "GEM Approved", note: "School & government supply" },
];

export function AboutSection({ full = false }: { full?: boolean }) {
  return (
    <section aria-labelledby="about-title" className="relative overflow-hidden bg-mist py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-brand/[0.06] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-flame/[0.07] blur-3xl" />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            id="about-title"
            title={
              <>
                Quality jo <span className="text-accent">pehchaan</span> ban jaaye.
              </>
            }
          />
          {/* Lead paragraph reads larger; the rest follows at body size. */}
          <p className="mt-8 text-lg leading-relaxed text-graphite md:text-xl">{company.about[0]}</p>
          <div className="mt-5 space-y-5 text-base leading-relaxed text-steel">
            {company.about.slice(1).map((p) => (
              <p key={p}>{p}</p>
            ))}
            {full && <p>{company.expansion}</p>}
          </div>

          <div className="mt-8 rounded-2xl border-l-4 border-flame bg-white px-6 py-5 shadow-[var(--shadow-soft)]">
            <p className="font-display text-lg font-semibold text-graphite">{company.tagline}</p>
            <p className="mt-1 text-sm text-steel">Durable products at the best market rates, delivered on time.</p>
          </div>

          {!full && (
            <div className="mt-10">
              <ButtonLink href="/about" variant="secondary">
                More about Plusmark
              </ButtonLink>
            </div>
          )}
        </Reveal>

        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-3 sm:gap-4">
            {facts.map((f, i) => (
              <Reveal
                key={f.k}
                delay={i * 0.06}
                className="group rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-fog transition-[transform,box-shadow] duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-accent text-white shadow-[var(--shadow-glow)] transition-transform duration-500 group-hover:scale-105">
                  <f.icon aria-hidden className="size-5" />
                </span>
                <dt className="mt-5 text-xs font-medium text-steel">{f.k}</dt>
                <dd className="mt-1">
                  <span className="block font-display text-xl font-semibold leading-tight text-graphite md:text-2xl">{f.v}</span>
                  <span className="mt-1 block text-xs text-steel">{f.note}</span>
                </dd>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.12} className="rounded-2xl bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-fog">
            <h3 className="text-sm font-semibold text-graphite">What we manufacture</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {company.manufacturingRange.map((r) => (
                <li key={r} className="rounded-full bg-mist px-3.5 py-1.5 text-sm font-medium text-graphite ring-1 ring-fog">
                  {r}
                </li>
              ))}
            </ul>
            {!full && <p className="mt-5 border-t border-fog pt-4 text-sm leading-relaxed text-steel">{company.expansion}</p>}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

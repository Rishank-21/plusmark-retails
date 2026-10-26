import { company } from "@/data/company";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";

/** Facts are catalog statements, not metrics. */
const facts = [
  { k: "Established", v: String(company.established), note: "Over a decade" },
  { k: "Origin", v: "Made in India", note: "Own factory" },
  { k: "Reach", v: "Pan India", note: "Supplied nationwide" },
  { k: "Supply", v: "GEM Approved", note: "Schools & government" },
];

export function AboutSection({ full = false }: { full?: boolean }) {
  return (
    <section aria-labelledby="about-title" className="relative overflow-hidden bg-mist py-24 md:py-32">
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
          <div className="mt-8 max-w-xl space-y-4 text-base leading-relaxed text-steel md:text-lg">
            <p>{company.about[0]}</p>
            {full && <p>{company.about[1]}</p>}
          </div>

          <div className="mt-7">
            <p className="font-display text-lg font-semibold text-graphite">{company.tagline}</p>
            <p className="mt-1 text-sm text-steel">Durable products, fair rates, delivered on time.</p>
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
          <dl className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4 lg:grid-cols-2">
            {facts.map((f, i) => (
              <Reveal
                key={f.k}
                delay={i * 0.06}
                className="group"
              >
                <dt className="text-xs font-medium uppercase tracking-[0.14em] text-steel">{f.k}</dt>
                <dd className="mt-2">
                  <span className="block font-display text-xl font-semibold leading-tight text-graphite md:text-2xl">{f.v}</span>
                  <span className="mt-1 block text-xs text-steel">{f.note}</span>
                </dd>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.12} className="pt-3">
            <h3 className="text-sm font-semibold text-graphite">What we manufacture</h3>
            <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm text-steel sm:grid-cols-2">
              {company.manufacturingRange.map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
                  {r}
                </li>
              ))}
            </ul>
            {full && <p className="mt-5 max-w-xl text-sm leading-relaxed text-steel">{company.expansion}</p>}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

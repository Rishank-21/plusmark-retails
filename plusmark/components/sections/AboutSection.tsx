import { company } from "@/data/company";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";

/** Facts are catalog statements, not metrics. */
const facts = [
  { k: "Established", v: String(company.established) },
  { k: "Origin", v: "Made in India" },
  { k: "Reach", v: "Pan India" },
  { k: "Supply", v: "GEM Portal Approved" },
];

export function AboutSection({ full = false }: { full?: boolean }) {
  return (
    <section aria-labelledby="about-title" className="relative overflow-hidden bg-mist py-24 md:py-32">
      <div className="container-x grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <Reveal>
          <SectionHeading
            id="about-title"
            eyebrow="About Plusmark"
            title={
              <>
                Quality jo <span className="text-accent">pehchaan</span> ban jaaye.
              </>
            }
          />
          <div className="mt-8 space-y-5 text-base leading-relaxed text-steel md:text-lg">
            {company.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {full && <p>{company.expansion}</p>}
          </div>
          {!full && (
            <div className="mt-10">
              <ButtonLink href="/about" variant="secondary">
                About Plusmark
              </ButtonLink>
            </div>
          )}
        </Reveal>

        <div className="flex flex-col justify-between gap-10">
          <dl className="grid grid-cols-2 gap-px bg-line ring-1 ring-line">
            {facts.map((f, i) => (
              <Reveal key={f.k} delay={i * 0.06} className="bg-white p-6 md:p-8">
                <dt className="eyebrow !text-[0.6rem]">{f.k}</dt>
                <dd className="mt-3 font-display text-2xl font-semibold leading-tight md:text-3xl">{f.v}</dd>
              </Reveal>
            ))}
          </dl>
          <Reveal delay={0.1}>
            <h3 className="eyebrow mb-4">Our Manufacturing Range</h3>
            <ul className="flex flex-wrap gap-2">
              {company.manufacturingRange.map((r) => (
                <li key={r} className="bg-white px-3.5 py-2 text-sm font-medium ring-1 ring-line">
                  {r}
                </li>
              ))}
            </ul>
            {!full && <p className="mt-6 text-sm leading-relaxed text-steel">{company.expansion}</p>}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

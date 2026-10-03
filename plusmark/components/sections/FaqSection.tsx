import { Plus } from "lucide-react";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { allFaqs, faqGroups } from "@/data/faq";
import { faqSchema } from "@/lib/structured-data";

/** Full FAQ list on the home page. */
export function FaqSection() {
  return (
    <section
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-mist py-24 md:py-32"
    >
      <JsonLd data={faqSchema(allFaqs)} />
      <div aria-hidden className="aurora opacity-70" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.3fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title={
              <>
                Good questions,{" "}
                <span className="text-gradient">clear answers.</span>
              </>
            }
            intro="The things buyers ask most before choosing a board — series, surfaces, customisation, supply and warranty."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/buying-guide" variant="secondary">
              Buying Guide
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="border-t border-line">
            {faqGroups.map((group, i) => (
              <details key={group.id} open={i === 0} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden md:py-6">
                  <span className="flex items-center gap-4">
                    <span className="font-mono text-xs text-alu-dark">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-lg font-semibold text-graphite md:text-xl">{group.title}</span>
                    <span className="hidden rounded-full bg-white px-2.5 py-1 font-mono text-[0.65rem] text-alu-dark ring-1 ring-fog sm:inline-flex">
                      {String(group.items.length).padStart(2, "0")} questions
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-graphite ring-1 ring-fog transition-[transform,background-color,color] duration-500 group-open:rotate-45 group-open:bg-graphite group-open:text-white"
                  >
                    <Plus className="size-4" />
                  </span>
                </summary>
                <div className="pb-7 pt-1 md:pb-9">
                  <FaqAccordion items={group.items} className="grid gap-3 md:grid-cols-2 !space-y-0" />
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

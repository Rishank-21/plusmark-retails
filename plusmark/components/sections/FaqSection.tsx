import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { featuredFaqs } from "@/data/faq";
import { faqSchema } from "@/lib/structured-data";

/** Home-page FAQ preview; the full list lives at /faq. */
export function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className="relative overflow-hidden bg-mist py-24 md:py-32">
      <JsonLd data={faqSchema(featuredFaqs)} />
      <div aria-hidden className="aurora opacity-70" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.3fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title={
              <>
                Good questions, <span className="text-gradient">clear answers.</span>
              </>
            }
            intro="The things buyers ask most before choosing a board — series, surfaces, customisation, supply and warranty."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/faq">View all FAQs</ButtonLink>
            <ButtonLink href="/buying-guide" variant="secondary">
              Buying Guide
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <FaqAccordion items={featuredFaqs} openFirst />
        </Reveal>
      </div>
    </section>
  );
}

import { aplusLines } from "@/data/aplus";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { AplusShowcase } from "./AplusShowcase";

/** Home page: every Plusmark Retail line, explained with its Amazon A+ banners. */
export function AplusSection() {
  return (
    <section aria-labelledby="aplus-title" className="py-24 md:py-32">
      <div className="container-x">
        <Reveal className="mb-12">
          <SectionHeading
            id="aplus-title"
            eyebrow="Plusmark Retail · Product highlights"
            title={
              <>
                Every board, <span className="text-gradient">explained.</span>
              </>
            }
            intro="Features, mounting options, corners, surfaces, sizes and everyday uses for all six Plusmark Retail lines, straight from our Amazon listings."
          />
        </Reveal>
        <Reveal>
          <AplusShowcase lines={aplusLines} />
        </Reveal>
      </div>
    </section>
  );
}

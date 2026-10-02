import { aplusLines } from "@/data/aplus";
import { Reveal } from "@/components/animations/Reveal";
import { AplusShowcase } from "@/components/sections/AplusShowcase";

/** Design E: the auto-playing Amazon A+ banner showcase ("Every board, explained."), in E's type system. */
export function ShowroomAplus({ id = "xe-aplus" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative z-10 scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-[110rem] px-5 sm:px-10 lg:pr-24">
        <Reveal className="mb-12 max-w-3xl">
          <p className="xd-eyebrow">Plusmark Retail · Product highlights</p>
          <h2
            id={`${id}-title`}
            className="mt-4 font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite"
          >
            Every board, <span className="xd-grad-text">explained.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
            Features, mounting options, corners, surfaces, sizes and everyday uses for all six Plusmark Retail lines, straight from our Amazon listings.
          </p>
        </Reveal>
        <Reveal>
          <AplusShowcase lines={aplusLines} />
        </Reveal>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { School, GraduationCap, Truck, Factory, Presentation, Landmark, ArrowRight } from "lucide-react";
import { industries } from "@/data/industries";
import { getProduct } from "@/data/products";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { TiltCard } from "./IndustryCard";
import { pad2 } from "@/lib/utils";

const ICONS = {
  school: School,
  graduation: GraduationCap,
  truck: Truck,
  factory: Factory,
  presentation: Presentation,
  landmark: Landmark,
};

export function IndustriesSection({ headingLevel = "h2", showHeading = true }: { headingLevel?: "h1" | "h2"; showHeading?: boolean }) {
  return (
    <section aria-labelledby="industries-title" className="bg-white py-24 md:py-32">
      <div className="container-x">
        {showHeading && (
          <Reveal className="mb-14">
            <SectionHeading
              as={headingLevel}
              id="industries-title"
              eyebrow="Industries & Applications"
              title="Trusted where learning and work happen."
              intro="Plusmark has earned long-term trust from schools, institutions and government organizations across India."
            />
          </Reveal>
        )}
        {!showHeading && <h2 id="industries-title" className="sr-only">Industries served</h2>}
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => {
            const Icon = ICONS[ind.icon];
            const lead = getProduct(ind.products[0]);
            return (
              <Reveal as="li" key={ind.slug} delay={(i % 3) * 0.08} id={ind.slug} className="scroll-mt-24">
                <TiltCard className="group h-full">
                  <article className="flex h-full flex-col overflow-hidden bg-mist ring-1 ring-fog transition-colors duration-500 group-hover:bg-white">
                    <div className="relative h-44 overflow-hidden">
                      {lead && (
                        <Image
                          src={lead.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                          className="object-contain mix-blend-multiply transition-transform duration-[900ms] ease-[var(--ease-premium)] group-hover:-translate-y-2 group-hover:scale-110"
                        />
                      )}
                      <span className="absolute left-5 top-5 flex size-10 items-center justify-center bg-white text-graphite ring-1 ring-fog transition-colors duration-500 group-hover:bg-graphite group-hover:text-white">
                        <Icon aria-hidden className="size-4.5" />
                      </span>
                      <span className="absolute right-5 top-5 font-mono text-[0.62rem] text-steel">{pad2(i + 1)}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl font-semibold transition-transform duration-500 group-hover:translate-x-1">
                        {ind.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-steel">{ind.summary}</p>
                      <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-[0.8rem]">
                        {ind.products.map((slug) => {
                          const p = getProduct(slug);
                          return p ? (
                            <li key={slug}>
                              <Link href={`/products/${slug}`} className="group/l inline-flex items-center gap-1.5 font-medium text-graphite hover:text-accent">
                                {p.name}
                                <ArrowRight aria-hidden className="size-3 opacity-0 transition-all group-hover/l:translate-x-0.5 group-hover/l:opacity-100" />
                              </Link>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

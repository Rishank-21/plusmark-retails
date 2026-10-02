import Link from "next/link";
import Image from "next/image";
import { School, GraduationCap, Truck, Factory, Presentation, Landmark } from "lucide-react";
import { industries } from "@/data/industries";
import { getProduct } from "@/data/products";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { TiltCard } from "./IndustryCard";
import { cn, pad2 } from "@/lib/utils";

const ICONS = {
  school: School,
  graduation: GraduationCap,
  truck: Truck,
  factory: Factory,
  presentation: Presentation,
  landmark: Landmark,
};

export function IndustriesSection({
  headingLevel = "h2",
  showHeading = true,
  id,
  className,
}: {
  headingLevel?: "h1" | "h2";
  showHeading?: boolean;
  /** Section anchor (used by the experience/showroom chapter nav). */
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby="industries-title" className={cn("bg-white py-24 md:py-32", className)}>
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
            return (
              <Reveal as="li" key={ind.slug} delay={(i % 3) * 0.08} id={ind.slug} className="scroll-mt-24">
                <TiltCard className="group h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-fog shadow-[0_1px_2px_rgb(15_17_19/0.04),0_24px_48px_-36px_rgb(15_17_19/0.35)] transition-shadow duration-500 group-hover:shadow-[0_1px_2px_rgb(15_17_19/0.05),0_32px_64px_-32px_rgb(15_17_19/0.4)]">
                    {/* real scene: the board in use in this kind of space */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                      <Image
                        src={ind.image}
                        alt={ind.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]"
                      />
                      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
                      <span className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-xl bg-white text-accent shadow-[0_6px_16px_-6px_rgb(15_17_19/0.35)] transition-colors duration-500 group-hover:bg-accent group-hover:text-white">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span className="absolute bottom-3 right-4 font-mono text-[0.66rem] font-medium text-white/90">{pad2(i + 1)}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl font-semibold text-graphite transition-colors duration-500 group-hover:text-accent">
                        {ind.name}
                      </h3>
                      <p className="mb-5 mt-3 text-sm leading-relaxed text-steel">{ind.summary}</p>
                      <ul className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-line pt-4 text-[0.78rem] [&>li+li]:before:mr-2.5 [&>li+li]:before:text-line [&>li+li]:before:content-['|']">
                        {ind.products.map((slug) => {
                          const p = getProduct(slug);
                          return p ? (
                            <li key={slug} className="inline-flex items-center">
                              <Link href={`/products/${slug}`} className="font-medium text-accent transition-colors hover:text-graphite hover:underline">
                                {p.name}
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

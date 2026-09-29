import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { customCapabilities } from "@/data/custom";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";
import { pad2 } from "@/lib/utils";

export function CustomTeaser() {
  return (
    <section aria-labelledby="custom-title" className="bg-mist py-24 md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="custom-title"
            eyebrow="Custom Solutions"
            title="Made to your layout."
            intro="Folder sizes, fabric colours, line layouts and schedule board designs — built to the requirements you share."
          />
          <div className="mt-10">
            <ButtonLink href="/custom-solutions" variant="secondary">
              Explore Custom Solutions
            </ButtonLink>
          </div>
        </Reveal>
        <ul className="divide-y divide-line border-y border-line">
          {customCapabilities.map((c, i) => (
            <Reveal as="li" key={c.key} delay={i * 0.04}>
              <Link href={`/products/${c.product}`} className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-4 py-6">
                <span className="pt-1 font-mono text-[0.66rem] text-alu-dark">{pad2(i + 1)}</span>
                <span>
                  <span className="block font-display text-lg font-semibold transition-colors group-hover:text-accent">{c.title}</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-steel">{c.text}</span>
                </span>
                <ArrowUpRight aria-hidden className="mt-1 size-4 text-alu-dark transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileImage, FileText, PenTool } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { Reveal } from "@/components/animations/Reveal";
import { customCapabilities, scheduleBoardRequirements } from "@/data/custom";
import { getProduct } from "@/data/products";
import { buildMetadata } from "@/lib/seo";
import { pad2 } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Custom Solutions — Custom Boards, Layouts & Schedule Boards",
  description:
    "Custom folder sizes, fabric colours and layouts, combination boards, practice board line layouts and dry wipe schedule boards in any design and any size from Plusmark.",
  path: "/custom-solutions",
});

const formatIcons = [PenTool, FileImage, FileText];

export default function CustomSolutionsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Custom Solutions", path: "/custom-solutions" }]}
        eyebrow="Custom Solutions"
        title="Made to your requirement."
        intro="Several Plusmark boards are built to the size, layout or colour you specify. Here is what can be customised, as described in the Plusmark catalog."
      />

      <section aria-labelledby="capabilities-title" className="bg-white py-20 md:py-28">
        <div className="container-x">
          <h2 id="capabilities-title" className="sr-only">Customisation capabilities</h2>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {customCapabilities.map((c, i) => {
              const p = getProduct(c.product);
              return (
                <Reveal as="li" key={c.key} delay={(i % 3) * 0.06}>
                  <article className="group relative flex h-full flex-col bg-mist ring-1 ring-fog transition-colors hover:bg-white">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {p && (
                        <Image src={p.image} alt="" fill sizes="(min-width:1024px) 30vw, 100vw" className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
                      )}
                      <span className="absolute left-5 top-5 font-mono text-[0.62rem] text-steel">{pad2(i + 1)}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl font-semibold">{c.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-steel">{c.text}</p>
                      {p && (
                        <Link href={`/products/${p.slug}`} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold after:absolute after:inset-0">
                          {p.name} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="schedule-title" className="bg-graphite py-24 text-white md:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="eyebrow !text-alu mb-5">Dry Wipe Schedule Board</p>
            <h2 id="schedule-title" className="font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.04]">
              Any design. <span className="text-alu">Any size.</span>
            </h2>
            <p className="mt-6 max-w-lg text-alu">{scheduleBoardRequirements.intro}</p>
            <p className="mt-6 max-w-lg text-sm text-alu-dark">{scheduleBoardRequirements.note}</p>
            <Link href="/contact?product=dry-wipe-schedule-board#enquiry" className="group mt-10 inline-flex h-12 items-center gap-3 bg-white px-6 text-sm font-semibold text-graphite">
              Enquire about a schedule board
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <div className="space-y-10">
            <Reveal>
              <h3 className="eyebrow !text-alu-dark mb-5">Provide before ordering</h3>
              <ol className="divide-y divide-white/10 border-y border-white/10">
                {scheduleBoardRequirements.items.map((item, i) => (
                  <li key={item} className="flex items-center gap-5 py-5">
                    <span className="font-mono text-xs text-alu-dark">{pad2(i + 1)}</span>
                    <span className="font-display text-lg">{item}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="eyebrow !text-alu-dark mb-5">Sketch file formats</h3>
              <ul className="grid grid-cols-3 gap-px bg-white/10">
                {scheduleBoardRequirements.formats.map((f, i) => {
                  const Icon = formatIcons[i];
                  return (
                    <li key={f} className="bg-graphite p-5">
                      <Icon aria-hidden className="size-5 text-alu" />
                      <p className="mt-4 text-sm font-semibold">{f}</p>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <EnquiryBand title="Have a custom size or layout in mind?" text="Share the quantity, sizes and a sketch of your requirement with the Plusmark team." />
    </>
  );
}

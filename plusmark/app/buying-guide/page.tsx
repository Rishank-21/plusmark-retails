import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal } from "@/components/animations/Reveal";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { faqGroups } from "@/data/faq";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Board Buying Guide — Choose the Right Series, Surface & Size",
  description:
    "Compare Plusmark Metallic Premium, Eco Premium, Deluxe Standard and Eco Regular boards, and choose between HPL, melamine, chalk, magnetic, ceramic and notice board surfaces.",
  path: "/buying-guide",
});

/** Series comparison — wording taken from the product catalog descriptions. */
const series = [
  {
    name: "Metallic Premium",
    badge: "Best for intensive use",
    corners: "Signature Dual-Tone Corners",
    frame: "Heavy-duty aluminium anodized frame",
    surface: "High Gloss Marker Grade HPL / Hardcore Chalk Grade HPL",
    use: "Intensive daily institutional use",
    highlight: true,
  },
  {
    name: "Eco Premium",
    badge: "Best value premium",
    corners: "ABS Dual-Tone Corner Design",
    frame: "Aluminium anodized frame",
    surface: "High Gloss Marker Grade HPL / Hardcore Chalk Grade HPL",
    use: "Regular, daily institutional use",
  },
  {
    name: "Deluxe Standard",
    badge: "Everyday professional",
    corners: "Electroplated Chrome Corners",
    frame: "Clean, professional frame",
    surface: "High Gloss Melamine / Chalk Grade HPL",
    use: "Dependable for everyday use",
  },
  {
    name: "Eco Regular",
    badge: "Budget friendly",
    corners: "Standard plastic corners",
    frame: "Lightweight frame, easy to install",
    surface: "High Gloss Melamine",
    use: "Light use & budget applications",
  },
];

const surfaces = [
  {
    title: "Marker Grade HPL",
    text: "Ultra-smooth, high-gloss surface for effortless writing and easy erasing. Highly resistant to wear.",
    fit: "Classrooms, boardrooms, coaching centres",
    href: "/products/white-boards",
    swatch: "bg-gradient-to-br from-white to-[#eef1f4]",
  },
  {
    title: "Chalk Grade HPL",
    text: "Non-reflective and glare-free with clear visibility from all angles; Hardcore grade adds scratch resistance.",
    fit: "Schools & colleges using chalk",
    href: "/products/chalk-boards",
    swatch: "bg-gradient-to-br from-[#2f5f5f] to-[#173a3a]",
  },
  {
    title: "Resin Coated Steel",
    text: "Magnetic surface that accepts magnets, charts and holders — in white (marker) and green (chalk).",
    fit: "Planning walls, labs, offices",
    href: "/products/magnetic-boards",
    swatch: "bg-gradient-to-br from-[#f7f8f9] to-[#d9dde2]",
  },
  {
    title: "Ceramic Steel",
    text: "Hard, non-porous porcelain enamel steel for continuous writing and frequent cleaning — very long life.",
    fit: "High-traffic institutions",
    href: "/products/ceramic-boards",
    swatch: "bg-gradient-to-br from-white to-[#e4e7ea]",
  },
  {
    title: "Blazer / Velvet Cloth",
    text: "2 mm Blazer Cloth or Super Fine Velvet Cloth over soft, pin-friendly cores, in multiple colours.",
    fit: "Notices, circulars, displays",
    href: "/products/notice-boards",
    swatch: "bg-gradient-to-br from-[#1b2150] to-[#0c1036]",
  },
];

const sizeTips = [
  { size: "1 × 1 – 1.5 × 2 ft", use: "Desks, cabins, reception counters, small notices" },
  { size: "2 × 2 – 2 × 3 ft", use: "Offices, staff rooms, tuition classes" },
  { size: "2 × 4 ft", use: "Meeting rooms, small classrooms, corridors" },
  { size: "3 × 4 ft", use: "Classrooms, training halls, boardrooms" },
];

export default function BuyingGuidePage() {
  const sizeFaq = faqGroups.find((g) => g.id === "sizes")?.items ?? [];
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Buying Guide", path: "/buying-guide" }]}
        eyebrow="Buying Guide"
        title={
          <>
            Choose the <span className="text-gradient">right board.</span>
          </>
        }
        intro="Four construction series, six writing and display surfaces and sizes from 1 × 1 ft to 3 × 4 ft. This guide helps you match the board to how often it will be used and where it will hang."
      />

      {/* Series comparison */}
      <section aria-labelledby="series-title" className="bg-white py-20 md:py-28">
        <div className="container-x">
          <Reveal className="mb-12">
            <SectionHeading
              id="series-title"
              eyebrow="Step 1 · Series"
              title="Pick a series by how hard the board will work."
              intro="Every series is available across white, chalk and notice boards. The series sets the frame, corners and grade of surface."
            />
          </Reveal>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {series.map((s, i) => (
              <Reveal
                as="li"
                key={s.name}
                delay={i * 0.06}
                className={
                  s.highlight
                    ? "relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-deep to-graphite p-7 text-white shadow-[var(--shadow-lift)]"
                    : "card-premium p-7"
                }
              >
                {s.highlight && (
                  <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-flame/30 blur-3xl" />
                )}
                <p className={s.highlight ? "chip chip-dark" : "chip"}>
                  <span aria-hidden className="chip-dot" />
                  {s.badge}
                </p>
                <h3 className="relative mt-6 font-display text-2xl font-semibold">{s.name}</h3>
                <dl className="relative mt-6 space-y-4 text-sm">
                  {[
                    ["Corners", s.corners],
                    ["Frame", s.frame],
                    ["Surface", s.surface],
                    ["Best for", s.use],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className={s.highlight ? "eyebrow !text-alu" : "eyebrow"}>{k}</dt>
                      <dd className={`mt-1 flex gap-2 leading-snug ${s.highlight ? "text-white" : "text-graphite"}`}>
                        <Check aria-hidden className={`mt-0.5 size-4 shrink-0 ${s.highlight ? "text-flame" : "text-accent"}`} />
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Surfaces */}
      <section aria-labelledby="surface-title" className="relative overflow-hidden bg-mist py-20 md:py-28">
        <div aria-hidden className="aurora opacity-60" />
        <div className="container-x relative">
          <Reveal className="mb-12">
            <SectionHeading
              id="surface-title"
              eyebrow="Step 2 · Surface"
              title="Then choose the surface for how you write or display."
            />
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {surfaces.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.05}>
                <Link href={s.href} className="card-premium group flex h-full flex-col p-5">
                  <span aria-hidden className={`block h-28 rounded-2xl ring-1 ring-black/5 ${s.swatch}`} />
                  <h3 className="mt-5 flex items-center justify-between gap-2 font-display text-lg font-semibold">
                    {s.title}
                    <ArrowUpRight aria-hidden className="size-4 text-alu-dark transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-steel">{s.text}</p>
                  <p className="mt-4 text-xs font-semibold text-graphite">{s.fit}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Sizes */}
      <section aria-labelledby="size-title" className="bg-white py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              id="size-title"
              eyebrow="Step 3 · Size"
              title="Size it to the room and the viewing distance."
              intro="A general guide only — available sizes vary by series and product. Check the product page, or ask us for a custom size."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card-premium !transform-none overflow-hidden">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Suggested board sizes by space</caption>
                <thead className="bg-mist">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-steel">
                      Size
                    </th>
                    <th scope="col" className="px-6 py-4 font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-steel">
                      Typical space
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizeTips.map((t) => (
                    <tr key={t.size} className="border-t border-fog">
                      <th scope="row" className="whitespace-nowrap px-6 py-4 font-display font-semibold text-graphite">
                        {t.size}
                      </th>
                      <td className="px-6 py-4 text-steel">{t.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <FaqAccordion items={sizeFaq} className="mt-8" />
          </Reveal>
        </div>
      </section>

      <EnquiryBand
        title="Still deciding? Tell us about your space."
        text="Share the room type, number of boards and how they will be used — we will recommend the right series, surface and size."
      />
    </>
  );
}

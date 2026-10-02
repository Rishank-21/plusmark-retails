import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ExperienceScene } from "@/components/experience/ExperienceScene";
import { ExperienceNav } from "@/components/experience/ExperienceNav";
import { HeroD, type HeroProduct } from "@/components/experience/HeroD";
import { OrbitShowcase, type OrbitItem } from "@/components/experience/OrbitShowcase";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { ProductExplorer, type ExplorerItem } from "@/components/experience/ProductExplorer";
import { FaqStage } from "@/components/experience/FaqStage";
import { AplusStack } from "@/components/experience/AplusStack";
import { VideoRing } from "@/components/experience/VideoRing";
import { ThemeLock } from "@/components/experience/ThemeLock";
import type { AnchorName } from "@/components/experience/scroll";
import type { SceneBoard } from "@/components/experience/SceneCanvas";
import { ReviewWall } from "@/components/experience/ReviewWall";
import { EnquirySection } from "@/components/sections/EnquirySection";
import { CountUp } from "@/components/animations/CountUp";
import { Reveal } from "@/components/animations/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { aplusLines } from "@/data/aplus";
import { allVideos } from "@/data/media";
import { getProduct, products } from "@/data/products";
import { categories, categoryMap } from "@/data/categories";
import { company } from "@/data/company";
import { industries } from "@/data/industries";
import { buildMetadata } from "@/lib/seo";
import { itemListSchema } from "@/lib/structured-data";

export const metadata = buildMetadata({
  title: "Plusmark in 3D — White, Chalk, Notice & Magnetic Boards",
  description:
    "Explore Plusmark boards in 3D: walk a scroll-driven showroom, inspect frames, corners and surfaces up close, scrub a 360° product film and browse every feature banner. Established 2015, GEM Portal approved, Pan India supply.",
  path: "/experience",
});

/**
 * Showroom sequence. Specs and annotations quote the product catalog (data/products.ts);
 * `detail.anchor` is the part the camera closes in on for that product.
 */
const SHOWROOM: { slug: string; specs: { label: string; value: string }[]; detail: { anchor: AnchorName; label: string; text: string } }[] = [
  {
    slug: "metallic-premium-white-board",
    specs: [
      { label: "Frame", value: "Aluminium Anodized Frame" },
      { label: "Surface", value: "High Gloss Marker Grade HPL" },
      { label: "Corners", value: "Signature Dual-Tone" },
    ],
    detail: { anchor: "corner", label: "Signature Dual-Tone Corners", text: "Heavy-duty framing finished with Plusmark's signature dual-tone corner." },
  },
  {
    slug: "eco-premium-chalk-board",
    specs: [
      { label: "Surface", value: "Hardcore Chalk Grade HPL" },
      { label: "Finish", value: "Non-reflective, glare-free" },
      { label: "Corners", value: "ABS Dual-Tone Design" },
    ],
    detail: { anchor: "surface", label: "Chalk Grade HPL", text: "Enhanced scratch resistance with clear visibility from all angles." },
  },
  {
    slug: "metallic-premium-notice-board",
    specs: [
      { label: "Surface", value: "2 mm Blazer Cloth" },
      { label: "Core", value: "Soft pin-friendly core" },
      { label: "Corners", value: "Signature Dual-Tone" },
    ],
    detail: { anchor: "surface", label: "2 mm Blazer Cloth", text: "Long-lasting colour retention over a core made for heavy pin usage." },
  },
  {
    slug: "metallic-premium-magnetic-board",
    specs: [
      { label: "Type", value: "Resin Coated Steel" },
      { label: "Magnetic use", value: "Magnets, charts & holders" },
      { label: "Corners", value: "Signature Dual-Tone" },
    ],
    detail: { anchor: "frame", label: "Aluminium Frame", text: "Heavy-duty aluminium framing around a smooth resin coated surface." },
  },
];

const chapters = [
  { id: "xd-hero", label: "Intro" },
  { id: "xd-orbit", label: "Showroom" },
  { id: "xd-industries", label: "Industries" },
  { id: "xd-lines", label: "Products" },
  { id: "xd-explained", label: "Explained" },
  { id: "xd-films", label: "Film reel" },
  { id: "xd-reviews", label: "Reviews" },
  { id: "xd-numbers", label: "Plusmark" },
  { id: "xd-faq", label: "FAQ" },
  { id: "enquiry", label: "Enquiry" },
];

export default function ExperiencePage() {
  const showroom = SHOWROOM.map((s) => ({ ...s, product: getProduct(s.slug) })).filter(
    (s): s is (typeof s & { product: NonNullable<typeof s.product> }) => s.product !== undefined,
  );
  const boards: SceneBoard[] = showroom
    .filter((s) => s.product.model)
    .map((s) => ({ slug: s.product.slug, model: s.product.model!, detail: s.detail.anchor }));
  const orbitItems: OrbitItem[] = showroom.map(({ product: p, specs, detail }) => ({
    slug: p.slug,
    name: p.name,
    category: categoryMap[p.categorySlug].name,
    description: p.shortDescription,
    highlights: p.highlights.length ? p.highlights : p.features.slice(0, 3),
    image: p.modelFallback,
    imageAlt: p.imageAlt,
    specs,
    detail,
  }));

  const lead = showroom[0]?.product;
  const heroProduct: HeroProduct = {
    slug: lead?.slug ?? "metallic-premium-white-board",
    name: lead?.name ?? "Metallic Premium White Board",
    category: lead ? categoryMap[lead.categorySlug].name : "White Boards",
    image: lead?.modelFallback ?? "/images/products/metallic-premium-white-board.webp",
    imageAlt: lead?.imageAlt ?? "Metallic Premium White Board by Plusmark Display System",
    // order matches the scene's hotspot order: frame, surface, corner
    features: [
      { anchor: "frame", label: "Frame", value: "Aluminium Anodized Frame", text: "Extremely long-lasting and highly resistant to wear and tear." },
      {
        anchor: "surface",
        label: "Surface",
        value: "High Gloss Marker Grade HPL",
        text: "Ultra-smooth, high-gloss surface for effortless writing and easy erasing.",
      },
      {
        anchor: "corner",
        label: "Corners",
        value: "Signature Dual-Tone Corners",
        text: "Heavy-duty framing with Signature Dual-Tone Corners.",
      },
    ],
  };

  const stats = [
    { value: company.established, label: "Established", plain: true },
    { value: products.length, label: "Products in the catalog" },
    { value: categories.length, label: "Product categories" },
    { value: 12, label: "Popular board sizes" },
  ];

  // catalog explorer: featured boards first, then catalog order
  const explorerItems: ExplorerItem[] = [...products]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      categorySlug: p.categorySlug,
      category: categoryMap[p.categorySlug].name,
      series: p.series,
      image: p.image,
      imageAlt: p.imageAlt,
      alt: p.gallery.find((g) => g !== p.image),
      highlights: p.highlights,
    }));
  const explorerCategories = categories
    .map((c) => ({ slug: c.slug, name: c.name, count: products.filter((p) => p.categorySlug === c.slug).length }))
    .filter((c) => c.count > 0);

  return (
    <>
      <JsonLd data={itemListSchema("Plusmark showroom boards", showroom.map((s) => s.product))} />
      <ThemeLock />
      <ExperienceScene boards={boards} />
      <ExperienceNav chapters={chapters} />

      <div className="relative z-10">
        <HeroD product={heroProduct} />

        {/* Industries marquee between the hero and the showroom */}
        <section aria-label="Who we supply" className="relative border-y border-line/70 py-5">
          <div className="marquee mask-fade-x overflow-hidden">
            <ul className="marquee-track items-center">
              {[...industries, ...industries].map((ind, i) => (
                <li
                  key={`${ind.slug}-${i}`}
                  aria-hidden={i >= industries.length}
                  className="flex shrink-0 items-center gap-8 pr-8 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-steel"
                >
                  {ind.name}
                  <span aria-hidden className="size-1 rounded-full bg-alu" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <OrbitShowcase items={orbitItems} />

        <IndustriesSection id="xd-industries" className="relative z-10 scroll-mt-20" />

        <ProductExplorer id="xd-lines" items={explorerItems} categories={explorerCategories} />

        <AplusStack lines={aplusLines} />

        <VideoRing videos={allVideos} />

        <ReviewWall id="xd-reviews" />

        <section id="xd-numbers" aria-labelledby="xd-numbers-title" className="relative py-24 md:py-32">
          <div className="mx-auto max-w-[110rem] px-5 sm:px-10 lg:pr-24">
            <Reveal className="max-w-3xl">
              <p className="xd-eyebrow">{company.subline}</p>
              <h2
                id="xd-numbers-title"
                className="mt-4 font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite"
              >
                {company.tagline}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">{company.panIndia}</p>
            </Reveal>
            <ul className="mt-14 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <Reveal as="li" key={s.label} delay={i * 0.06} className="border-b border-line py-8 sm:pr-8 lg:border-b-0">
                  <p className="font-display text-5xl font-semibold tracking-[-0.04em] text-graphite md:text-6xl">
                    {s.plain ? s.value : <CountUp to={s.value} />}
                  </p>
                  <p className="xd-label mt-3">{s.label}</p>
                </Reveal>
              ))}
            </ul>
            <Reveal className="xd-stage xd-on-dark mt-16 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl p-8 text-white md:flex-row md:items-center md:p-12">
              <div>
                <p className="font-display text-2xl font-semibold tracking-[-0.02em] md:text-3xl">Need a custom size or a bulk order?</p>
                <p className="mt-2 max-w-xl text-white/70">Schools, institutions, dealers and government buyers: tell us what you need.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/custom-solutions" className="xd-btn-ghost">
                  Custom solutions
                </Link>
                <a href="#enquiry" className="xd-btn">
                  Request Enquiry <ArrowUpRight aria-hidden className="size-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <FaqStage id="xd-faq" />

        <EnquirySection />
      </div>
    </>
  );
}

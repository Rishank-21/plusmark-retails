import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ExperienceNav } from "@/components/experience/ExperienceNav";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { VideoRing } from "@/components/experience/VideoRing";
import { ThemeLock } from "@/components/experience/ThemeLock";
import { ShowroomStory, type ShowroomItem } from "@/components/showroom/ShowroomStory";
import { ShowroomCarousel, type CarouselItem } from "@/components/showroom/ShowroomCarousel";
import { ShowroomAplus } from "@/components/showroom/ShowroomAplus";
import { ReviewWall } from "@/components/experience/ReviewWall";
import { FaqStage } from "@/components/experience/FaqStage";
import { EnquirySection } from "@/components/sections/EnquirySection";
import { CountUp } from "@/components/animations/CountUp";
import { Reveal } from "@/components/animations/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { allVideos } from "@/data/media";
import { getProduct, products } from "@/data/products";
import { categories, categoryMap } from "@/data/categories";
import { company } from "@/data/company";
import type { Product } from "@/data/types";
import { SHOWROOM_PATH } from "@/lib/design";
import { buildMetadata } from "@/lib/seo";
import { itemListSchema } from "@/lib/structured-data";

export const metadata = buildMetadata({
  title: "Plusmark Showroom — Notice, White, Chalk, Magnetic & Ceramic Boards in 3D",
  description:
    "Walk the Plusmark 3D showroom: every board turns to face you, the camera closes in on the aluminium frame and the writing or pin-up surface, then the next board enters. Made in India since 2015, GEM Portal approved.",
  path: SHOWROOM_PATH,
});

type Parts = ShowroomItem["parts"];

/**
 * The six chapters of the showroom, one per board family. Every spec and annotation quotes the
 * product catalog (data/products.ts); nothing here adds specifications.
 */
const STORY: { slug: string; specs: { label: string; value: string }[]; parts: Parts }[] = [
  {
    slug: "metallic-premium-notice-board",
    specs: [
      { label: "Surface", value: "2 mm Blazer Cloth" },
      { label: "Core", value: "Soft, pin-friendly" },
      { label: "Corners", value: "Signature Dual-Tone" },
    ],
    parts: {
      frame: { label: "Premium aluminium construction", text: "Premium aluminium construction with Signature Dual-Tone Corners, designed for long-term institutional use." },
      surface: { label: "2 mm Blazer Cloth", text: "Long-lasting colour retention over a soft pin-friendly core made for frequent and heavy pin usage." },
      corner: { label: "Signature Dual-Tone Corners", text: "Plusmark's signature dual-tone corner finishes every Metallic Premium frame." },
    },
  },
  {
    slug: "metallic-premium-white-board",
    specs: [
      { label: "Frame", value: "Aluminium Anodized" },
      { label: "Surface", value: "High Gloss Marker Grade HPL" },
      { label: "Type", value: "Non-Magnetic" },
    ],
    parts: {
      frame: { label: "Aluminium Anodized Frame", text: "Heavy-duty framing that is extremely long-lasting and highly resistant to wear and tear." },
      surface: { label: "High Gloss Marker Grade HPL", text: "An ultra-smooth, high-gloss surface for effortless writing and easy erasing." },
      corner: { label: "Signature Dual-Tone Corners", text: "Heavy-duty framing finished with Signature Dual-Tone Corners." },
    },
  },
  {
    slug: "metallic-premium-chalk-board",
    specs: [
      { label: "Surface", value: "Hardcore Chalk Grade HPL" },
      { label: "Finish", value: "Non-reflective, glare-free" },
      { label: "Corners", value: "Signature Dual-Tone" },
    ],
    parts: {
      frame: { label: "Heavy-duty aluminium framing", text: "Aluminium on every edge, finished with Signature Dual-Tone Corners." },
      surface: { label: "Hardcore Chalk Grade HPL", text: "Enhanced scratch resistance; non-reflective and glare-free with clear visibility from all angles." },
      corner: { label: "Signature Dual-Tone Corners", text: "The Metallic Premium corner, in Plusmark's signature two tones." },
    },
  },
  {
    slug: "metallic-premium-magnetic-board",
    specs: [
      { label: "Type", value: "Resin Coated Steel" },
      { label: "Magnetic use", value: "Magnets, charts & holders" },
      { label: "Corners", value: "Signature Dual-Tone" },
    ],
    parts: {
      frame: { label: "Heavy-duty aluminium framing", text: "Heavy-duty aluminium framing with Signature Dual-Tone Corners around the writing surface." },
      surface: { label: "Resin coated steel", text: "Accepts magnets and magnetic accessories such as charts and holders; smooth for regular writing and erasing." },
      corner: { label: "Signature Dual-Tone Corners", text: "Signature Dual-Tone Corners on every Metallic Premium board." },
    },
  },
  {
    slug: "metallic-premium-ceramic-board",
    specs: [
      { label: "Surface", value: "Ceramic / porcelain enamel steel" },
      { label: "Product life", value: "Very long" },
      { label: "Options", value: "Marker & chalk" },
    ],
    parts: {
      frame: { label: "Aluminium frame", text: "Aluminium frame with Signature Dual-Tone Corners, built for regular institutional use." },
      surface: { label: "Ceramic steel surface", text: "Hard and non-porous for continuous writing and frequent cleaning, designed for very long product life." },
      corner: { label: "Signature Dual-Tone Corners", text: "Finished with Plusmark's Signature Dual-Tone Corners." },
    },
  },
  {
    slug: "deluxe-45mm-adc-notice-board-double-door",
    specs: [
      { label: "Framing", value: "Deluxe 45 mm Triple Aluminium" },
      { label: "Cover", value: "Transparent acrylic doors" },
      { label: "Doors", value: "Secure double-door system" },
    ],
    parts: {
      frame: { label: "Deluxe 45 mm Triple Aluminium Framing", text: "Triple aluminium framing for added strength and a premium appearance." },
      surface: { kicker: "Door cover", label: "Transparent acrylic door cover", text: "Protects notices from dust and handling while keeping them fully readable." },
      corner: { kicker: "Doors", label: "Secure double-door system", text: "Suitable for controlled notice display in corridors, offices and campuses." },
    },
  },
];

export default function ShowroomPage() {
  const story = STORY.map((s) => ({ ...s, product: getProduct(s.slug) })).filter(
    (s): s is typeof s & { product: Product } => s.product !== undefined,
  );
  const items: ShowroomItem[] = story.map(({ product: p, specs, parts }) => ({
    slug: p.slug,
    name: p.name,
    category: categoryMap[p.categorySlug].name,
    series: p.series,
    description: p.shortDescription,
    image: p.modelFallback,
    imageAlt: p.imageAlt,
    model: p.model,
    specs,
    parts,
  }));

  // one cover product per category for the range carousel
  const range: CarouselItem[] = categories
    .map((c) => getProduct(c.coverProduct))
    .filter((p): p is Product => p !== undefined)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: categoryMap[p.categorySlug].name,
      description: p.shortDescription,
      highlights: p.highlights.slice(0, 3),
      image: p.image,
      imageAlt: p.imageAlt,
    }));

  const chapters = [
    { id: "xe-story", label: "Showroom" },
    { id: "xe-range", label: "The range" },
    { id: "xe-industries", label: "Industries" },
    { id: "xd-films", label: "Film reel" },
    { id: "xe-aplus", label: "Highlights" },
    { id: "xe-reviews", label: "Reviews" },
    { id: "xe-numbers", label: "Plusmark" },
    { id: "xe-faq", label: "FAQ" },
    { id: "enquiry", label: "Enquiry" },
  ];

  const stats = [
    { value: company.established, label: "Established", plain: true },
    { value: products.length, label: "Products in the catalog" },
    { value: categories.length, label: "Product categories" },
    { value: 12, label: "Popular board sizes" },
  ];

  return (
    <>
      <JsonLd data={itemListSchema("Plusmark showroom boards", story.map((s) => s.product))} />
      <ThemeLock id="e" />
      {/* the story has its own "01 / 06" product counter, so the page-chapter rail is off here */}
      <ExperienceNav chapters={chapters} home={SHOWROOM_PATH} rail={false} />

      <ShowroomStory items={items} />

      <ShowroomCarousel items={range} />

      <IndustriesSection id="xe-industries" className="relative z-10 scroll-mt-20" />

      <VideoRing videos={allVideos} />

      {/* Amazon A+ banner showcase ("Every board, explained.") */}
      <ShowroomAplus />

      <ReviewWall id="xe-reviews" />

      <section id="xe-numbers" aria-labelledby="xe-numbers-title" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[110rem] px-5 sm:px-10 lg:pr-24">
          <Reveal className="max-w-3xl">
            <p className="xd-eyebrow">{company.subline}</p>
            <h2 id="xe-numbers-title" className="mt-4 font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">
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
                Request a quote <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <FaqStage id="xe-faq" />

      <EnquirySection />
    </>
  );
}

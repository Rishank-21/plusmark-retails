import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ExperienceScene } from "@/components/experience/ExperienceScene";
import { ExperienceNav } from "@/components/experience/ExperienceNav";
import { HeroD } from "@/components/experience/HeroD";
import { OrbitShowcase, type OrbitItem } from "@/components/experience/OrbitShowcase";
import { ScrollFilm } from "@/components/experience/ScrollFilm";
import { LinesRail } from "@/components/experience/LinesRail";
import { AplusStack } from "@/components/experience/AplusStack";
import { VideoRing } from "@/components/experience/VideoRing";
import { ThemeLock } from "@/components/experience/ThemeLock";
import { EnquirySection } from "@/components/sections/EnquirySection";
import { CountUp } from "@/components/animations/CountUp";
import { Reveal } from "@/components/animations/Reveal";
import { aplusLines } from "@/data/aplus";
import { videos } from "@/data/media";
import { getProduct, products } from "@/data/products";
import { categories, categoryMap } from "@/data/categories";
import { company } from "@/data/company";
import { industries } from "@/data/industries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Plusmark in 3D — White, Chalk, Notice & Magnetic Boards",
  description:
    "Explore Plusmark boards in 3D: scroll to spin the collection, scrub through a 360° product film and browse every feature banner. Established 2015, GEM Portal approved, Pan India supply.",
  path: "/experience",
});

const ORBIT_SLUGS = [
  "metallic-premium-white-board",
  "eco-premium-chalk-board",
  "metallic-premium-notice-board",
  "metallic-premium-magnetic-board",
];

const chapters = [
  { id: "xd-hero", label: "Intro" },
  { id: "xd-orbit", label: "Collection 360°" },
  { id: "xd-film", label: "The film" },
  { id: "xd-lines", label: "Product lines" },
  { id: "xd-explained", label: "Explained" },
  { id: "xd-films", label: "Film reel" },
  { id: "xd-numbers", label: "Plusmark" },
  { id: "enquiry", label: "Enquiry" },
];

export default function ExperiencePage() {
  const orbitProducts = ORBIT_SLUGS.map((s) => getProduct(s)).filter((p) => p !== undefined);
  const boards = orbitProducts.filter((p) => p.model).map((p) => ({ slug: p.slug, model: p.model! }));
  const orbitItems: OrbitItem[] = orbitProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: categoryMap[p.categorySlug].name,
    description: p.shortDescription,
    highlights: p.highlights.length ? p.highlights : p.features.slice(0, 3),
    image: p.modelFallback,
  }));

  const stats = [
    { value: company.established, label: "Established", plain: true },
    { value: products.length, label: "Products in the catalog" },
    { value: categories.length, label: "Product categories" },
    { value: 12, label: "Popular board sizes" },
  ];

  return (
    <>
      <ThemeLock />
      <ExperienceScene boards={boards} />
      <ExperienceNav chapters={chapters} />

      <div className="relative z-10">
        <HeroD fallbackImage={orbitItems[0]?.image ?? "/images/products/metallic-premium-white-board.webp"} />

        {/* Industries marquee between the hero and the ring */}
        <section aria-label="Who we supply" className="relative py-10">
          <div className="marquee mask-fade-x overflow-hidden">
            <ul className="marquee-track gap-4">
              {[...industries, ...industries].map((ind, i) => (
                <li key={`${ind.slug}-${i}`} aria-hidden={i >= industries.length} className="xd-glass shrink-0 rounded-full px-6 py-3 font-display text-sm font-medium text-graphite">
                  {ind.name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <OrbitShowcase items={orbitItems} />

        <ScrollFilm
          frames={120}
          path="/sequence/board-turn/"
          poster="/sequence/board-turn/001.webp"
          beats={[
            { at: 0.12, kicker: "Side A", title: "Chalk board face", text: "Hardcore Chalk Grade HPL: non-reflective, glare-free and low on dust." },
            { at: 0.38, kicker: "Profile", title: "Aluminium on every edge", text: "Heavy-duty anodised aluminium framing with Signature Dual-Tone Corners." },
            { at: 0.64, kicker: "Side B", title: "White board face", text: "High-gloss HPL writing surface for smooth marker writing and easy erasing." },
            { at: 0.9, kicker: "Both sides", title: "Flip it on the wall", text: "One board, two writing experiences, hung horizontally or vertically." },
          ]}
        />

        <LinesRail lines={aplusLines} />

        <AplusStack lines={aplusLines} />

        <VideoRing videos={Object.values(videos)} />

        <section id="xd-numbers" aria-labelledby="xd-numbers-title" className="relative py-24 md:py-32">
          <div className="mx-auto max-w-[110rem] px-5 sm:px-10">
            <Reveal className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{company.subline}</p>
              <h2 id="xd-numbers-title" className="mt-3 font-display text-[clamp(1.8rem,4vw,3.6rem)] font-semibold leading-[1.02] text-graphite">
                {company.tagline}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-steel">{company.panIndia}</p>
            </Reveal>
            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <Reveal as="li" key={s.label} delay={i * 0.06} className="xd-glass xd-grad-border rounded-[1.75rem] p-7">
                  <p className="font-display text-5xl font-semibold text-graphite md:text-6xl">
                    {s.plain ? s.value : <CountUp to={s.value} />}
                  </p>
                  <p className="mt-3 text-sm text-steel">{s.label}</p>
                </Reveal>
              ))}
            </ul>
            <Reveal className="xd-stage mt-16 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[2rem] p-8 text-white md:flex-row md:items-center md:p-12">
              <div>
                <p className="font-display text-2xl font-semibold md:text-3xl">Need a custom size or a bulk order?</p>
                <p className="mt-2 max-w-xl text-white/75">Schools, institutions, dealers and government buyers: tell us what you need.</p>
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

        <EnquirySection />
      </div>
    </>
  );
}

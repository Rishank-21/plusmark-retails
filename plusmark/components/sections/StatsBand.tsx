import { company } from "@/data/company";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { Reveal } from "@/components/animations/Reveal";
import { CountUp } from "@/components/animations/CountUp";

/** Key figures — every number is derived from site data, nothing is invented. */
export function StatsBand() {
  const years = new Date().getFullYear() - company.established;
  const stats = [
    { value: years, suffix: "+", label: "Years of manufacturing", note: `Since ${company.established}` },
    { value: products.length, suffix: "+", label: "Products in the range", note: "Boards, stands, benches & more" },
    { value: categories.length, suffix: "", label: "Product categories", note: "From white boards to benches" },
    { value: 4, suffix: "", label: "Board series", note: "Metallic · Eco Premium · Deluxe · Eco Regular" },
  ];
  const marquee = [
    "Made in India",
    "GEM Portal Approved",
    "Pan India Supply",
    "Aluminium Anodized Frames",
    "Marker Grade HPL",
    "Hardcore Chalk Grade HPL",
    "Ceramic Steel",
    "Custom Sizes & Layouts",
    company.tagline,
  ];

  return (
    <section aria-label="Plusmark in numbers" className="relative bg-white py-16 md:py-20">
      <div className="container-x">
        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 0.06} className="card-premium p-6 md:p-8">
              <p className="font-display text-[clamp(2.4rem,5vw,3.8rem)] font-semibold leading-none tracking-tight">
                <span className="text-gradient">
                  <CountUp to={s.value} />
                  {s.suffix}
                </span>
              </p>
              <p className="mt-4 text-sm font-semibold text-graphite">{s.label}</p>
              <p className="mt-1 text-xs text-steel">{s.note}</p>
            </Reveal>
          ))}
        </ul>
      </div>
      <div className="marquee mask-fade-x mt-14 overflow-hidden border-y border-fog py-5" aria-hidden>
        <div className="marquee-track gap-10">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-lg font-medium text-steel md:text-xl">
              {m}
              <span className="size-1.5 rounded-full bg-gradient-to-br from-brand to-flame" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

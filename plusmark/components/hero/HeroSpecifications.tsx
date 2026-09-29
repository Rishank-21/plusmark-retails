import type { FeaturedProduct } from "@/data/featured";

interface Props {
  product: FeaturedProduct;
  index: number;
  style?: React.CSSProperties;
}

export function HeroSpecifications({ product, index, style }: Props) {
  return (
    <div data-hero-idx={index} style={style} className="will-change-transform">
      <p className="eyebrow mb-4 hidden lg:block">Specifications</p>
      <dl className="grid grid-cols-3 gap-x-4 gap-y-3 border-t border-line pt-3 lg:grid-cols-1 lg:gap-0 lg:border-t-0 lg:pt-0">
        {product.heroSpecs.map((s, k) => (
          <div
            key={s.label}
            className={`min-w-0 lg:border-t lg:border-line lg:py-3.5 ${k >= 3 ? "hidden lg:block" : ""}`}
          >
            <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-alu-dark">{s.label}</dt>
            <dd className="mt-1 line-clamp-3 text-[0.78rem] font-medium leading-snug text-graphite lg:text-[0.85rem]">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

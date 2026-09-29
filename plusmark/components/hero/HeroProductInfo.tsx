import Link from "next/link";
import { ArrowRight, Sparkle } from "lucide-react";
import type { FeaturedProduct } from "@/data/featured";
import { pad2 } from "@/lib/utils";

interface Props {
  product: FeaturedProduct;
  index: number;
  style?: React.CSSProperties;
}

export function HeroProductHead({ product, index, total, style }: Props & { total: number }) {
  return (
    <div data-hero-idx={index} style={style} className="will-change-transform">
      <p className="eyebrow mb-3 flex items-center gap-3 lg:mb-5">
        <span className="text-graphite">{pad2(index + 1)}</span>
        <span aria-hidden className="h-px w-6 bg-alu-dark" />
        <Link href={`/products/${product.categorySlug}`} className="link-underline pointer-events-auto hover:text-graphite">
          {product.category}
        </Link>
        <span className="sr-only">
          , product {index + 1} of {total}
        </span>
      </p>
      <h2 className="font-display text-[clamp(1.7rem,6.5vw,2.3rem)] font-semibold leading-[1.02] text-graphite lg:text-[clamp(2.2rem,3.3vw,3.4rem)]">
        {product.name}
      </h2>
    </div>
  );
}

export function HeroProductBody({ product, index, style }: Props) {
  return (
    <div data-hero-idx={index} style={style} className="will-change-transform lg:pt-6">
      <p className="hidden text-[0.95rem] leading-relaxed text-steel lg:block">{product.description}</p>
      <p className="mt-5 hidden items-start gap-2.5 text-sm font-medium text-graphite lg:flex">
        <Sparkle aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
        {product.keyFeature}
      </p>
      <div className="pointer-events-auto mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 lg:mt-8">
        <Link
          href={`/products/${product.slug}`}
          className="group inline-flex h-11 items-center gap-2.5 bg-graphite px-5 text-[0.8rem] font-semibold text-white transition-colors hover:bg-ink"
        >
          View Product
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href={`/contact?product=${product.slug}#enquiry`}
          className="group inline-flex items-center gap-2 text-[0.8rem] font-semibold text-graphite"
        >
          <span className="link-underline">Enquire</span>
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Box } from "lucide-react";
import type { Product } from "@/data/types";
import { categoryMap } from "@/data/categories";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function ProductCard({ product, headingLevel: H = "h3", className }: ProductCardProps) {
  const category = categoryMap[product.categorySlug];
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-fog shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-premium)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] hover:ring-line motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="relative m-2 mb-0 aspect-[4/3] overflow-hidden rounded-[1.1rem] studio-bg">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 100vw"
          className="object-contain mix-blend-multiply transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.05]"
        />
        {product.model && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-steel ring-1 ring-fog backdrop-blur">
            <Box aria-hidden className="size-3" /> 3D
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="eyebrow !text-[0.62rem]">{category.name}</p>
        <H className="mt-2 font-display text-lg font-semibold leading-snug text-graphite">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent"
          >
            {product.name}
          </Link>
        </H>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-steel">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-5 text-[0.78rem] font-semibold">
          <span aria-hidden className="inline-flex items-center gap-1.5 text-graphite">
            View Product
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          <Link
            href={`/contact?product=${product.slug}#enquiry`}
            className="relative z-10 inline-flex items-center gap-1.5 text-accent hover:text-graphite"
            aria-label={`Enquire about ${product.name}`}
          >
            Enquire <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

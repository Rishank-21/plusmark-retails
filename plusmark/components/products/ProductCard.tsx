import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box } from "lucide-react";
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
        "group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-black/[0.06] shadow-[0_10px_35px_-24px_rgba(20,25,30,0.55)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(20,25,30,0.5)] motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f2]">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 100vw"
          className="object-contain mix-blend-multiply transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.035]"
        />
        {product.model && (
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-steel shadow-sm backdrop-blur">
            <Box aria-hidden className="size-3" /> 3D
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 md:px-6 md:pb-6">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-steel/75">{category.name}</p>
        <H className="mt-2 font-display text-[1.08rem] font-semibold leading-snug tracking-[-0.01em] text-graphite">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent"
          >
            {product.name}
          </Link>
        </H>
        <p className="mt-2 line-clamp-2 text-[0.84rem] leading-relaxed text-steel">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6 text-[0.72rem] font-semibold">
          <span aria-hidden className="inline-flex items-center gap-1.5 uppercase tracking-[0.12em] text-graphite">
            View product
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
          <Link
            href={`/contact?product=${product.slug}#enquiry`}
            className="relative z-10 inline-flex items-center rounded-full border border-accent/35 px-3 py-1.5 uppercase tracking-[0.1em] text-accent transition-colors hover:border-accent hover:bg-accent hover:text-white"
            aria-label={`Enquire about ${product.name}`}
          >
            Enquire
          </Link>
        </div>
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/categories";
import { getProduct, getProductsByCategory } from "@/data/products";
import { pad2, cn } from "@/lib/utils";

export function CategoryGrid({ exclude, compact }: { exclude?: string; compact?: boolean }) {
  const list = categories.filter((c) => c.slug !== exclude);
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", compact ? "lg:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-4")}>
      {list.map((c, i) => {
        const cover = getProduct(c.coverProduct);
        const count = getProductsByCategory(c.slug).length;
        return (
          <li key={c.slug} className="group relative overflow-hidden rounded-3xl bg-white ring-1 ring-fog shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0">
            <div className="relative m-2 mb-0 aspect-[16/10] overflow-hidden rounded-[1.1rem] studio-bg">
              {cover && (
                <Image
                  src={cover.image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                  className="object-contain mix-blend-multiply transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
                />
              )}
              <span className="absolute left-4 top-4 font-mono text-[0.62rem] text-steel">{pad2(i + 1)}</span>
            </div>
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <h3 className="font-display text-base font-semibold">
                  <Link href={`/products/${c.slug}`} className="after:absolute after:inset-0 after:content-['']">
                    {c.name}
                  </Link>
                </h3>
                {!compact && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-steel">{c.summary}</p>}
                <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-alu-dark">
                  {count} {count === 1 ? "product" : "products"}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden
                className="size-4 shrink-0 text-alu-dark transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

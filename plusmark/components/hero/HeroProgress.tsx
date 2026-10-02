"use client";

import type { FeaturedProduct } from "@/data/featured";
import { cn, pad2 } from "@/lib/utils";

interface HeroProgressProps {
  products: FeaturedProduct[];
  active: number;
  barRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (index: number) => void;
  /** Announce product changes. Off while the carousel advances on its own, so it doesn't chatter. */
  live: boolean;
}

export function HeroProgress({ products, active, barRef, onSelect, live }: HeroProgressProps) {
  const n = products.length;
  return (
    <div className="flex items-center gap-4 lg:gap-8">
      <p className="shrink-0 font-mono text-[0.7rem] tracking-[0.14em] text-graphite" aria-live={live ? "polite" : "off"}>
        <span className="text-sm font-medium">{pad2(active + 1)}</span>
        <span className="text-alu-dark"> / {pad2(n)}</span>
        <span className="sr-only">: {products[active]?.name}</span>
      </p>

      <div className="relative min-w-0 flex-1">
        <div className="relative h-px w-full bg-line">
          <div ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-graphite" />
        </div>
        <ol className="absolute inset-x-0 -top-3 hidden justify-between lg:flex" aria-label="Featured products">
          {products.map((p, i) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Show ${p.name}`}
                aria-current={i === active ? "true" : undefined}
                className="group relative flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={cn(
                    "block size-1.5 rounded-full transition-all duration-500",
                    i === active ? "scale-150 bg-accent" : i < active ? "bg-graphite" : "bg-alu group-hover:bg-steel",
                  )}
                />
                <span className="pointer-events-none absolute top-6 whitespace-nowrap font-mono text-[0.6rem] text-steel opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {pad2(i + 1)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <p className="hidden max-w-[16rem] shrink-0 truncate text-right font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel md:block">
        {products[active]?.name}
      </p>

      {/* mobile: compact dots */}
      <ol className="flex gap-1.5 lg:hidden" aria-label="Featured products">
        {products.map((p, i) => (
          <li key={p.slug}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show ${p.name}`}
              aria-current={i === active ? "true" : undefined}
              className="flex h-6 items-center"
            >
              <span
                className={cn(
                  "block h-1 rounded-full transition-all duration-500",
                  i === active ? "w-4 bg-accent" : "w-1 bg-alu",
                )}
              />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

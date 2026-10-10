"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { APLUS_BRAND, APLUS_HEIGHT, APLUS_WIDTH, type ProductAplus } from "@/data/aplus";
import { cn } from "@/lib/utils";

/**
 * Amazon-style A+ product description: banners stacked edge to edge at full width (capped at
 * Amazon's 1464 px A+ width) and full natural height, brand banner first, then the set in order.
 * Products with two variants (white / chalk) get a toggle between their sets.
 */
export function AplusDescription({ sets, productName }: { sets: ProductAplus[]; productName: string }) {
  const [active, setActive] = useState(0);
  const current = sets[active];
  const banners = [APLUS_BRAND, ...current.set.images];

  return (
    <section aria-labelledby="aplus-title" className="bg-white pt-12 md:pt-16">
      <div className="container-x mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 id="aplus-title" className="font-display text-xl font-semibold md:text-2xl">
          Product Description
        </h2>
        {sets.length > 1 && (
          <div role="tablist" aria-label={`${productName} variants`} className="flex gap-2">
            {sets.map((s, i) => (
              <button
                key={s.set.id}
                type="button"
                role="tab"
                id={`aplus-tab-${s.set.id}`}
                aria-selected={i === active}
                aria-controls="aplus-banners"
                onClick={() => setActive(i)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold ring-1 transition",
                  i === active ? "bg-graphite text-white ring-graphite" : "bg-white text-graphite ring-line hover:ring-graphite",
                )}
              >
                {s.variant ?? s.set.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <ol
        id="aplus-banners"
        role={sets.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={sets.length > 1 ? `aplus-tab-${current.set.id}` : undefined}
        aria-label={sets.length > 1 ? undefined : `${productName} product description images`}
        className="mx-auto w-full max-w-[1464px] [&>li]:!rounded-none [&>li>img]:!rounded-none"
        style={{ margin: '0 auto', padding: 0, listStyle: 'none' }}
      >
        {banners.map((img, index) => (
          <li 
            key={`${current.set.id}-${index}-${img.src}`}
            style={{ 
              lineHeight: 0, 
              margin: 0, 
              padding: 0, 
              display: 'block',
              overflow: 'hidden',
              borderRadius: 0
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={APLUS_WIDTH}
              height={APLUS_HEIGHT}
              sizes="(min-width: 1464px) 1464px, 100vw"
              quality={85}
              unoptimized
              className="block w-full h-auto [&]:!rounded-none"
              style={{ 
                display: 'block', 
                margin: 0, 
                padding: 0, 
                borderRadius: '0 !important',
                border: 'none',
                verticalAlign: 'bottom',
                maxWidth: '100%',
                height: 'auto',
                clipPath: 'none',
                WebkitBorderRadius: 0,
                MozBorderRadius: 0
              }}
            />
          </li>
        ))}
      </ol>

      {current.amazonUrl && (
        <div className="container-x py-6">
          <a href={current.amazonUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-sm font-semibold">
            <span className="link-underline">View this listing on Amazon.in</span>
            <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      )}
    </section>
  );
}

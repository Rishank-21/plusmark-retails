"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AMAZON_STORE_URL, APLUS_HEIGHT, APLUS_WIDTH, type AplusLine } from "@/data/aplus";
import { cn } from "@/lib/utils";

/**
 * Home page: the Amazon A+ explainer banners for all six Plusmark Retail lines, as a tabbed
 * viewer (large banner + thumbnail strip). Designs A–C share it; D has its own version.
 */
export function AplusShowcase({ lines }: { lines: AplusLine[] }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const line = lines[lineIdx];
  const img = line.images[imgIdx];
  const count = line.images.length;

  const pickLine = (i: number) => {
    setLineIdx(i);
    setImgIdx(0);
  };
  const step = (d: number) => setImgIdx((i) => (i + d + count) % count);

  return (
    <div>
      <div role="tablist" aria-label="Product line" className="flex flex-wrap gap-2">
        {lines.map((l, i) => (
          <button
            key={l.id}
            role="tab"
            type="button"
            id={`aplus-tab-${l.id}`}
            aria-selected={i === lineIdx}
            aria-controls="aplus-panel"
            onClick={() => pickLine(i)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
              i === lineIdx ? "bg-graphite text-white" : "bg-white text-steel ring-1 ring-line hover:text-graphite",
            )}
          >
            {l.short}
          </button>
        ))}
      </div>

      <div id="aplus-panel" role="tabpanel" aria-labelledby={`aplus-tab-${line.id}`} className="mt-8">
        <div className="card-premium group relative overflow-hidden !transform-none">
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={APLUS_WIDTH}
            height={APLUS_HEIGHT}
            sizes="(min-width: 1408px) 1344px, 100vw"
            quality={85}
            className="h-auto w-full animate-[fade_0.6s_var(--ease-premium)_both]"
          />
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-graphite shadow-[var(--shadow-soft)] transition hover:scale-105"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-graphite shadow-[var(--shadow-soft)] transition hover:scale-105"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
          <p className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 font-mono text-xs text-graphite" aria-live="polite">
            {imgIdx + 1} / {count}
          </p>
        </div>

        <ul className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-9">
          {line.images.map((im, i) => (
            <li key={im.src}>
              <button
                type="button"
                onClick={() => setImgIdx(i)}
                aria-label={`Show banner ${i + 1}: ${im.alt}`}
                aria-current={i === imgIdx ? "true" : undefined}
                className={cn(
                  "block w-full overflow-hidden rounded-lg ring-2 transition",
                  i === imgIdx ? "ring-accent" : "opacity-70 ring-transparent hover:opacity-100",
                )}
              >
                <Image src={im.src} alt="" width={240} height={98} sizes="160px" className="h-auto w-full" />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold">{line.name}</p>
            <p className="mt-1 text-sm text-steel">{line.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {line.productSlug && (
              <Link
                href={`/products/${line.productSlug}`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                View product <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
            <a
              href={line.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-graphite ring-1 ring-line transition hover:ring-graphite"
            >
              View on Amazon <ArrowUpRight aria-hidden className="size-4" />
            </a>
            <a
              href={AMAZON_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex h-11 items-center text-sm font-medium text-steel"
            >
              All Plusmark Retail listings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

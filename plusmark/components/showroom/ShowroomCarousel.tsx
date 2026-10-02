"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAutoScroll } from "@/components/animations/useAutoScroll";

export interface CarouselItem {
  slug: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  image: string;
  imageAlt: string;
}

/**
 * The range: an endless, slowly drifting row of product cards. It pauses as soon as the
 * pointer is over it, it is touched or a card has keyboard focus, and it can be swiped or
 * stepped with the arrow buttons. The list is rendered twice for the loop; the copy is
 * hidden from assistive tech and the tab order.
 */
export function ShowroomCarousel({ items }: { items: CarouselItem[] }) {
  const n = items.length;
  const { ref, nudge, handlers } = useAutoScroll<HTMLUListElement>({ speed: 42 });

  return (
    // z-20 keeps the cards above the film's dark hand-over gradient; the bottom padding
    // leaves room for that gradient so the buttons always sit on the light background
    <section id="xe-range" aria-labelledby="xe-range-title" className="relative z-20 overflow-hidden pb-[38vh] pt-24 md:pt-32">
      <div className="mx-auto max-w-[110rem] px-5 sm:px-10 lg:pr-24">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="xd-eyebrow">The range</p>
            <h2 id="xe-range-title" className="mt-4 max-w-3xl font-display text-[clamp(2.25rem,4.6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">
              One manufacturer, <span className="xd-grad-text">every board.</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => nudge(-1)} aria-label="Previous product" className="xd-btn-ghost !h-11 !px-3">
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button type="button" onClick={() => nudge(1)} aria-label="Next product" className="xd-btn-ghost !h-11 !px-3">
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={ref}
        aria-label="Plusmark products"
        {...handlers}
        className="mask-fade-x xd-noscroll-bar mt-12 flex gap-5 overflow-x-auto px-5 pb-6 pt-2 [scrollbar-width:none] sm:px-10 md:gap-6"
      >
        {[...items, ...items].map((it, i) => {
          const copy = i >= n;
          return (
            <li
              key={`${it.slug}-${i}`}
              aria-hidden={copy || undefined}
              className="group w-[min(24rem,82vw)] shrink-0"
            >
              <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(27_23_64/0.06),0_30px_60px_-40px_rgb(27_23_64/0.45)] ring-1 ring-[rgb(27_23_64/0.08)] transition-[transform,box-shadow] duration-500 ease-[var(--xd-ease)] group-hover:-translate-y-1.5 group-hover:shadow-[0_1px_2px_rgb(27_23_64/0.06),0_40px_80px_-40px_rgb(27_23_64/0.55)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(120%_80%_at_50%_38%,#ffffff_0%,#f6f5fc_60%,#eceaf7_100%)]">
                  <Image
                    src={it.image}
                    alt={copy ? "" : it.imageAlt}
                    fill
                    sizes="(min-width: 640px) 24rem, 82vw"
                    className="object-contain p-[7%] mix-blend-multiply transition-transform duration-700 ease-[var(--xd-ease)] group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 font-mono text-[0.66rem] tabular-nums text-alu-dark">
                    {String((i % n) + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="xd-label">{it.category}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-graphite">{it.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-steel">{it.description}</p>
                  {it.highlights.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Highlights">
                      {it.highlights.map((h) => (
                        <li key={h} className="rounded-md bg-mist px-2.5 py-1 text-[0.68rem] font-medium text-graphite ring-1 ring-line">
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto pt-6">
                    <Link
                      href={`/products/${it.slug}`}
                      tabIndex={copy ? -1 : undefined}
                      aria-label={`View ${it.name}`}
                      className="xd-btn !h-11"
                    >
                      View product <ArrowUpRight aria-hidden className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

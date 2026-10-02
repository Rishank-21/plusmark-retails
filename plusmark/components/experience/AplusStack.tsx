"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APLUS_HEIGHT, APLUS_WIDTH, type AplusLine } from "@/data/aplus";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The full Amazon A+ explainer set for each line as a deck of sticky cards. On desktop a sticky
 * side panel names the line, captions the banner currently on top of the deck and tracks
 * progress through the set; each banner slides up and settles on the previous one.
 */
export function AplusStack({ lines }: { lines: AplusLine[] }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(0);
  const deck = useRef<HTMLOListElement>(null);
  const line = lines[active];
  const total = line.images.length;

  // banner on top of the deck = the last card whose top has reached the sticky line
  useEffect(() => {
    const el = deck.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const cards = el.querySelectorAll<HTMLElement>("[data-aplus-card]");
      const line = window.innerHeight * 0.45;
      let idx = 0;
      cards.forEach((c, i) => {
        if (c.getBoundingClientRect().top < line) idx = i;
      });
      setInView(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  const choose = (i: number) => {
    setActive(i);
    setInView(0);
    // bring the start of the new deck into view instead of leaving the reader mid-stack
    const top = deck.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollBy({ top: top - 120, behavior: "smooth" });
  };

  return (
    <section id="xd-explained" aria-labelledby="xd-explained-title" className="relative z-10 py-24 md:py-32">
      <div className="mx-auto max-w-[110rem] px-5 sm:px-10 lg:pr-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="xd-eyebrow">Explained, banner by banner</p>
            <h2 id="xd-explained-title" className="mt-4 max-w-3xl font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">
              Every feature, <span className="xd-grad-text">stacked up.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-steel md:text-lg">
              The same explainer banners buyers see on Amazon, one product line at a time: features, mounting, corners, uses and sizes.
            </p>
          </div>
          <div role="tablist" aria-label="Product line" className="xd-glass xd-noscroll-bar flex max-w-full gap-1 overflow-x-auto rounded-lg p-1">
            {lines.map((l, i) => (
              <button
                key={l.id}
                role="tab"
                type="button"
                id={`xd-tab-${l.id}`}
                aria-selected={i === active}
                aria-controls="xd-stack-panel"
                onClick={() => choose(i)}
                className={cn(
                  "relative shrink-0 rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                  i === active ? "text-white" : "text-steel hover:text-graphite",
                )}
              >
                {i === active && (
                  <motion.span
                    layoutId="xd-tab-pill"
                    className="absolute inset-0 rounded-md bg-graphite"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{l.short}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[19rem_1fr] lg:gap-14 xl:grid-cols-[22rem_1fr]">
          {/* Sticky context panel (desktop). On phones the caption sits under each card instead. */}
          <aside className="hidden lg:block">
            <div className="xd-glass sticky top-[108px] rounded-xl p-7">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <p className="xd-label">Product line</p>
                  <p className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-graphite">{line.name}</p>
                  <p className="mt-3 text-sm leading-relaxed text-steel">{line.tagline}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-7 border-t border-line pt-6">
                <div className="flex items-baseline justify-between">
                  <p className="xd-label">Banner</p>
                  <p className="font-mono text-xs tabular-nums text-graphite">
                    {String(inView + 1).padStart(2, "0")}
                    <span className="text-alu-dark"> / {String(total).padStart(2, "0")}</span>
                  </p>
                </div>
                <div aria-hidden className="mt-3 flex gap-1">
                  {line.images.map((img, i) => (
                    <span
                      key={img.src}
                      className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= inView ? "bg-accent" : "bg-line")}
                    />
                  ))}
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={`${line.id}-${inView}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    aria-live="polite"
                    className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-graphite"
                  >
                    {line.images[inView]?.alt}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {line.productSlug && (
                  <Link href={`/products/${line.productSlug}`} className="xd-btn justify-center">
                    View product <ArrowUpRight aria-hidden className="size-4" />
                  </Link>
                )}
                <a href={line.amazonUrl} target="_blank" rel="noopener noreferrer" className="xd-btn-ghost justify-center">
                  Buy on Amazon <ArrowUpRight aria-hidden className="size-4" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </div>
          </aside>

          <ol ref={deck} id="xd-stack-panel" role="tabpanel" aria-labelledby={`xd-tab-${line.id}`} className="min-w-0">
            {line.images.map((img, i) => (
              <li
                key={img.src}
                data-aplus-card
                className="sticky mb-[9vh] last:mb-0"
                style={{ top: `calc(96px + ${i * 10}px)` }}
              >
                <motion.figure
                  initial={{ opacity: 0, y: 60, rotateX: 8, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                  transition={{ duration: 0.9, ease: EASE }}
                  style={{ transformPerspective: 1400, transformOrigin: "50% 100%" }}
                  className={cn(
                    "overflow-hidden rounded-xl bg-white ring-1 ring-[rgb(27_23_64/0.07)] transition-[filter] duration-500",
                    "shadow-[0_1px_2px_rgb(27_23_64/0.05),0_30px_70px_-36px_rgb(27_23_64/0.4)]",
                    // cards buried under the deck dim slightly so the top banner reads first
                    i < inView && "lg:brightness-[0.94]",
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={APLUS_WIDTH}
                    height={APLUS_HEIGHT}
                    sizes="(min-width: 1280px) 900px, (min-width: 1024px) 70vw, 100vw"
                    quality={85}
                    className="h-auto w-full"
                  />
                  <figcaption className="flex items-center justify-between gap-4 border-t border-line/70 px-5 py-3 text-xs text-steel lg:hidden">
                    <span className="line-clamp-2">{img.alt}</span>
                    <span className="shrink-0 font-mono">
                      {String(i + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
                    </span>
                  </figcaption>
                </motion.figure>
              </li>
            ))}
          </ol>
        </div>

        {/* phones / tablets: links under the deck */}
        <div className="mt-10 flex flex-wrap gap-3 lg:hidden">
          {line.productSlug && (
            <Link href={`/products/${line.productSlug}`} className="xd-btn">
              View {line.short.toLowerCase()} <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          )}
          <a href={line.amazonUrl} target="_blank" rel="noopener noreferrer" className="xd-btn-ghost">
            Buy on Amazon <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}

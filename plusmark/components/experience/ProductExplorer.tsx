"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/animations/Reveal";
import { CountUp } from "@/components/animations/CountUp";
import { cn } from "@/lib/utils";

export interface ExplorerItem {
  slug: string;
  name: string;
  categorySlug: string;
  category: string;
  series: string;
  image: string;
  imageAlt: string;
  /** second photo, shown on hover */
  alt?: string;
  highlights: string[];
}

export interface ExplorerCategory {
  slug: string;
  name: string;
  count: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;
/** cards shown per filter; the rest is one click away on the category page */
const LIMIT = 8;

/**
 * Catalog explorer for design D: category tabs over an animated product grid. Switching a tab
 * reflows the grid (cards leave, the rest glide into place, new ones rise in with a stagger).
 */
export function ProductExplorer({ id, items, categories }: { id: string; items: ExplorerItem[]; categories: ExplorerCategory[] }) {
  const [active, setActive] = useState<string>("all");
  const reduce = !!useReducedMotion();
  const list = (active === "all" ? items : items.filter((p) => p.categorySlug === active)).slice(0, LIMIT);
  const total = active === "all" ? items.length : (categories.find((c) => c.slug === active)?.count ?? 0);
  const activeName = categories.find((c) => c.slug === active)?.name;
  const titleId = `${id}-title`;

  return (
    // z-20 + extra top padding: the film above hands over with a dark gradient that reaches into
    // this section; the copy sits above it on the light part. lg:pr-32 clears the chapter rail.
    <section id={id} aria-labelledby={titleId} className="relative z-20 pb-24 pt-36 md:pb-32 md:pt-48">
      <div className="mx-auto max-w-[110rem] px-5 sm:px-10 lg:pr-32">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <p className="xd-eyebrow">The catalog</p>
            <h2 id={titleId} className="mt-4 max-w-3xl font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">
              Every board, <span className="xd-grad-text">one frame system.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
              White, chalk, notice, magnetic and ceramic boards, stands, clipboards and school benches, all made by Plusmark.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="flex gap-8">
            <p>
              <span className="block font-display text-5xl font-semibold tracking-[-0.04em] text-graphite">
                <CountUp to={items.length} />
              </span>
              <span className="xd-label mt-1 block">Products</span>
            </p>
            <p>
              <span className="block font-display text-5xl font-semibold tracking-[-0.04em] text-graphite">
                <CountUp to={categories.length} />
              </span>
              <span className="xd-label mt-1 block">Categories</span>
            </p>
          </Reveal>
        </div>

        {/* category tabs */}
        <Reveal delay={0.1} className="mt-10">
          <div role="tablist" aria-label="Product categories" className="xd-noscroll-bar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
            {[{ slug: "all", name: "All products", count: items.length }, ...categories].map((c) => {
              const on = c.slug === active;
              return (
                <button
                  key={c.slug}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`${id}-grid`}
                  onClick={() => setActive(c.slug)}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    on ? "text-white" : "bg-white text-steel ring-1 ring-line hover:text-graphite hover:ring-[rgb(79_63_217/0.35)]",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId={`${id}-tab`}
                      className="absolute inset-0 rounded-full bg-graphite"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{c.name}</span>
                  <span className={cn("relative font-mono text-[0.68rem] tabular-nums", on ? "text-white/60" : "text-alu-dark")}>{c.count}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.ul id={`${id}-grid`} role="tabpanel" aria-label={activeName ?? "All products"} layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p, i) => (
              <motion.li
                key={p.slug}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
                transition={{ duration: 0.55, ease: EASE, delay: reduce ? 0 : i * 0.05 }}
                className="group"
              >
                <Link
                  href={`/products/${p.slug}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(27_23_64/0.05),0_24px_48px_-36px_rgb(27_23_64/0.45)] ring-1 ring-[rgb(27_23_64/0.07)] transition-[transform,box-shadow] duration-500 ease-[var(--xd-ease)] hover:-translate-y-1.5 hover:shadow-[0_1px_2px_rgb(27_23_64/0.06),0_36px_70px_-36px_rgb(79_63_217/0.5)] hover:ring-[rgb(79_63_217/0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(120%_80%_at_50%_38%,#ffffff_0%,#f6f5fc_60%,#eceaf7_100%)]">
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                      className={cn(
                        "object-contain p-[8%] mix-blend-multiply transition-[transform,opacity] duration-700 ease-[var(--xd-ease)] group-hover:scale-[1.05]",
                        p.alt && "group-hover:opacity-0",
                      )}
                    />
                    {p.alt && (
                      <Image
                        src={p.alt}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                        className="scale-[0.98] object-contain p-[8%] opacity-0 mix-blend-multiply transition-[transform,opacity] duration-700 ease-[var(--xd-ease)] group-hover:scale-100 group-hover:opacity-100"
                      />
                    )}
                    <span className="absolute left-4 top-4 rounded-md bg-white/85 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-graphite ring-1 ring-line backdrop-blur">
                      {p.series}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="xd-label !text-[0.64rem]">{p.category}</p>
                    <h3 className="mt-1.5 font-display text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-graphite">{p.name}</h3>
                    {p.highlights.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-[0.78rem] text-steel">{p.highlights.slice(0, 2).join(" · ")}</p>
                    )}
                    <span className="mt-auto flex items-center justify-between pt-5 text-sm font-semibold text-graphite">
                      View product
                      <span className="flex size-9 items-center justify-center rounded-full bg-mist ring-1 ring-line transition-colors duration-300 group-hover:bg-graphite group-hover:text-white group-hover:ring-graphite">
                        <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <motion.div layout={!reduce} className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-sm text-steel" aria-live="polite">
            Showing <span className="font-semibold text-graphite">{list.length}</span> of {total} {activeName ? activeName.toLowerCase() : "products"}
          </p>
          <Link href={active === "all" ? "/products" : `/products/${active}`} className="xd-btn">
            {active === "all" ? "Browse the full catalog" : `All ${activeName}`} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

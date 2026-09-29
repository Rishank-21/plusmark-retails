"use client";

import { useEffect, useId, useMemo, useState, useDeferredValue } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import type { Category, Series } from "@/data/types";
import type { FilterItem } from "@/lib/filter";
import { cn } from "@/lib/utils";

interface ProductFilterProps {
  products: FilterItem[];
  categories: Pick<Category, "slug" | "name">[];
  series: Series[];
  /** Server-rendered product cards keyed by slug, so card markup stays server-side. */
  cards: Record<string, React.ReactNode>;
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Category / product-type / search filtering. The initial state shows every product,
 * so the full catalogue is present in the server HTML. URL query is kept in sync
 * (?category=&type=&q=) for shareable, back-button-friendly filters.
 */
export function ProductFilter({ products, categories, series, cards }: ProductFilterProps) {
  const [category, setCategory] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const searchId = useId();
  const typeId = useId();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") ?? "all");
    setType(params.get("type") ?? "all");
    setQuery(params.get("q") ?? "");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (type !== "all") params.set("type", type);
    if (deferredQuery) params.set("q", deferredQuery);
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [category, type, deferredQuery]);

  const index = useMemo(
    () =>
      products.map((p) => ({
        p,
        haystack: normalise(
          [p.name, p.series, p.shortDescription, p.categorySlug.replace(/-/g, " "), ...p.highlights, ...p.features].join(" "),
        ),
      })),
    [products],
  );

  const results = useMemo(() => {
    const terms = normalise(deferredQuery).split(" ").filter(Boolean);
    return index
      .filter(({ p }) => category === "all" || p.categorySlug === category)
      .filter(({ p }) => type === "all" || p.series === type)
      .filter(({ haystack }) => terms.every((t) => haystack.includes(t)))
      .map(({ p }) => p);
  }, [index, category, type, deferredQuery]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) map[p.categorySlug] = (map[p.categorySlug] ?? 0) + 1;
    return map;
  }, [products]);

  const reset = () => {
    setCategory("all");
    setType("all");
    setQuery("");
  };
  const active = category !== "all" || type !== "all" || !!query;

  return (
    <div>
      <div className="sticky top-[68px] z-20 -mx-[clamp(1.25rem,4vw,3rem)] border-y border-fog bg-white/90 px-[clamp(1.25rem,4vw,3rem)] py-4 backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label htmlFor={searchId} className="sr-only">
            Search products
          </label>
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-alu-dark" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search — e.g. "notice board", "ceramic", "PDS-SB"'
              className="h-11 w-full bg-mist pl-10 pr-4 text-sm text-graphite ring-1 ring-transparent placeholder:text-alu-dark focus:bg-white focus:outline-none focus:ring-graphite"
            />
          </div>
          <div className="flex gap-3">
            <label htmlFor={typeId} className="sr-only">
              Product type
            </label>
            <select
              id={typeId}
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 min-w-0 flex-1 bg-mist px-3 text-sm text-graphite ring-1 ring-transparent focus:outline-none focus:ring-graphite md:w-52 md:flex-none"
            >
              <option value="all">All product types</option>
              {series.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {active && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center gap-1.5 px-3 text-xs font-semibold text-steel hover:text-graphite"
              >
                <X aria-hidden className="size-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        <div role="group" aria-label="Filter by category" className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {[{ slug: "all", name: "All" }, ...categories].map((c) => {
            const on = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={on}
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "relative shrink-0 px-3.5 py-2 text-xs font-semibold transition-colors",
                  on ? "text-white" : "text-steel hover:text-graphite",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 bg-graphite"
                    transition={{ type: "spring", stiffness: 420, damping: 38 }}
                  />
                )}
                <span className="relative">
                  {c.name}
                  {c.slug !== "all" && <span className="ml-1.5 font-mono text-[0.6rem] opacity-60">{counts[c.slug]}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel" aria-live="polite">
        {results.length} {results.length === 1 ? "product" : "products"}
      </p>

      <motion.ul layout className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {results.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {cards[p.slug]}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {results.length === 0 && (
        <div className="mt-6 bg-mist p-10 text-center">
          <p className="font-display text-xl font-semibold">No products match your filters.</p>
          <p className="mt-2 text-sm text-steel">Try a different search term or clear the filters.</p>
          <button type="button" onClick={reset} className="mt-5 bg-graphite px-5 py-3 text-xs font-semibold text-white">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

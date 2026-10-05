"use client";

import { useEffect, useId, useMemo, useState, useDeferredValue } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import type { Category, CategorySlug, Series } from "@/data/types";
import type { FilterItem } from "@/lib/filter";
import { subcategoryConfigs } from "@/data/subcategories";
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
  const [subtype, setSubtype] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const searchId = useId();
  const typeId = useId();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category") ?? "all";
    const t = params.get("type") ?? "all";
    setCategory(cat);
    if (cat !== "all" && subcategoryConfigs[cat as CategorySlug]) {
      const match = subcategoryConfigs[cat as CategorySlug]?.subcategories.some((s) => s.id === t);
      if (match) {
        setSubtype(t);
      } else {
        setType(t);
      }
    } else {
      setType(t);
    }
    setQuery(params.get("q") ?? "");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (subtype !== "all") params.set("type", subtype);
    else if (type !== "all") params.set("type", type);
    if (deferredQuery) params.set("q", deferredQuery);
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [category, subtype, type, deferredQuery]);

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

  const activeSubConfig = category !== "all" ? subcategoryConfigs[category as CategorySlug] : null;
  const activeSub = activeSubConfig?.subcategories.find((s) => s.id === subtype);

  const results = useMemo(() => {
    const terms = normalise(deferredQuery).split(" ").filter(Boolean);
    return index
      .filter(({ p }) => {
        if (category === "all") return true;
        if (activeSub) return activeSub.productSlugs.includes(p.slug);
        if (activeSubConfig) {
          const allSlugs = new Set(activeSubConfig.subcategories.flatMap((s) => s.productSlugs));
          return allSlugs.has(p.slug) || p.categorySlug === category;
        }
        return p.categorySlug === category;
      })
      .filter(({ p }) => type === "all" || p.series === type)
      .filter(({ haystack }) => terms.every((t) => haystack.includes(t)))
      .map(({ p }) => p);
  }, [index, category, subtype, activeSub, activeSubConfig, type, deferredQuery]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of categories) {
      const sub = subcategoryConfigs[c.slug as CategorySlug];
      if (sub) {
        const allSlugs = new Set(sub.subcategories.flatMap((s) => s.productSlugs));
        map[c.slug] = allSlugs.size;
      } else {
        map[c.slug] = products.filter((p) => p.categorySlug === c.slug).length;
      }
    }
    return map;
  }, [categories, products]);

  const reset = () => {
    setCategory("all");
    setSubtype("all");
    setType("all");
    setQuery("");
  };
  const active = category !== "all" || subtype !== "all" || type !== "all" || !!query;

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
              <option value="all">All series</option>
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
                onClick={() => {
                  setCategory(c.slug);
                  setSubtype("all");
                }}
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

        {activeSubConfig && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-fog/70 pt-2.5">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
              {activeSubConfig.filterLabel}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSubtype("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  subtype === "all"
                    ? "bg-graphite text-white shadow-sm"
                    : "bg-mist text-steel hover:bg-fog hover:text-graphite"
                )}
              >
                All
              </button>
              {activeSubConfig.subcategories.map((sub) => {
                const on = subtype === sub.id;
                const subCount = sub.productSlugs.length;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubtype(sub.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                      on
                        ? "bg-accent text-white shadow-sm"
                        : "bg-mist text-steel hover:bg-fog hover:text-graphite"
                    )}
                  >
                    <span>{sub.label}</span>
                    <span className={cn("font-mono text-[0.62rem]", on ? "text-white/80" : "text-steel")}>
                      ({subCount})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
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

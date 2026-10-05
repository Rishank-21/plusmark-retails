"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Subcategory } from "@/data/subcategories";
import { cn } from "@/lib/utils";

interface Tab {
  slug: string;
  name: string;
  products: string[];
  href: string;
  subcategories?: Subcategory[];
  filterLabel?: string;
}

/** Category tabs for the homepage collection. Cards are server-rendered and passed in. */
export function HomeCollection({ tabs, cards }: { tabs: Tab[]; cards: Record<string, React.ReactNode> }) {
  const [active, setActive] = useState(tabs[0].slug);
  const [activeSub, setActiveSub] = useState<string>("all");
  const tab = tabs.find((t) => t.slug === active) ?? tabs[0];

  const handleTabChange = (slug: string) => {
    setActive(slug);
    setActiveSub("all");
  };

  const selectedSub = tab.subcategories?.find((s) => s.id === activeSub);
  const displayProducts = selectedSub
    ? tab.products.filter((slug) => selectedSub.productSlugs.includes(slug))
    : tab.products.slice(0, 8);

  return (
    <div>
      <div role="tablist" aria-label="Product categories" className="-mx-1 flex gap-1 overflow-x-auto border-b border-fog pb-px [scrollbar-width:none]">
        {tabs.map((t) => {
          const on = t.slug === active;
          return (
            <button
              key={t.slug}
              role="tab"
              id={`tab-${t.slug}`}
              aria-selected={on}
              aria-controls="collection-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => handleTabChange(t.slug)}
              onKeyDown={(e) => {
                const i = tabs.findIndex((x) => x.slug === active);
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
                  handleTabChange(next.slug);
                  document.getElementById(`tab-${next.slug}`)?.focus();
                }
              }}
              className={cn(
                "relative shrink-0 px-3.5 pb-4 pt-2 text-[0.8rem] font-semibold transition-colors",
                on ? "text-graphite" : "text-steel hover:text-graphite",
              )}
            >
              {t.name}
              {on && (
                <motion.span layoutId="collection-tab" className="absolute inset-x-3 -bottom-px h-[2px] bg-accent" transition={{ type: "spring", stiffness: 420, damping: 38 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Subcategory Filter Bar on Home Page */}
      {tab.subcategories && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-fog pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
              {tab.filterLabel ?? "Type"}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveSub("all")}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                  activeSub === "all"
                    ? "bg-graphite text-white shadow-sm"
                    : "bg-mist text-steel hover:bg-fog hover:text-graphite"
                )}
              >
                All ({tab.products.length})
              </button>
              {tab.subcategories.map((sub) => {
                const on = activeSub === sub.id;
                const count = tab.products.filter((p) => sub.productSlugs.includes(p)).length;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSub(sub.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                      on
                        ? "bg-accent text-white shadow-sm"
                        : "bg-mist text-steel hover:bg-fog hover:text-graphite"
                    )}
                  >
                    <span>{sub.label}</span>
                    <span className={cn("font-mono text-[0.62rem]", on ? "text-white/80" : "text-steel")}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {selectedSub && (
            <p className="hidden text-xs text-steel md:block">
              {selectedSub.description}
            </p>
          )}
        </div>
      )}

      <div id="collection-panel" role="tabpanel" aria-labelledby={`tab-${tab.slug}`} className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={`${tab.slug}-${activeSub}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {displayProducts.map((slug) => (
              <li key={slug}>{cards[slug]}</li>
            ))}
          </motion.ul>
        </AnimatePresence>
        <div className="mt-10 flex justify-end">
          <Link
            href={selectedSub ? `${tab.href}?type=${selectedSub.id}` : tab.href}
            className="group inline-flex items-center gap-2 text-sm font-semibold"
          >
            <span className="link-underline">
              {tab.slug === "featured"
                ? "View all products"
                : selectedSub
                ? `View all ${selectedSub.label} ${tab.name}`
                : `View all ${tab.name}`}
            </span>
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

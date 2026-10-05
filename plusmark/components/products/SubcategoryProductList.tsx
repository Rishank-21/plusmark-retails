"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, Product } from "@/data/types";
import type { CategorySubcategoriesConfig } from "@/data/subcategories";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

interface SubcategoryProductListProps {
  category: Category;
  config: CategorySubcategoriesConfig;
  allProducts: Product[];
  listingOnly: boolean;
}

export function SubcategoryProductList({
  category,
  config,
  allProducts,
  listingOnly,
}: SubcategoryProductListProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Read URL query parameter ?type= on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get("type");
    if (typeParam) {
      const match = config.subcategories.find(
        (s) => s.id === typeParam.toLowerCase() || s.label.toLowerCase() === typeParam.toLowerCase()
      );
      if (match) {
        setActiveTab(match.id);
      }
    }
  }, [config]);

  // Update URL without page reload
  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    if (tabId === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", tabId);
    }
    window.history.replaceState(null, "", url.toString());
  };

  const activeSubcategory = config.subcategories.find((s) => s.id === activeTab);

  const displayedProducts =
    activeTab === "all"
      ? allProducts
      : allProducts.filter((p) => activeSubcategory?.productSlugs.includes(p.slug));

  return (
    <div>
      {/* Subcategory Selector Tabs */}
      <div className="mb-10 flex flex-col gap-4 border-b border-fog pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel">
            {config.filterLabel}:
          </span>
          <div
            role="tablist"
            aria-label={`${category.name} types`}
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "all"}
              onClick={() => selectTab("all")}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200",
                activeTab === "all"
                  ? "bg-graphite text-white shadow-sm"
                  : "bg-mist text-steel hover:bg-fog hover:text-graphite"
              )}
            >
              {config.allLabel} ({allProducts.length})
            </button>

            {config.subcategories.map((sub) => {
              const count = allProducts.filter((p) => sub.productSlugs.includes(p.slug)).length;
              const isSelected = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => selectTab(sub.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200",
                    isSelected
                      ? "bg-accent text-white shadow-sm"
                      : "bg-mist text-steel hover:bg-fog hover:text-graphite"
                  )}
                >
                  <span>{sub.label}</span>
                  <span
                    className={cn(
                      "font-mono text-[0.68rem]",
                      isSelected ? "text-white/80" : "text-steel"
                    )}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Short contextual description of active selection */}
        {activeSubcategory && (
          <p className="max-w-md text-xs leading-relaxed text-steel">
            {activeSubcategory.description}
          </p>
        )}
      </div>

      {listingOnly && (
        <p className="mb-8 max-w-2xl border-l-2 border-accent bg-accent-soft/50 px-5 py-4 text-sm text-graphite">
          The Plusmark catalog lists these models by name. Request an enquiry for dimensions, materials and finishes.
        </p>
      )}

      {/* Animated Product Grid */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {displayedProducts.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {displayedProducts.length === 0 && (
        <p className="py-12 text-center text-sm text-steel">
          No products found in this category.
        </p>
      )}
    </div>
  );
}

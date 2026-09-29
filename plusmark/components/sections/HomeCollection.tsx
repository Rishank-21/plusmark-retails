"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  slug: string;
  name: string;
  products: string[];
  href: string;
}

/** Category tabs for the homepage collection. Cards are server-rendered and passed in. */
export function HomeCollection({ tabs, cards }: { tabs: Tab[]; cards: Record<string, React.ReactNode> }) {
  const [active, setActive] = useState(tabs[0].slug);
  const tab = tabs.find((t) => t.slug === active) ?? tabs[0];

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
              onClick={() => setActive(t.slug)}
              onKeyDown={(e) => {
                const i = tabs.findIndex((x) => x.slug === active);
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
                  setActive(next.slug);
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

      <div id="collection-panel" role="tabpanel" aria-labelledby={`tab-${tab.slug}`} className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={tab.slug}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {tab.products.map((slug) => (
              <li key={slug}>{cards[slug]}</li>
            ))}
          </motion.ul>
        </AnimatePresence>
        <div className="mt-10 flex justify-end">
          <Link href={tab.href} className="group inline-flex items-center gap-2 text-sm font-semibold">
            <span className="link-underline">{tab.slug === "featured" ? "View all products" : `View all ${tab.name}`}</span>
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

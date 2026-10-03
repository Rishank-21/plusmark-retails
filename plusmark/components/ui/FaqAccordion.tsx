"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import type { FaqItem } from "@/data/faq";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FaqAccordionProps {
  items: ReadonlyArray<FaqItem>;
  /** Index of item to open by default, or true to open first, or -1/false for all closed. */
  openFirst?: boolean;
  className?: string;
  categoryLabel?: string;
}

/**
 * Premium accessible animated FAQ Accordion.
 */
export function FaqAccordion({ items, openFirst = false, className, categoryLabel }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(openFirst ? 0 : null);
  const reduce = !!useReducedMotion();

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className={cn("space-y-3.5", className)}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const qid = `faq-q-${item.q.slice(0, 15).replace(/\W/g, "-")}-${i}`;

        return (
          <div
            key={item.q}
            className={cn(
              "group overflow-hidden rounded-2xl border bg-white transition-all duration-300",
              isOpen
                ? "border-graphite/20 shadow-[0_8px_30px_rgb(27_23_64/0.08)] ring-1 ring-graphite/10"
                : "border-line/80 hover:border-graphite/30 hover:shadow-[0_4px_20px_rgb(27_23_64/0.04)]",
            )}
          >
            <h3>
              <button
                type="button"
                id={qid}
                aria-expanded={isOpen}
                aria-controls={`${qid}-ans`}
                onClick={() => toggle(i)}
                className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors sm:p-6"
              >
                <span className="flex items-start gap-3 sm:gap-4">
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[0.68rem] font-medium transition-colors",
                      isOpen ? "bg-graphite text-white" : "bg-mist text-alu-dark group-hover:text-graphite",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex flex-col gap-1">
                    {categoryLabel && (
                      <span className="font-mono text-[0.62rem] uppercase tracking-wider text-accent font-semibold">
                        {categoryLabel}
                      </span>
                    )}
                    <span className="font-display text-base font-semibold leading-snug text-graphite sm:text-lg">
                      {item.q}
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    isOpen
                      ? "rotate-45 border-graphite bg-graphite text-white shadow-sm"
                      : "border-line bg-mist text-graphite group-hover:border-graphite/40 group-hover:bg-white",
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${qid}-ans`}
                  role="region"
                  aria-labelledby={qid}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                >
                  <div className="border-t border-line/60 px-5 pb-6 pt-4 sm:px-6 sm:pl-16">
                    <p className="text-[0.95rem] leading-relaxed text-steel">{item.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

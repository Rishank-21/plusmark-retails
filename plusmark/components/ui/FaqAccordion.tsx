import { Plus } from "lucide-react";
import type { FaqItem } from "@/data/faq";
import { cn } from "@/lib/utils";

interface FaqAccordionProps {
  items: ReadonlyArray<FaqItem>;
  /** Open the first item by default. */
  openFirst?: boolean;
  className?: string;
}

/**
 * Accessible accordion built on native <details>/<summary>: keyboard and screen-reader support
 * come for free and the answers stay in the server-rendered HTML (and in FAQPage JSON-LD).
 */
export function FaqAccordion({ items, openFirst = false, className }: FaqAccordionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, i) => (
        <details
          key={item.q}
          open={openFirst && i === 0}
          className="group card-premium !transform-none overflow-hidden open:shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-lift)]"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 md:px-7 md:py-6 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-base font-semibold leading-snug text-graphite md:text-lg">{item.q}</span>
            <span
              aria-hidden
              className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-graphite ring-1 ring-fog transition-[transform,background-color,color] duration-500 ease-[var(--ease-premium)] group-open:rotate-45 group-open:bg-graphite group-open:text-white"
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <div className="px-6 pb-6 md:px-7">
            <div className="hairline mb-5" />
            <p className="max-w-3xl text-[0.95rem] leading-relaxed text-steel">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

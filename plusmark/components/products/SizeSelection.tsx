"use client";

import { createContext, useContext, useState } from "react";
import type { Product } from "@/data/types";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SizeOption = Product["sizeOptions"][number];

interface SizeState {
  options: SizeOption[];
  selected: SizeOption | null;
  select: (s: SizeOption) => void;
}

const SizeContext = createContext<SizeState | null>(null);

/** Shares the selected board size between the picker, the viewer and the enquiry link. */
export function SizeProvider({ options, children }: { options: SizeOption[]; children: React.ReactNode }) {
  const [selected, setSelected] = useState<SizeOption | null>(null);
  return <SizeContext.Provider value={{ options, selected, select: setSelected }}>{children}</SizeContext.Provider>;
}

/** Selected size, or null when none is picked / the viewer is used outside a SizeProvider. */
export function useSelectedSize(): SizeOption | null {
  return useContext(SizeContext)?.selected ?? null;
}

export function SizePicker({ className }: { className?: string }) {
  const ctx = useContext(SizeContext);
  if (!ctx || ctx.options.length === 0) return null;
  const { options, selected, select } = ctx;
  return (
    <fieldset className={className}>
      <legend className="eyebrow mb-3 text-[0.75rem]">
        Size <span className="normal-case tracking-normal text-steel">{selected ? `· ${selected.label}` : "· select to preview"}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((s) => {
          const on = selected?.label === s.label;
          return (
            <button
              key={s.label}
              type="button"
              aria-pressed={on}
              onClick={() => select(s)}
              className={cn(
                "min-h-10 px-3.5 py-2 font-mono text-[0.8125rem] transition-colors focus-visible:outline-offset-2",
                on ? "bg-graphite text-white" : "bg-white text-graphite ring-1 ring-line hover:ring-graphite",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** "Request Enquiry" that carries the selected size to the contact form. */
export function SizeEnquiryButton({ slug, children }: { slug: string; children: React.ReactNode }) {
  const selected = useSelectedSize();
  const q = new URLSearchParams({ product: slug });
  if (selected) q.set("size", selected.label);
  return (
    <ButtonLink href={`/contact?${q.toString()}#enquiry`} magnetic>
      {children}
    </ButtonLink>
  );
}

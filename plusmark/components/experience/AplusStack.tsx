"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { APLUS_HEIGHT, APLUS_WIDTH, type AplusLine } from "@/data/aplus";
import { cn } from "@/lib/utils";

/**
 * The full Amazon A+ explainer set for each line as a deck of sticky cards: each banner slides
 * up and settles on top of the previous one while you scroll.
 */
export function AplusStack({ lines }: { lines: AplusLine[] }) {
  const [active, setActive] = useState(0);
  const line = lines[active];

  return (
    <section id="xd-explained" aria-labelledby="xd-explained-title" className="relative z-10 py-24 md:py-32">
      <div className="mx-auto max-w-[110rem] px-5 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Explained, banner by banner</p>
            <h2 id="xd-explained-title" className="mt-3 max-w-3xl font-display text-[clamp(1.8rem,4vw,3.6rem)] font-semibold leading-[1.02] text-graphite">
              Every feature, <span className="xd-grad-text">stacked up.</span>
            </h2>
          </div>
          <div role="tablist" aria-label="Product line" className="xd-glass xd-noscroll-bar flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5">
            {lines.map((l, i) => (
              <button
                key={l.id}
                role="tab"
                type="button"
                id={`xd-tab-${l.id}`}
                aria-selected={i === active}
                aria-controls="xd-stack-panel"
                onClick={() => setActive(i)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  i === active ? "text-white" : "text-steel hover:text-graphite",
                )}
              >
                {i === active && (
                  <motion.span
                    layoutId="xd-tab-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#12c2e9]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{l.short}</span>
              </button>
            ))}
          </div>
        </div>

        <ol id="xd-stack-panel" role="tabpanel" aria-labelledby={`xd-tab-${line.id}`} className="mx-auto mt-14 max-w-6xl">
          {line.images.map((img, i) => (
            <li
              key={img.src}
              className="sticky mb-[12vh] last:mb-0"
              style={{ top: `calc(12vh + ${i * 12}px)` }}
            >
              <motion.figure
                initial={{ opacity: 0, y: 80, rotateX: 18, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformPerspective: 1400, transformOrigin: "50% 100%" }}
                className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_80px_-30px_rgb(91_61_245/0.45)] ring-1 ring-[#6d4aff]/15"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={APLUS_WIDTH}
                  height={APLUS_HEIGHT}
                  sizes="(min-width: 1152px) 1152px, 100vw"
                  quality={85}
                  className="h-auto w-full"
                />
                <figcaption className="flex items-center justify-between gap-4 px-5 py-3 text-xs text-steel">
                  <span className="line-clamp-1">{img.alt}</span>
                  <span className="shrink-0 font-mono">
                    {String(i + 1).padStart(2, "0")}/{String(line.images.length).padStart(2, "0")}
                  </span>
                </figcaption>
              </motion.figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

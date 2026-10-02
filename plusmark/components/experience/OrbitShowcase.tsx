"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { pinProgress, showroomState, type AnchorName } from "./scroll";

export interface OrbitItem {
  slug: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  image: string;
  imageAlt: string;
  /** short catalog specs for the panel */
  specs: { label: string; value: string }[];
  /** close-up beat: the part the camera moves to, with its annotation */
  detail: { anchor: AnchorName; label: string; text: string };
}

const EASE = [0.22, 1, 0.36, 1] as const;
/** Scroll length of one product chapter, in viewport heights (was 100: too quick to read). */
const CHAPTER_VH = 240;

/** Where each annotation card sits relative to its anchor point (px). */
const ANNOT_OFFSET: Record<AnchorName, { dx: number; dy: number }> = {
  frame: { dx: -150, dy: -84 },
  surface: { dx: -170, dy: 48 },
  corner: { dx: 120, dy: 76 },
};

/**
 * Pinned showroom chapter. The WebGL boards take turns in #xd-orbit-stage (see SceneCanvas):
 * each product gets an overview, a turn, a close-up of one part, then recedes while the next
 * one comes forward from depth. This component renders the HTML copy for the product in focus.
 */
export function OrbitShowcase({ items }: { items: OrbitItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const n = items.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = pinProgress(ref.current);
      const st = showroomState(p, n);
      setIndex((i) => (i === st.index ? i : st.index));
      bars.current.forEach((el, i) => {
        if (el) el.style.transform = `scaleX(${Math.max(0, Math.min(1, p * n - i))})`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [n]);

  /** Jump to a product's chapter (category indicator). */
  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.08) / n) * span, behavior: "smooth" });
  };

  const item = items[index];

  return (
    <section id="xd-orbit" ref={ref} aria-labelledby="xd-orbit-title" className="relative" style={{ height: `${n * CHAPTER_VH + 40}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[110rem] flex-col px-5 pb-6 pt-20 sm:px-10 md:pb-10 md:pt-24 lg:pr-24">
          {/* category indicator */}
          <div className="flex items-center justify-between gap-6">
            <p className="xd-eyebrow">The showroom</p>
            {/* glass pill: the tabs often sit over a dark (chalk / notice) board */}
            <nav aria-label="Showroom products" className="xd-glass xd-noscroll-bar overflow-x-auto rounded-xl !bg-white/90 [scrollbar-width:none]">
              <ul className="flex gap-1 px-1">
                {items.map((it, i) => (
                  <li key={it.slug}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === index ? "true" : undefined}
                      className={cn(
                        "relative whitespace-nowrap px-3 py-2 text-[0.8rem] font-medium transition-colors",
                        i === index ? "text-graphite" : "text-steel hover:text-graphite",
                      )}
                    >
                      {it.category}
                      {i === index && (
                        <motion.span
                          layoutId="xd-cat-indicator"
                          className="absolute inset-x-3 -bottom-px h-px bg-accent"
                          transition={{ type: "spring", stiffness: 260, damping: 30 }}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4 md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] md:grid-rows-1 md:items-center md:gap-10">
            {/* product slot (the 3D board is composed here) */}
            <div id="xd-orbit-stage" className="relative h-full min-h-[14rem] md:order-2 md:h-[68svh]">
              <div className="xd-poster absolute inset-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={item.slug}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="object-contain mix-blend-multiply"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="xd-glass rounded-xl p-5 md:order-1 md:p-7">
              <h2 id="xd-orbit-title" className="sr-only">
                Featured boards
              </h2>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  aria-live="polite"
                >
                  <p className="flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.08em] text-alu-dark">
                    <span className="text-graphite">{String(index + 1).padStart(2, "0")}</span>
                    <span aria-hidden className="h-px w-6 bg-line" />
                    {String(n).padStart(2, "0")}
                    <span className="xd-label ml-auto !text-[0.66rem]">{item.category}</span>
                  </p>
                  <p className="mt-4 font-display text-[clamp(1.35rem,2.2vw,2rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-graphite">
                    {item.name}
                  </p>
                  <p className="mt-3 line-clamp-2 text-[0.92rem] leading-relaxed text-steel md:line-clamp-3">{item.description}</p>
                  <dl className="mt-5 hidden border-t border-line/80 sm:block">
                    {item.specs.map((s) => (
                      <div key={s.label} className="flex items-baseline justify-between gap-6 border-b border-line/80 py-2.5">
                        <dt className="xd-label !text-[0.64rem]">{s.label}</dt>
                        <dd className="text-right text-[0.85rem] font-medium text-graphite">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 hidden text-[0.8rem] leading-relaxed text-steel md:block">
                    <span className="font-medium text-accent">{item.detail.label}.</span> {item.detail.text}
                  </p>
                  <Link href={`/products/${item.slug}`} className="xd-btn mt-5 !h-11 md:mt-6">
                    View product <ArrowUpRight aria-hidden className="size-4" />
                  </Link>
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 flex gap-1.5" aria-hidden>
                {items.map((it, i) => (
                  <span key={it.slug} className="h-px flex-1 overflow-hidden bg-line">
                    <span
                      ref={(el) => {
                        bars.current[i] = el;
                      }}
                      className="block h-full origin-left scale-x-0 bg-graphite"
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close-up annotations, glued to the part on the 3D board (desktop, WebGL only) */}
      {items.map((it, i) => {
        const { dx, dy } = ANNOT_OFFSET[it.detail.anchor];
        return (
          <div key={it.slug} aria-hidden className="xd-anchor pointer-events-none" data-xd-anchor={it.detail.anchor} data-xd-board={i} data-xd-kind="annot">
            <svg className="absolute left-0 top-0 overflow-visible" width="1" height="1">
              <path className="xd-annot-halo" d={`M0 0 L${dx * 0.55} ${dy} L${dx} ${dy}`} />
              <path className="xd-annot-line" d={`M0 0 L${dx * 0.55} ${dy} L${dx} ${dy}`} />
              {/* white-ringed dot reads on any board colour */}
              <circle cx="0" cy="0" r="8" fill="rgb(255 255 255 / 0.9)" />
              <circle cx="0" cy="0" r="6.5" fill="none" stroke="#4f3fd9" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3" fill="#4f3fd9" />
            </svg>
            <div
              className="xd-annot-card absolute w-60"
              style={{ left: dx, top: dy, translate: `${dx < 0 ? "-100%" : "0"} -50%`, textAlign: dx < 0 ? "right" : "left" }}
            >
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-accent">{it.detail.label}</p>
              <p className="mt-1 text-[0.8rem] leading-snug text-graphite">{it.detail.text}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
